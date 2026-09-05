import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Reusable CORS configuration for Vercel Serverless Functions.
 * Reads ALLOWED_ORIGIN from environment variables and configures standard CORS headers.
 * Returns false if the request was an OPTIONS preflight (handled and terminated) or origin disallowed.
 */
export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin as string | undefined;
  const allowedOriginsEnv = process.env.ALLOWED_ORIGIN || '';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...(allowedOriginsEnv ? allowedOriginsEnv.split(',').map((o) => o.trim()).filter(Boolean) : []),
  ];

  // Set standard CORS headers
  if (origin) {
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  // Handle preflight OPTIONS request early
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return false;
  }

  return true;
}
