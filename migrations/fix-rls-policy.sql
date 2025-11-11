-- Quick Fix for Review Submission 401 Error
-- Run this in Supabase SQL Editor

-- First, drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow public insert of reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public read of approved reviews" ON reviews;
DROP POLICY IF EXISTS "Allow admin update of reviews" ON reviews;
DROP POLICY IF EXISTS "Allow admin delete of reviews" ON reviews;

-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 1. Allow ANYONE to insert reviews (this fixes the 401 error)
CREATE POLICY "Allow public insert of reviews"
    ON reviews FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 2. Allow public to read only approved reviews
CREATE POLICY "Allow public read of approved reviews"
    ON reviews FOR SELECT
    TO anon, authenticated
    USING (is_approved = true);

-- 3. Allow all updates (for admin panel)
CREATE POLICY "Allow admin update of reviews"
    ON reviews FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Allow all deletes (for admin panel)
CREATE POLICY "Allow admin delete of reviews"
    ON reviews FOR DELETE
    TO anon, authenticated
    USING (true);

-- Verify policies were created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'reviews'
ORDER BY policyname;
