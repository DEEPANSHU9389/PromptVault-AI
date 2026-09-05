import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_utils/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!applyCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  return res.json({ status: 'ok', app: 'PromptVault AI' });
}
