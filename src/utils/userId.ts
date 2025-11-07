import { getCookie, setCookie } from './cookies';

/**
 * Get or create a unique user ID for this browser session
 * Uses both cookies and localStorage for better persistence
 */
export function getUserId(): string {
  const STORAGE_KEY = 'albumReviewUserId';
  const COOKIE_KEY = 'albumReviewUserId';
  
  // Try cookie first (more reliable across domains)
  let userId = getCookie(COOKIE_KEY);
  
  // Fallback to localStorage
  if (!userId) {
    userId = localStorage.getItem(STORAGE_KEY);
  }
  
  // Generate new ID if none exists
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(STORAGE_KEY, userId);
    setCookie(COOKIE_KEY, userId, { days: 365 });
  } else {
    // Sync to both storage methods
    localStorage.setItem(STORAGE_KEY, userId);
    setCookie(COOKIE_KEY, userId, { days: 365 });
  }
  
  return userId;
}

