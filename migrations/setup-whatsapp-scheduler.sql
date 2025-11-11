-- Setup automatic WhatsApp alerts scheduling
-- This creates two scheduled jobs in Supabase

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Job 1: Check for low stock every 4 hours (only sends if there's low stock)
SELECT cron.schedule(
    'stock-alert-every-4-hours',
    '0 */4 * * *',  -- Every 4 hours at minute 0 (12am, 4am, 8am, 12pm, 4pm, 8pm)
    $$
    SELECT
      net.http_post(
          url:='https://jzhfrgexbzzwxstfbvtg.supabase.co/functions/v1/stock-alert-whatsapp',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6aGZyZ2V4Ynp6d3hzdGZidnRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgzMzI0MCwiZXhwIjoyMDc3NDA5MjQwfQ.AJcp9glg6kZRguuQuwHr-bnJPU0D4j5u8yorjr9rx-A"}'::jsonb,
          body:='{"alertType": "low_stock"}'::jsonb
      ) as request_id;
    $$
);

-- Job 2: Daily complete stock summary at 10 AM
SELECT cron.schedule(
    'daily-stock-summary-10am',
    '0 10 * * *',  -- Every day at 10:00 AM
    $$
    SELECT
      net.http_post(
          url:='https://jzhfrgexbzzwxstfbvtg.supabase.co/functions/v1/stock-alert-whatsapp',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6aGZyZ2V4Ynp6d3hzdGZidnRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgzMzI0MCwiZXhwIjoyMDc3NDA5MjQwfQ.AJcp9glg6kZRguuQuwHr-bnJPU0D4j5u8yorjr9rx-A"}'::jsonb,
          body:='{"alertType": "daily_summary"}'::jsonb
      ) as request_id;
    $$
);

-- View scheduled jobs
SELECT * FROM cron.job;

-- To remove jobs (if needed later):
-- SELECT cron.unschedule('stock-alert-every-4-hours');
-- SELECT cron.unschedule('daily-stock-summary-10am');
