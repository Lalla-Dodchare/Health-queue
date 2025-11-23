-- ============================================================================
-- CLEANUP: ลบข้อมูลหมอออกจาก profiles table
-- ============================================================================
-- Purpose: ลบ profiles ที่เป็นข้อมูลทดสอบของหมอ (ไม่ใช่ user จริง)
-- Reason: หมอไม่ควรมี profile (หมอไม่ login ได้) มีแค่ข้อมูล contact ในตาราง doctors
-- Date: 2025-01-21
-- ============================================================================

BEGIN;

RAISE NOTICE '🧹 Starting cleanup of doctor profiles...';

-- เก็บ backup count ก่อนลบ
DO $$
DECLARE
  total_count INT;
  doctor_count INT;
BEGIN
  SELECT COUNT(*) INTO total_count FROM profiles;
  SELECT COUNT(*) INTO doctor_count FROM profiles WHERE email LIKE '%doctor%@%';

  RAISE NOTICE '';
  RAISE NOTICE '📊 Current state:';
  RAISE NOTICE '   Total profiles: %', total_count;
  RAISE NOTICE '   Doctor test profiles (will be deleted): %', doctor_count;
  RAISE NOTICE '   Real users (will be kept): %', total_count - doctor_count;
  RAISE NOTICE '';
END $$;

-- ลบ profiles ที่มี email ลงท้ายด้วย "doctor<number>@..." (test data)
-- หรือชื่อขึ้นต้นด้วย "ทพ.", "ทพญ.", "พญ." (คำนำหน้าหมอ)
DELETE FROM profiles
WHERE
  email SIMILAR TO '%doctor[0-9]+@%'  -- doctor1@..., doctor2@..., etc.
  OR full_name LIKE 'ทพ.%'            -- ทันตแพทย์ชาย
  OR full_name LIKE 'ทพญ.%'           -- ทันตแพทย์หญิง
  OR full_name LIKE 'พญ.%'            -- แพทย์หญิง
  OR full_name LIKE 'นพ.%';           -- แพทย์ชาย (นายแพทย์)

-- แสดงผลลัพธ์
DO $$
DECLARE
  remaining_count INT;
BEGIN
  SELECT COUNT(*) INTO remaining_count FROM profiles;

  RAISE NOTICE '✅ Cleanup complete!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Result:';
  RAISE NOTICE '   Remaining profiles: %', remaining_count;
  RAISE NOTICE '';
  RAISE NOTICE '💡 Note: Doctor contact information is stored in "doctors" table';
  RAISE NOTICE '   Doctors do NOT need profiles (they cannot log in)';
  RAISE NOTICE '';
END $$;

COMMIT;
