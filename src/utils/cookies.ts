/**
 * Cookie utility functions for better user tracking and session management
 */

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Set a cookie
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    days?: number;
    path?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
  } = {}
): void {
  if (typeof document === 'undefined') return;

  const {
    days = 365,
    path = '/',
    sameSite = 'Strict',
    secure = window.location.protocol === 'https:',
  } = options;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  let cookieString = `${name}=${value};expires=${expires.toUTCString()};path=${path};SameSite=${sameSite}`;
  
  if (secure) {
    cookieString += ';secure';
  }

  document.cookie = cookieString;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path};`;
}

/**
 * Get or create a session ID stored in cookies
 */
export function getSessionId(): string {
  const SESSION_COOKIE = 'albumReviewSessionId';
  let sessionId = getCookie(SESSION_COOKIE);

  if (!sessionId) {
    // Generate a unique session ID
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    setCookie(SESSION_COOKIE, sessionId, { days: 30 });
  }

  return sessionId;
}

/**
 * Get client fingerprint for additional tracking
 */
export function getClientFingerprint(): string {
  const FINGERPRINT_COOKIE = 'albumReviewFingerprint';
  let fingerprint = getCookie(FINGERPRINT_COOKIE);

  if (!fingerprint) {
    // Create a simple fingerprint from available browser info
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 2, 2);
    const canvasHash = canvas.toDataURL().slice(-20);

    fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      canvasHash,
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    fingerprint = `fp_${Math.abs(hash).toString(36)}`;
    setCookie(FINGERPRINT_COOKIE, fingerprint, { days: 365 });
  }

  return fingerprint;
}

