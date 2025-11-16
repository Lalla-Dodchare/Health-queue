-- =====================================================
-- ตั้งค่า Cron Job สำหรับลบข้อความอัตโนมัติ
-- =====================================================
-- รันทุกวันเวลา 2 โมงเช้า (UTC)
-- =====================================================

-- 1. Enable pg_cron extension (ถ้ายังไม่ได้เปิด)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. สร้าง Cron Job
SELECT cron.schedule(
  'cleanup-expired-messages',  -- Job name
  '0 2 * * *',                 -- Cron expression (2 AM every day)
  $$
  SELECT net.http_post(
    url := 'https://ruiglnhjgvvoynhvtugt.supabase.co/functions/v1/cleanup-messages',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aWdsbmhqZ3Z2b3luaHZ0dWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjE5MTQsImV4cCI6MjA3Nzc5NzkxNH0.zM7gfHUiet9MsIhVv55t-ORB8Hn3liurX3fZM-NFe5Y'
    )
  ) AS request_id;
  $$
);

-- =====================================================
-- ตรวจสอบ Cron Jobs ที่มี
-- =====================================================

SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname = 'cleanup-expired-messages';

-- =====================================================
-- ถ้าต้องการลบ Cron Job (สำหรับ debug)
-- =====================================================

-- SELECT cron.unschedule('cleanup-expired-messages');

-- =====================================================
-- ทดสอบเรียก function ทันที
-- =====================================================

SELECT net.http_post(
  url := 'https://ruiglnhjgvvoynhvtugt.supabase.co/functions/v1/cleanup-messages',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aWdsbmhqZ3Z2b3luaHZ0dWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjE5MTQsImV4cCI6MjA3Nzc5NzkxNH0.zM7gfHUiet9MsIhVv55t-ORB8Hn3liurX3fZM-NFe5Y'
  )
) AS request_id;

-- =====================================================
-- เรียบร้อย!
-- =====================================================

-- Cron จะรันทุกวันเวลา 2 โมงเช้า (UTC)
-- ลบข้อความที่หมดอายุแล้วอัตโนมัติ
