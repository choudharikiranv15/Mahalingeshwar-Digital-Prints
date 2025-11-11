-- Fix Stock Alerts 401 Error
-- The issue: Policy only allows "authenticated" users, but admin panel uses "anon" key

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access on stock_alerts" ON stock_alerts;
DROP POLICY IF EXISTS "Allow admin full access on stock_alerts" ON stock_alerts;

-- Enable RLS
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

-- Allow both anon and authenticated users to read stock alerts
CREATE POLICY "Allow read access on stock_alerts"
ON stock_alerts FOR SELECT
TO anon, authenticated
USING (true);

-- Allow both anon and authenticated users full access (for admin panel)
CREATE POLICY "Allow full access on stock_alerts"
ON stock_alerts FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Also fix inventory_history table
DROP POLICY IF EXISTS "Allow public read access on inventory_history" ON inventory_history;
DROP POLICY IF EXISTS "Allow admin full access on inventory_history" ON inventory_history;

ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access on inventory_history"
ON inventory_history FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow full access on inventory_history"
ON inventory_history FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Verify policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('stock_alerts', 'inventory_history')
ORDER BY tablename, policyname;
