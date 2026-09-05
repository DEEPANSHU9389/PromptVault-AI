import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../firebase';

/**
 * Compresses an image file client-side using HTML Canvas to a target max size (~300KB).
 */
export const compressImageClientSide = (
  file: File,
  maxWidthOrHeight = 1200,
  targetSizeKB = 300
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // If already small enough (under 300KB) and correct type, return file directly
    if (file.size <= targetSizeKB * 1024 && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          } else {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const compressQuality = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Image canvas conversion failed'));
                return;
              }
              // If blob is still larger than targetKB and quality is above 0.35, reduce quality
              if (blob.size > targetSizeKB * 1024 && quality > 0.35) {
                compressQuality(quality - 0.15);
              } else {
                resolve(blob);
              }
            },
            'image/jpeg',
            quality
          );
        };

        compressQuality(0.8);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Uploads an image file to Firebase Storage with client-side compression and real-time progress callbacks (0 - 100%).
 */
export const uploadImageWithProgress = async (
  file: File,
  folder = 'prompt-assets',
  onProgress: (progress: number) => void
): Promise<string> => {
  onProgress(5); // Started compression
  const compressedBlob = await compressImageClientSide(file, 1200, 300);
  onProgress(15); // Compression completed

  const filename = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-0.]/g, '_')}`;

  if (storage && isFirebaseConfigured) {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(storageRef, compressedBlob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const rawProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // Scale raw upload progress into 15% -> 98%
          const scaled = Math.min(98, Math.round(15 + (rawProgress * 0.83)));
          onProgress(scaled);
        },
        (error) => {
          console.error('Firebase Storage upload error:', error);
          // Fallback to local Data URL on storage error
          const reader = new FileReader();
          reader.onloadend = () => {
            onProgress(100);
            resolve(reader.result as string);
          };
          reader.readAsDataURL(compressedBlob);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onProgress(100);
          resolve(downloadURL);
        }
      );
    });
  }

  // Fallback for offline / unconfigured storage
  return new Promise((resolve) => {
    let current = 15;
    const interval = setInterval(() => {
      current += 20;
      onProgress(Math.min(current, 95));
      if (current >= 95) {
        clearInterval(interval);
        const reader = new FileReader();
        reader.onloadend = () => {
          onProgress(100);
          resolve(reader.result as string);
        };
        reader.readAsDataURL(compressedBlob);
      }
    }, 120);
  });
};
