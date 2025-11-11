-- Migration: Customer Reviews System
-- Comprehensive review collection and management system

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Customer Information
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    customer_location TEXT,

    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title TEXT,
    review_text TEXT NOT NULL,

    -- Product/Service Details (optional)
    product_id TEXT,
    product_name TEXT,
    order_reference TEXT,

    -- Review Metadata
    is_verified BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,

    -- Media
    review_images TEXT[], -- Array of image URLs

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by TEXT,

    -- Admin Notes
    admin_notes TEXT,

    -- Engagement
    helpful_count INTEGER DEFAULT 0,

    -- Source tracking
    submission_source TEXT DEFAULT 'website' -- website, whatsapp, email, in-store
);

-- =====================================================
-- REVIEW STATISTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS review_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_reviews INTEGER DEFAULT 0,
    approved_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    five_star_count INTEGER DEFAULT 0,
    four_star_count INTEGER DEFAULT 0,
    three_star_count INTEGER DEFAULT 0,
    two_star_count INTEGER DEFAULT 0,
    one_star_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial statistics row
INSERT INTO review_statistics (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- REVIEW REQUESTS TABLE (for tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS review_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    order_reference TEXT,
    request_token TEXT UNIQUE NOT NULL, -- Unique link token
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' -- pending, completed, expired
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_token ON review_requests(request_token);
CREATE INDEX IF NOT EXISTS idx_review_requests_status ON review_requests(status);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_updated_at ON reviews;
CREATE TRIGGER reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- Auto-update statistics when review is approved/updated
CREATE OR REPLACE FUNCTION update_review_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate all statistics
    UPDATE review_statistics
    SET
        total_reviews = (SELECT COUNT(*) FROM reviews),
        approved_reviews = (SELECT COUNT(*) FROM reviews WHERE is_approved = true),
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE is_approved = true),
        five_star_count = (SELECT COUNT(*) FROM reviews WHERE rating = 5 AND is_approved = true),
        four_star_count = (SELECT COUNT(*) FROM reviews WHERE rating = 4 AND is_approved = true),
        three_star_count = (SELECT COUNT(*) FROM reviews WHERE rating = 3 AND is_approved = true),
        two_star_count = (SELECT COUNT(*) FROM reviews WHERE rating = 2 AND is_approved = true),
        one_star_count = (SELECT COUNT(*) FROM reviews WHERE rating = 1 AND is_approved = true),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = '00000000-0000-0000-0000-000000000001';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_stats_on_review_change ON reviews;
CREATE TRIGGER update_stats_on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_review_statistics();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read of approved reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public insert of reviews" ON reviews;
DROP POLICY IF EXISTS "Allow admin update of reviews" ON reviews;
DROP POLICY IF EXISTS "Allow admin delete of reviews" ON reviews;

-- Public can read approved reviews
CREATE POLICY "Allow public read of approved reviews"
    ON reviews FOR SELECT
    TO anon, authenticated
    USING (is_approved = true);

-- Public can insert reviews (for submission) - IMPORTANT: This allows anyone to submit
CREATE POLICY "Allow public insert of reviews"
    ON reviews FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow all updates (admin panel uses anon key)
CREATE POLICY "Allow admin update of reviews"
    ON reviews FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Allow all deletes (admin panel uses anon key)
CREATE POLICY "Allow admin delete of reviews"
    ON reviews FOR DELETE
    TO anon, authenticated
    USING (true);

-- Drop existing policies for other tables
DROP POLICY IF EXISTS "Allow public read of statistics" ON review_statistics;
DROP POLICY IF EXISTS "Allow public read of review requests" ON review_requests;
DROP POLICY IF EXISTS "Allow public insert of review requests" ON review_requests;
DROP POLICY IF EXISTS "Allow public update of review requests" ON review_requests;

-- Public can read statistics
CREATE POLICY "Allow public read of statistics"
    ON review_statistics FOR SELECT
    TO anon, authenticated
    USING (true);

-- Public can read review requests by token
CREATE POLICY "Allow public read of review requests"
    ON review_requests FOR SELECT
    TO anon, authenticated
    USING (true);

-- Anyone can insert review requests
CREATE POLICY "Allow public insert of review requests"
    ON review_requests FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Anyone can update review requests (for marking as completed)
CREATE POLICY "Allow public update of review requests"
    ON review_requests FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Insert sample reviews
INSERT INTO reviews (
    customer_name,
    customer_email,
    customer_location,
    rating,
    review_title,
    review_text,
    product_name,
    is_verified,
    is_approved,
    is_featured
) VALUES
(
    'Rajesh Kumar',
    'rajesh@example.com',
    'Chadchan',
    5,
    'Excellent Quality Prints!',
    'Got my wedding photos printed here. The quality is outstanding and the colors are so vibrant. Staff was very helpful and delivery was on time. Highly recommended!',
    '8x10 Photo Print',
    true,
    true,
    true
),
(
    'Priya Sharma',
    'priya@example.com',
    'Vijayapur',
    5,
    'Best Gift Shop in Town',
    'Ordered customized mugs for my office team. Everyone loved them! The printing quality was superb and the price was very reasonable. Will definitely order again.',
    'Custom Mug Printing',
    true,
    true,
    true
),
(
    'Amit Patil',
    'amit@example.com',
    'Chadchan',
    4,
    'Good Service',
    'Quick turnaround time for my business cards. Quality is good. Only suggestion would be to have more design options available.',
    'Business Cards',
    true,
    true,
    false
),
(
    'Sneha Reddy',
    'sneha@example.com',
    'Bagalkot',
    5,
    'Amazing Personalized Gifts',
    'Created a beautiful photo frame with my family pictures. The staff helped me choose the perfect design. Very satisfied with the final product!',
    'Photo Frame',
    true,
    true,
    true
),
(
    'Mahesh Desai',
    'mahesh@example.com',
    'Chadchan',
    5,
    'Professional and Fast',
    'Needed urgent printing for my daughter''s birthday invitations. They completed the order in just 2 hours! Quality was excellent. Thank you so much!',
    'Invitation Cards',
    true,
    true,
    false
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to generate review request token
CREATE OR REPLACE FUNCTION generate_review_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to get rating distribution
CREATE OR REPLACE FUNCTION get_rating_distribution()
RETURNS TABLE(
    rating INTEGER,
    count BIGINT,
    percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.rating,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM reviews WHERE is_approved = true), 0)), 2) as percentage
    FROM reviews r
    WHERE r.is_approved = true
    GROUP BY r.rating
    ORDER BY r.rating DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE reviews IS 'Stores all customer reviews and ratings';
COMMENT ON TABLE review_statistics IS 'Aggregated statistics for reviews';
COMMENT ON TABLE review_requests IS 'Tracks review requests sent to customers';
COMMENT ON COLUMN reviews.is_verified IS 'Customer verified through order';
COMMENT ON COLUMN reviews.is_approved IS 'Admin approved for public display';
COMMENT ON COLUMN reviews.is_featured IS 'Featured on homepage';
