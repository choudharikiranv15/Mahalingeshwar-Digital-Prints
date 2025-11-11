-- =====================================================
-- SAMPLE PRODUCTS DATA
-- Add test products to your database
-- =====================================================

-- Clear existing test data (optional - comment out if you have real products)
-- DELETE FROM products WHERE product_id LIKE 'sample-%';

-- =====================================================
-- PHOTO PRINTING PRODUCTS
-- =====================================================

INSERT INTO products (product_id, name, category, price, original_price, rating, reviews, description, icon, featured, in_stock, stock_quantity)
VALUES
('sample-photo-4x6', '4x6 Photo Print', 'Printing', 10.00, 15.00, 4.8, 150, 'High-quality photo print on premium glossy paper', '📸', true, true, 500),
('sample-photo-5x7', '5x7 Photo Print', 'Printing', 20.00, 30.00, 4.7, 120, 'Crystal clear photo prints perfect for framing', '🖼️', true, true, 300),
('sample-photo-8x10', '8x10 Photo Print', 'Printing', 50.00, 70.00, 4.9, 200, 'Professional grade photo prints', '📷', false, true, 200);

-- =====================================================
-- PERSONALIZED GIFTS
-- =====================================================

INSERT INTO products (product_id, name, category, price, original_price, rating, reviews, description, icon, featured, in_stock, stock_quantity)
VALUES
('sample-coffee-mug', 'Personalized Coffee Mug', 'Gifts', 250.00, 350.00, 4.9, 180, 'Custom photo printed ceramic mug, dishwasher safe', '☕', true, true, 150),
('sample-photo-frame', 'Custom Photo Frame', 'Gifts', 500.00, 700.00, 4.8, 95, 'Beautiful wooden frame with your photo', '🖼️', true, true, 75),
('sample-tshirt', 'Printed T-Shirt', 'Gifts', 450.00, 600.00, 4.6, 220, 'Custom printed t-shirt, all sizes available', '👕', false, true, 200);

-- =====================================================
-- BUSINESS PRINTING
-- =====================================================

INSERT INTO products (product_id, name, category, price, original_price, rating, reviews, description, icon, featured, in_stock, stock_quantity)
VALUES
('sample-business-card', 'Business Cards (100 pcs)', 'Business', 300.00, 400.00, 4.9, 300, 'Professional business cards, premium quality', '💼', true, true, 1000),
('sample-brochure', 'Brochures (A4, 50 pcs)', 'Business', 500.00, 650.00, 4.7, 85, 'Full color brochures on quality paper', '📄', false, true, 500),
('sample-poster', 'Poster Print (A3)', 'Business', 150.00, 200.00, 4.8, 140, 'Eye-catching posters for your business', '🎨', true, true, 300);

-- =====================================================
-- STATIONERY
-- =====================================================

INSERT INTO products (product_id, name, category, price, original_price, rating, reviews, description, icon, featured, in_stock, stock_quantity)
VALUES
('sample-calendar', 'Photo Calendar 2025', 'Stationery', 400.00, 550.00, 4.9, 160, '12-month personalized calendar with your photos', '📅', true, true, 100),
('sample-notebook', 'Custom Notebook', 'Stationery', 200.00, 280.00, 4.6, 90, 'Personalized cover notebook, 200 pages', '📓', false, true, 250),
('sample-id-card', 'ID Card Printing', 'Business', 50.00, 75.00, 4.8, 175, 'Professional ID cards with photo', '🪪', false, true, 800);

-- =====================================================
-- VERIFY SAMPLE PRODUCTS
-- =====================================================

-- Run this to see all featured products:
-- SELECT product_id, name, category, price, featured, in_stock, stock_quantity
-- FROM products
-- WHERE featured = true;

-- Run this to see all products:
-- SELECT product_id, name, category, price, featured, in_stock, stock_quantity
-- FROM products;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. All products have 'sample-' prefix for easy identification
-- 2. 7 products are marked as featured (featured = true)
-- 3. All products are in stock with realistic quantities
-- 4. Mix of pricing to test different price ranges
-- 5. Includes ratings and review counts for authenticity
--
-- To remove sample data later:
-- DELETE FROM products WHERE product_id LIKE 'sample-%';
-- =====================================================
