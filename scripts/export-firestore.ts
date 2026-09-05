/**
 * ==============================================================================
 * Firestore Database Export Utility — PromptVault AI
 * ==============================================================================
 *
 * HOW TO RUN MANUALLY:
 * -------------------
 * 1. Generate a Firebase Service Account key:
 *    - Go to Firebase Console (https://console.firebase.google.com)
 *    - Project Settings (gear icon) -> Service Accounts tab
 *    - Click "Generate new private key" and save the JSON file securely (e.g. ./serviceAccountKey.json)
 *    - NEVER commit the service account key to Git! (keep it outside or in .gitignore)
 *
 * 2. Set the environment variable and run with tsx:
 *    FIREBASE_SERVICE_ACCOUNT_PATH="./serviceAccountKey.json" npx tsx scripts/export-firestore.ts
 *
 * AUTOMATING VIA SCHEDULED GITHUB ACTIONS (Optional CI):
 * ----------------------------------------------------
 * You can set up a GitHub Action workflow (.github/workflows/backup-firestore.yml)
 * triggered by `schedule` (e.g. `cron: '0 3 * * *'` for daily 3:00 AM UTC backups):
 * - Store the Service Account JSON contents as a GitHub Repository Secret (e.g., FIREBASE_SERVICE_ACCOUNT_JSON).
 * - The workflow writes the secret to a temporary file, runs `npx tsx scripts/export-firestore.ts`,
 *   and uploads the resulting `backups/` directory as an encrypted artifact or syncs to Google Cloud Storage / S3.
 * ==============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Load environment variables from .env if present
dotenv.config();

const COLLECTIONS_TO_EXPORT = ['users', 'prompts', 'userLibraries'];

async function exportFirestore() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!serviceAccountPath) {
    console.error(
      '\n❌ [Error] Missing FIREBASE_SERVICE_ACCOUNT_PATH environment variable.\n' +
      'Please generate a service account JSON file from Firebase Console -> Project Settings -> Service Accounts,\n' +
      'and run: FIREBASE_SERVICE_ACCOUNT_PATH="./path-to-key.json" npx tsx scripts/export-firestore.ts\n'
    );
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`\n❌ [Error] Service account file not found at: ${resolvedPath}\n`);
    process.exit(1);
  }

  console.log(`🔐 Authenticating Firebase Admin SDK using service account at: ${resolvedPath}`);
  
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));

    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
  } catch (err: any) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', err.message);
    process.exit(1);
  }

  const db = getFirestore();
  
  // Custom database ID support if configured
  const customDatabaseId = process.env.VITE_FIREBASE_DATABASE_ID;
  if (customDatabaseId && customDatabaseId !== '(default)') {
    try {
      (db as any).databaseId = customDatabaseId;
    } catch {
      // Use default db instance
    }
  }

  // Create backups directory if it doesn't exist
  const backupDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`📁 Created backup directory: ${backupDir}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const datePrefix = timestamp.slice(0, 10); // YYYY-MM-DD

  console.log(`\n🚀 Starting Firestore export for collections: [${COLLECTIONS_TO_EXPORT.join(', ')}]...`);

  let totalDocsExported = 0;

  for (const collectionName of COLLECTIONS_TO_EXPORT) {
    try {
      console.log(`  ⏳ Fetching documents from collection: "${collectionName}"...`);
      const snapshot = await db.collection(collectionName).get();
      
      const docs: Array<{ id: string; data: any }> = [];
      snapshot.forEach((doc) => {
        docs.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      const outputFileName = `${datePrefix}_${collectionName}.json`;
      const outputPath = path.join(backupDir, outputFileName);

      fs.writeFileSync(outputPath, JSON.stringify(docs, null, 2), 'utf8');
      console.log(`  ✅ Saved ${docs.length} documents -> backups/${outputFileName}`);
      totalDocsExported += docs.length;
    } catch (colErr: any) {
      console.warn(`  ⚠️ Could not export collection "${collectionName}":`, colErr.message);
    }
  }

  console.log(`\n🎉 Firestore backup finished! Exported ${totalDocsExported} total documents to ${backupDir}\n`);
}

exportFirestore().catch((err) => {
  console.error('Fatal backup error:', err);
  process.exit(1);
});
