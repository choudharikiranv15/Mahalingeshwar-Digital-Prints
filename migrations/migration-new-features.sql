-- =====================================================
-- NEW FEATURES MIGRATION ONLY
-- Run this to add Wishlist, Analytics, and Inventory
-- Safe to run - won't affect existing tables
-- =====================================================

-- =====================================================
-- 1. WISHLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, product_id)
);

-- =====================================================
-- 2. INVENTORY HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL,
    change_type TEXT NOT NULL,
    quantity_change INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reason TEXT,
    reference_id TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. STOCK ALERTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL UNIQUE,
    reorder_point INTEGER DEFAULT 10,
    reorder_quantity INTEGER DEFAULT 50,
    alert_enabled BOOLEAN DEFAULT true,
    last_alert_sent TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CREATE INDEXES (Only if they don't exist)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_wishlist_session_id ON wishlist(session_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_product_id ON inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON inventory_history(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR WISHLIST
-- =====================================================

-- Drop existing policies if they exist (to avoid duplicates)
DROP POLICY IF EXISTS "Allow public read access on wishlist" ON wishlist;
DROP POLICY IF EXISTS "Allow public insert on wishlist" ON wishlist;
DROP POLICY IF EXISTS "Allow public delete on wishlist" ON wishlist;

-- Create new policies
CREATE POLICY "Allow public read access on wishlist"
ON wishlist FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert on wishlist"
ON wishlist FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public delete on wishlist"
ON wishlist FOR DELETE
TO anon, authenticated
USING (true);

-- =====================================================
-- RLS POLICIES FOR INVENTORY HISTORY
-- =====================================================

DROP POLICY IF EXISTS "Allow public read access on inventory_history" ON inventory_history;
DROP POLICY IF EXISTS "Allow admin insert on inventory_history" ON inventory_history;

CREATE POLICY "Allow public read access on inventory_history"
ON inventory_history FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow admin insert on inventory_history"
ON inventory_history FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- RLS POLICIES FOR STOCK ALERTS
-- =====================================================

DROP POLICY IF EXISTS "Allow public read access on stock_alerts" ON stock_alerts;
DROP POLICY IF EXISTS "Allow admin full access on stock_alerts" ON stock_alerts;

CREATE POLICY "Allow public read access on stock_alerts"
ON stock_alerts FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow admin full access on stock_alerts"
ON stock_alerts FOR ALL
TO authenticated
USING (true);

-- =====================================================
-- UPDATE TRIGGER FOR stock_alerts
-- =====================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_stock_alerts_updated_at ON stock_alerts;

-- Create trigger
CREATE TRIGGER update_stock_alerts_updated_at
    BEFORE UPDATE ON stock_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Run this to verify all tables were created:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('wishlist', 'inventory_history', 'stock_alerts');

-- =====================================================
-- SUCCESS!
-- =====================================================
-- All three feature tables have been created:
-- ✅ wishlist - For Feature #5 (Wishlist)
-- ✅ inventory_history - For Feature #8 (Inventory Management)
-- ✅ stock_alerts - For Feature #8 (Inventory Management)
--
-- Next Steps:
-- 1. Verify tables in Supabase Dashboard > Database > Tables
-- 2. Integrate Analytics section into admin.html
-- 3. Integrate Inventory section into admin.html
-- 4. Test all features!
-- =====================================================
