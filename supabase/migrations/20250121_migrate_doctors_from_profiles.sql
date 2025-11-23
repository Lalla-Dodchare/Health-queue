-- ============================================================================
-- MIGRATE DOCTORS: profiles → doctors table
-- ============================================================================
-- Purpose: ย้ายข้อมูลหมอจาก profiles (ตารางผิด) ไปยัง doctors (ตารางถูก)
-- Reason: หมอไม่ควรอยู่ใน profiles (หมอไม่ login ได้)
-- Date: 2025-01-21
-- ============================================================================

DO $$
DECLARE
  doctors_count INT;
  profiles_doctors_count INT;
  profiles_count INT;
BEGIN
  -- ============================================================================
  -- STEP 1: แสดงสถานะก่อนย้าย
  -- ============================================================================

  RAISE NOTICE 'Starting doctor data migration...';
  RAISE NOTICE '';

  SELECT COUNT(*) INTO doctors_count FROM doctors;
  SELECT COUNT(*) INTO profiles_doctors_count
  FROM profiles
  WHERE email SIMILAR TO '%%doctor[0-9]+@%%'
     OR full_name LIKE 'ทพ.%%'
     OR full_name LIKE 'ทพญ.%%'
     OR full_name LIKE 'พญ.%%'
     OR full_name LIKE 'นพ.%%';

  RAISE NOTICE 'Before migration:';
  RAISE NOTICE '   doctors table: % records', doctors_count;
  RAISE NOTICE '   profiles table (doctors): % records', profiles_doctors_count;
  RAISE NOTICE '';

  -- ============================================================================
  -- STEP 2: ย้ายข้อมูลจาก profiles → doctors
  -- ============================================================================

  RAISE NOTICE 'Migrating doctor data...';

  -- Insert doctors from profiles into doctors table
  -- Note: Skip records that already exist (based on contact_email)
  INSERT INTO doctors (
    contact_name,
    contact_email,
    phone,
    specialty,
    status,
    created_at,
    contact_type
  )
  SELECT
    full_name AS contact_name,
    email AS contact_email,
    phone,
    -- Extract specialty from title prefix
    CASE
      WHEN full_name LIKE 'ทพ.%%' THEN 'ทันตกรรม'
      WHEN full_name LIKE 'ทพญ.%%' THEN 'ทันตกรรม'
      WHEN full_name LIKE 'พญ.%%' THEN 'อายุรกรรม'
      WHEN full_name LIKE 'นพ.%%' THEN 'อายุรกรรม'
      ELSE 'ทั่วไป'
    END AS specialty,
    'active' AS status,
    created_at,
    'direct' AS contact_type
  FROM profiles
  WHERE
    (email SIMILAR TO '%%doctor[0-9]+@%%'
     OR full_name LIKE 'ทพ.%%'
     OR full_name LIKE 'ทพญ.%%'
     OR full_name LIKE 'พญ.%%'
     OR full_name LIKE 'นพ.%%')
    -- Skip if email already exists in doctors table
    AND email NOT IN (SELECT contact_email FROM doctors WHERE contact_email IS NOT NULL);

  RAISE NOTICE '   Doctors migrated to doctors table';

  -- ============================================================================
  -- STEP 3: ลบข้อมูลหมอออกจาก profiles
  -- ============================================================================

  RAISE NOTICE '';
  RAISE NOTICE 'Cleaning up profiles table...';

  DELETE FROM profiles
  WHERE
    email SIMILAR TO '%%doctor[0-9]+@%%'
    OR full_name LIKE 'ทพ.%%'
    OR full_name LIKE 'ทพญ.%%'
    OR full_name LIKE 'พญ.%%'
    OR full_name LIKE 'นพ.%%';

  RAISE NOTICE '   Doctor records removed from profiles';

  -- ============================================================================
  -- STEP 4: แสดงสถานะหลังย้าย
  -- ============================================================================

  RAISE NOTICE '';

  SELECT COUNT(*) INTO doctors_count FROM doctors;
  SELECT COUNT(*) INTO profiles_count FROM profiles;

  RAISE NOTICE 'After migration:';
  RAISE NOTICE '   doctors table: % records', doctors_count;
  RAISE NOTICE '   profiles table: % records (users + admin only)', profiles_count;
  RAISE NOTICE '';

  -- ============================================================================
  -- SUMMARY
  -- ============================================================================

  RAISE NOTICE '============================================';
  RAISE NOTICE ' MIGRATION COMPLETE!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What happened:';
  RAISE NOTICE '   1. Migrated all doctor data from profiles → doctors';
  RAISE NOTICE '   2. Mapped full_name → contact_name';
  RAISE NOTICE '   3. Mapped email → contact_email';
  RAISE NOTICE '   4. Extracted specialty from name prefix';
  RAISE NOTICE '   5. Removed doctor records from profiles';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run V2 upgrade migration';
  RAISE NOTICE '';
END $$;
