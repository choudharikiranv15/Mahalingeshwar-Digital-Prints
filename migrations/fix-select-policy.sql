-- Fix for 401 Error on Review Submission
-- The issue: INSERT works but .select() fails because SELECT policy only allows approved reviews
-- Solution: Update SELECT policy to allow reading all reviews (admin will approve later)

-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Allow public read of approved reviews" ON reviews;

-- Create a new SELECT policy that allows reading all reviews
-- This allows the INSERT to return the newly created review
CREATE POLICY "Allow public read of all reviews"
    ON reviews FOR SELECT
    TO anon, authenticated
    USING (true);

-- Note: Public users will see all reviews in the admin panel
-- If you want to restrict public viewing on the website,
-- you can filter by is_approved in your frontend code

-- Verify the policy was updated
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
