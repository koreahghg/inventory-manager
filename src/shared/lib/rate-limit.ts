type Bucket = { count: number; firstAttemptAt: number };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/**
 * Best-effort, in-memory only — resets on cold start and isn't shared across
 * serverless instances. A real defense needs an external store (e.g. Upstash
 * Redis); this is a lightweight extra layer on top of Supabase Auth's own
 * rate limiting, not a replacement for it.
 */
const buckets = new Map<string, Bucket>();

export function isRateLimited(key: string): boolean {
  const bucket = buckets.get(key);
  if (!bucket) return false;
  if (Date.now() - bucket.firstAttemptAt > WINDOW_MS) {
    buckets.delete(key);
    return false;
  }
  return bucket.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string): void {
  const bucket = buckets.get(key);
  if (!bucket || Date.now() - bucket.firstAttemptAt > WINDOW_MS) {
    buckets.set(key, { count: 1, firstAttemptAt: Date.now() });
    return;
  }
  bucket.count += 1;
}

export function clearAttempts(key: string): void {
  buckets.delete(key);
}
