import { ApiError } from "@/lib/api-error";

// In-memory sliding-window store: clientKey -> Array of epoch timestamps
const rateLimitStore = new Map();

// Periodic cleanup of stale client keys to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let cleanupTimer = null;

function ensureCleanupTimer() {
  if (!cleanupTimer && typeof setInterval !== "undefined") {
    cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of rateLimitStore.entries()) {
        const active = timestamps.filter((t) => now - t < 300000);
        if (active.length === 0) {
          rateLimitStore.delete(key);
        } else {
          rateLimitStore.set(key, active);
        }
      }
    }, CLEANUP_INTERVAL_MS);

    if (cleanupTimer.unref) {
      cleanupTimer.unref();
    }
  }
}

/**
 * Extracts client IP from standard proxy headers.
 */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Enforces an in-memory sliding window rate limit.
 *
 * @param {string} key - Unique rate-limit identifier (userId, apiKeyId, or IP address)
 * @param {object} [options]
 * @param {number} [options.maxRequests=60] - Maximum requests allowed within the window
 * @param {number} [options.windowMs=60000] - Window size in milliseconds (default 1 minute)
 * @returns {{ limit: number, remaining: number, resetMs: number }}
 */
export function checkRateLimit(
  key,
  { maxRequests = 60, windowMs = 60000 } = {}
) {
  ensureCleanupTimer();

  const now = Date.now();
  const windowStart = now - windowMs;

  const existing = rateLimitStore.get(key) || [];
  const valid = existing.filter((t) => t > windowStart);

  if (valid.length >= maxRequests) {
    const oldestTimestamp = valid[0];
    const resetMs = Math.max(1000, oldestTimestamp + windowMs - now);
    const retryAfterSeconds = Math.ceil(resetMs / 1000);

    throw new ApiError(
      429,
      `Rate limit exceeded: maximum ${maxRequests} requests per ${Math.round(
        windowMs / 1000
      )}s allowed. Retry after ${retryAfterSeconds} seconds.`
    );
  }

  valid.push(now);
  rateLimitStore.set(key, valid);

  return {
    limit: maxRequests,
    remaining: maxRequests - valid.length,
    resetMs: Math.max(0, valid[0] + windowMs - now),
  };
}

/**
 * Convenience helper to apply rate limiting to a Route Handler request.
 * Automatically selects the appropriate key:
 * - Authenticated: uses apiKeyId or userId (tenant-scoped)
 * - Unauthenticated: uses client IP address
 */
export function applyRateLimit(
  request,
  authUser = null,
  { maxRequests = 60, windowMs = 60000 } = {}
) {
  const identifier = authUser
    ? `user:${authUser.apiKeyId || authUser.userId}`
    : `ip:${getClientIp(request)}`;

  return checkRateLimit(identifier, { maxRequests, windowMs });
}

