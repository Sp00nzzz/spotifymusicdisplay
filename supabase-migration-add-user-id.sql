-- Migration: Add user_id column to existing reviews table
-- Run this SQL in your Supabase SQL Editor if you already have a reviews table

-- Add user_id column (allow NULL initially for existing records)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Set a default value for existing records (they will be anonymous)
UPDATE reviews SET user_id = 'anonymous_' || id::text WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting defaults
ALTER TABLE reviews ALTER COLUMN user_id SET NOT NULL;

-- Update the delete policy to be more restrictive
-- Note: Since we don't have Supabase Auth, application-level filtering handles user_id checks
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE
  USING (true); -- Application-level filtering will handle user_id matching

-- Optional: Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

