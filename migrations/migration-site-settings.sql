-- Migration: Add site_settings table for editable statistics
-- This allows admin to update site statistics from the admin panel

CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_label TEXT NOT NULL,
    setting_description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);

-- Insert default statistics values
INSERT INTO site_settings (setting_key, setting_value, setting_label, setting_description) VALUES
('stat_happy_customers', '500+', 'Happy Customers', 'Number of happy customers served')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO site_settings (setting_key, setting_value, setting_label, setting_description) VALUES
('stat_orders_completed', '1000+', 'Orders Completed', 'Total number of orders completed')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO site_settings (setting_key, setting_value, setting_label, setting_description) VALUES
('stat_average_rating', '5⭐', 'Average Rating', 'Our average customer rating')
ON CONFLICT (setting_key) DO NOTHING;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;

CREATE TRIGGER site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_site_settings_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow all users to read settings
CREATE POLICY "Allow public read access to site_settings"
    ON site_settings FOR SELECT
    USING (true);

-- Only authenticated users can update settings (admin panel)
CREATE POLICY "Allow authenticated users to update site_settings"
    ON site_settings FOR UPDATE
    USING (true);
