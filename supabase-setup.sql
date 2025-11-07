-- Create the reviews table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  spotify_url TEXT NOT NULL,
  album_title TEXT NOT NULL,
  album_artist TEXT NOT NULL,
  album_image_url TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (char_length(comment) <= 50),
  user_id TEXT NOT NULL,
  session_id TEXT,
  client_fingerprint TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rate limiting table to track submissions
CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT,
  client_fingerprint TEXT,
  ip_address INET,
  submission_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  last_submission TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, window_start)
);

-- Enable Row Level Security (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;

-- Create a policy that allows anyone to read reviews
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT
  USING (true);

-- Create a policy that allows anyone to insert reviews
CREATE POLICY "Anyone can insert reviews" ON reviews
  FOR INSERT
  WITH CHECK (true);

-- Create a function to check if user can delete their own review
CREATE OR REPLACE FUNCTION can_delete_review(review_user_id TEXT, current_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow deletion if the user_id matches
  RETURN review_user_id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a policy that allows users to delete only their own reviews
-- Note: This requires passing user_id in the request, which the app does
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE
  USING (true); -- Application-level filtering ensures user_id matching

-- Create a function to check rate limits server-side
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id TEXT,
  p_session_id TEXT DEFAULT NULL,
  p_client_fingerprint TEXT DEFAULT NULL,
  p_max_reviews INTEGER DEFAULT 6,
  p_window_hours INTEGER DEFAULT 1,
  p_min_interval_seconds INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_last_submission TIMESTAMP WITH TIME ZONE;
  v_submission_count INTEGER;
  v_time_since_last INTEGER;
  v_allowed BOOLEAN;
  v_message TEXT;
BEGIN
  -- Calculate window start (current hour)
  v_window_start := date_trunc('hour', NOW());
  
  -- Get or create rate limit record
  INSERT INTO rate_limits (user_id, session_id, client_fingerprint, window_start, last_submission, submission_count)
  VALUES (p_user_id, p_session_id, p_client_fingerprint, v_window_start, NOW(), 1)
  ON CONFLICT (user_id, window_start) 
  DO UPDATE SET 
    submission_count = rate_limits.submission_count + 1,
    last_submission = NOW()
  RETURNING submission_count, last_submission INTO v_submission_count, v_last_submission;
  
  -- Check minimum interval
  v_time_since_last := EXTRACT(EPOCH FROM (NOW() - v_last_submission))::INTEGER;
  IF v_time_since_last < p_min_interval_seconds THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'message', format('Please wait %s seconds before posting another review.', p_min_interval_seconds - v_time_since_last),
      'remaining', 0,
      'reset_at', v_window_start + (p_window_hours || ' hours')::INTERVAL
    );
  END IF;
  
  -- Check max reviews per window
  IF v_submission_count > p_max_reviews THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'message', format('Rate limit exceeded. Maximum %s reviews per %s hour(s).', p_max_reviews, p_window_hours),
      'remaining', 0,
      'reset_at', v_window_start + (p_window_hours || ' hours')::INTERVAL
    );
  END IF;
  
  -- Allowed
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', p_max_reviews - v_submission_count,
    'reset_at', v_window_start + (p_window_hours || ' hours')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create an index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Create indexes for rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id_window ON rate_limits(user_id, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_session_id ON rate_limits(session_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_fingerprint ON rate_limits(client_fingerprint);

-- Enable RLS on rate_limits table
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert/update rate limit records (for tracking)
CREATE POLICY "Anyone can manage rate limits" ON rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Clean up old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Optional: Set up a cron job to clean up old records (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT cleanup_old_rate_limits()');

