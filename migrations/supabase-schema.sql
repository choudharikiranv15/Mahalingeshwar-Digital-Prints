-- =====================================================
-- Mahalingeshwar Digital Prints & Gifts
-- Supabase Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT UNIQUE NOT NULL,  -- Custom ID like "photo-print-4x6"
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    description TEXT,
    icon TEXT,  -- Emoji or image identifier
    image_url TEXT,  -- For actual product images
    featured BOOLEAN DEFAULT false,
    in_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    tags TEXT[],  -- Array of tags
    colors TEXT[],  -- Array of color options
    sizes TEXT[],  -- Array of size options
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CATEGORIES TABLE (Optional - for better organization)
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT,
    special_instructions TEXT,
    order_items JSONB NOT NULL,  -- Store cart items as JSON
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',  -- pending, confirmed, completed, cancelled
    whatsapp_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TESTIMONIALS TABLE
-- =====================================================
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    rating DECIMAL(3,2) NOT NULL,
    comment TEXT NOT NULL,
    image_url TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- OFFERS TABLE
-- =====================================================
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- WISHLIST TABLE
-- =====================================================
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,  -- Browser session ID or user email
    product_id TEXT NOT NULL,  -- Reference to products.product_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, product_id)  -- Prevent duplicate wishlist entries
);

-- =====================================================
-- INVENTORY HISTORY TABLE
-- =====================================================
CREATE TABLE inventory_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL,  -- Reference to products.product_id
    change_type TEXT NOT NULL,  -- 'restock', 'sale', 'adjustment', 'return', 'damage'
    quantity_change INTEGER NOT NULL,  -- Positive for additions, negative for reductions
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reason TEXT,
    reference_id TEXT,  -- Order ID or other reference
    created_by TEXT,  -- Admin user email
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STOCK ALERTS TABLE
-- =====================================================
CREATE TABLE stock_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL UNIQUE,  -- Reference to products.product_id
    reorder_point INTEGER DEFAULT 10,  -- Alert when stock falls below this
    reorder_quantity INTEGER DEFAULT 50,  -- Suggested reorder amount
    alert_enabled BOOLEAN DEFAULT true,
    last_alert_sent TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_wishlist_session_id ON wishlist(session_id);
CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);
CREATE INDEX idx_inventory_history_product_id ON inventory_history(product_id);
CREATE INDEX idx_inventory_history_created_at ON inventory_history(created_at);
CREATE INDEX idx_stock_alerts_product_id ON stock_alerts(product_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

-- Products: Public read access
CREATE POLICY "Allow public read access on products"
ON products FOR SELECT
TO anon, authenticated
USING (true);

-- Categories: Public read access
CREATE POLICY "Allow public read access on categories"
ON categories FOR SELECT
TO anon, authenticated
USING (true);

-- Testimonials: Public read access for featured
CREATE POLICY "Allow public read access on testimonials"
ON testimonials FOR SELECT
TO anon, authenticated
USING (true);

-- Offers: Public read access for active offers
CREATE POLICY "Allow public read access on offers"
ON offers FOR SELECT
TO anon, authenticated
USING (active = true);

-- Orders: Allow insert for anyone (for placing orders)
CREATE POLICY "Allow public insert on orders"
ON orders FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Wishlist: Public read access (users can view their own wishlist)
CREATE POLICY "Allow public read access on wishlist"
ON wishlist FOR SELECT
TO anon, authenticated
USING (true);

-- Wishlist: Allow public insert (users can add to wishlist)
CREATE POLICY "Allow public insert on wishlist"
ON wishlist FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Wishlist: Allow public delete (users can remove from wishlist)
CREATE POLICY "Allow public delete on wishlist"
ON wishlist FOR DELETE
TO anon, authenticated
USING (true);

-- Inventory History: Public read access (for transparency)
CREATE POLICY "Allow public read access on inventory_history"
ON inventory_history FOR SELECT
TO anon, authenticated
USING (true);

-- Inventory History: Admin only insert
CREATE POLICY "Allow admin insert on inventory_history"
ON inventory_history FOR INSERT
TO authenticated
WITH CHECK (true);

-- Stock Alerts: Public read access
CREATE POLICY "Allow public read access on stock_alerts"
ON stock_alerts FOR SELECT
TO anon, authenticated
USING (true);

-- Stock Alerts: Admin full access
CREATE POLICY "Allow admin full access on stock_alerts"
ON stock_alerts FOR ALL
TO authenticated
USING (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to products table
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to orders table
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to stock_alerts table
CREATE TRIGGER update_stock_alerts_updated_at
    BEFORE UPDATE ON stock_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKET for Product Images
-- =====================================================
-- Run this in Supabase Dashboard > Storage
--
-- 1. Create a bucket named "product-images"
-- 2. Make it public
-- 3. Set policies for public read access
--
-- Policy for public read:
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'product-images');

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Run this SQL in Supabase Dashboard > SQL Editor
-- 2. Create storage bucket manually in Storage section
-- 3. Update RLS policies as needed for admin access
-- 4. For admin operations, you'll need authenticated user policies
