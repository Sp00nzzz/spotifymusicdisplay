/**
 * Server-side rate limiting using Supabase database functions
 */
import { supabase } from '../lib/supabase';
import { getUserId } from './userId';
import { getSessionId, getClientFingerprint } from './cookies';

interface ServerRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  message?: string;
}

/**
 * Check rate limit on the server side
 */
export async function checkServerRateLimit(): Promise<ServerRateLimitResult> {
  try {
    const userId = getUserId();
    const sessionId = getSessionId();
    const clientFingerprint = getClientFingerprint();

    // Call the Supabase function
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: userId,
      p_session_id: sessionId,
      p_client_fingerprint: clientFingerprint,
      p_max_reviews: 6,
      p_window_hours: 1,
      p_min_interval_seconds: 30,
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // If server check fails, allow but log the error
      // In production, you might want to be more strict
      return {
        allowed: true,
        remaining: 6,
        resetAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };
    }

    return {
      allowed: data.allowed,
      remaining: data.remaining || 0,
      resetAt: data.reset_at,
      message: data.message,
    };
  } catch (err) {
    console.error('Error checking server rate limit:', err);
    // Fail open - allow the request if server check fails
    return {
      allowed: true,
      remaining: 6,
      resetAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }
}

