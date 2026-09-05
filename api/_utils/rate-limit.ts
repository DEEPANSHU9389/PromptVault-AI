import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Best-effort in-memory rate limiter for Vercel Serverless Functions.
 * Note: Since serverless functions are stateless and may execute in multiple isolated instances,
 * this provides per-instance rate limiting for the free/hobby tier. For strict distributed rate limiting
 * at production scale, connect Vercel KV or Upstash Redis.
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  limit: number = 20,
  windowMs: number = 60 * 1000
): boolean {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket?.remoteAddress ||
    'anonymous';

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    res.status(429).json({ error: 'Too many AI requests, please try again after a minute.' });
    return false;
  }

  record.count += 1;
  return true;
}
