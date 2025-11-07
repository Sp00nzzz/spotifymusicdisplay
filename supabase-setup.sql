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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Optional: Create an index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

