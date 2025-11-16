-- =====================================================
-- ตั้งค่า Cron Job แบบง่าย (ไม่ใช้ pg_net)
-- =====================================================
-- วิธีนี้เรียก function delete_expired_admin_messages() โดยตรง
-- =====================================================

-- 1. Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. สร้าง Cron Job ที่เรียก function โดยตรง
SELECT cron.schedule(
  'cleanup-expired-messages',
  '0 2 * * *', -- รันทุกวันเวลา 2 โมงเช้า
  'SELECT delete_expired_admin_messages()'
);

-- =====================================================
-- ตรวจสอบ Cron Jobs
-- =====================================================

SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job;

-- =====================================================
-- ทดสอบ - รันทันที
-- =====================================================

SELECT delete_expired_admin_messages();

-- =====================================================
-- ถ้าต้องการลบ Cron Job
-- =====================================================

-- SELECT cron.unschedule('cleanup-expired-messages');
