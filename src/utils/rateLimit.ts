/**
 * Rate limiting utility to prevent spam
 * Uses both client-side (cookies/localStorage) and server-side (Supabase) checks
 */
import { setCookie } from './cookies';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  message?: string;
}

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  // Maximum reviews per time window
  maxReviews: 6,
  // Time window in milliseconds (1 hour)
  windowMs: 60 * 60 * 1000,
  // Minimum time between reviews in milliseconds (30 seconds)
  minIntervalMs: 30 * 1000,
};

const STORAGE_KEY = 'albumReviewRateLimit';
const COOKIE_KEY = 'albumReviewRateLimit';

/**
 * Check client-side rate limit using cookies and localStorage
 */
export function checkClientRateLimit(): RateLimitResult {
  // Return allowed if running in SSR/build environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxReviews,
      resetAt: Date.now() + RATE_LIMIT_CONFIG.windowMs,
    };
  }

  const now = Date.now();
  
  // Get rate limit data from localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  let rateLimitData: { count: number; windowStart: number; lastReview: number } = stored
    ? JSON.parse(stored)
    : { count: 0, windowStart: now, lastReview: 0 };

  // Check if we're in a new time window
  if (now - rateLimitData.windowStart > RATE_LIMIT_CONFIG.windowMs) {
    rateLimitData = { count: 0, windowStart: now, lastReview: rateLimitData.lastReview };
  }

  // Check minimum interval between reviews
  const timeSinceLastReview = now - rateLimitData.lastReview;
  if (timeSinceLastReview < RATE_LIMIT_CONFIG.minIntervalMs) {
    const remainingSeconds = Math.ceil(
      (RATE_LIMIT_CONFIG.minIntervalMs - timeSinceLastReview) / 1000
    );
    return {
      allowed: false,
      remaining: 0,
      resetAt: now + (RATE_LIMIT_CONFIG.minIntervalMs - timeSinceLastReview),
      message: `Please wait ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''} before posting another review.`,
    };
  }

  // Check if user has exceeded the limit
  if (rateLimitData.count >= RATE_LIMIT_CONFIG.maxReviews) {
    const resetAt = rateLimitData.windowStart + RATE_LIMIT_CONFIG.windowMs;
    const remainingMs = resetAt - now;
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      message: `Rate limit exceeded. You can post ${RATE_LIMIT_CONFIG.maxReviews} reviews per hour. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
    };
  }

  // Don't update count here - that happens in recordReviewSubmission
  // Just return the current status
  const remaining = RATE_LIMIT_CONFIG.maxReviews - rateLimitData.count;
  const resetAt = rateLimitData.windowStart + RATE_LIMIT_CONFIG.windowMs;

  return {
    allowed: true,
    remaining,
    resetAt,
  };
}

/**
 * Record a review submission (call this after successful submission)
 */
export function recordReviewSubmission(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

  const now = Date.now();
  const stored = localStorage.getItem(STORAGE_KEY);
  let rateLimitData: { count: number; windowStart: number; lastReview: number } = stored
    ? JSON.parse(stored)
    : { count: 0, windowStart: now, lastReview: 0 };

  // Reset if in new window
  if (now - rateLimitData.windowStart > RATE_LIMIT_CONFIG.windowMs) {
    rateLimitData = { count: 0, windowStart: now, lastReview: now };
  } else {
    rateLimitData.count += 1;
    rateLimitData.lastReview = now;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(rateLimitData));
  setCookie(COOKIE_KEY, JSON.stringify(rateLimitData), { days: 1 });
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(): { remaining: number; resetAt: number } {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return {
      remaining: RATE_LIMIT_CONFIG.maxReviews,
      resetAt: Date.now() + RATE_LIMIT_CONFIG.windowMs,
    };
  }

  const now = Date.now();
  const stored = localStorage.getItem(STORAGE_KEY);
  let rateLimitData: { count: number; windowStart: number; lastReview: number } = stored
    ? JSON.parse(stored)
    : { count: 0, windowStart: now, lastReview: 0 };

  // Reset if in new window
  if (now - rateLimitData.windowStart > RATE_LIMIT_CONFIG.windowMs) {
    return {
      remaining: RATE_LIMIT_CONFIG.maxReviews,
      resetAt: now + RATE_LIMIT_CONFIG.windowMs,
    };
  }

  return {
    remaining: Math.max(0, RATE_LIMIT_CONFIG.maxReviews - rateLimitData.count),
    resetAt: rateLimitData.windowStart + RATE_LIMIT_CONFIG.windowMs,
  };
}

