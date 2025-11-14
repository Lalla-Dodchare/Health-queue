-- =====================================================
-- Health Queue - Database Migration Script
-- =====================================================
-- วัตถุประสงค์: แก้ไข FK ของ admins และ doctors ให้ชี้ไปที่ auth.users.id
-- แทนที่จะชี้ไปที่ profiles.id
--
-- Design:
--   - auth.users = Single source of truth for identity
--   - profiles = Optional metadata table
--   - admins/doctors = Role tables with user_id FK → auth.users.id
-- =====================================================

-- 1. แก้ไข admins table
-- ลบ FK constraint เดิม (ถ้ามี)
ALTER TABLE public.admins
  DROP CONSTRAINT IF EXISTS admins_user_fk;

ALTER TABLE public.admins
  DROP CONSTRAINT IF EXISTS admins_user_id_fkey;

-- เพิ่ม FK constraint ใหม่ที่ชี้ไปที่ auth.users.id
ALTER TABLE public.admins
  ADD CONSTRAINT admins_user_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

COMMENT ON CONSTRAINT admins_user_fk ON public.admins IS
'FK to auth.users - admin role references primary identity';

-- =====================================================

-- 2. แก้ไข doctors table
-- ลบ FK constraint เดิม (ถ้ามี)
ALTER TABLE public.doctors
  DROP CONSTRAINT IF EXISTS doctors_user_fk;

ALTER TABLE public.doctors
  DROP CONSTRAINT IF EXISTS doctors_user_id_fkey;

-- เพิ่ม FK constraint ใหม่ที่ชี้ไปที่ auth.users.id
ALTER TABLE public.doctors
  ADD CONSTRAINT doctors_user_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

COMMENT ON CONSTRAINT doctors_user_fk ON public.doctors IS
'FK to auth.users - doctor role references primary identity';

-- =====================================================

-- 3. ตรวจสอบ profiles table structure
-- profiles ควรมี id (PK) ที่เป็น FK ไปที่ auth.users.id ด้วย
-- (ถ้ายังไม่มี)

-- ลบ FK constraint เดิม (ถ้ามี)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- เพิ่ม FK constraint ให้ profiles.id ชี้ไปที่ auth.users.id
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

COMMENT ON CONSTRAINT profiles_id_fkey ON public.profiles IS
'FK to auth.users - profiles are optional metadata for auth users';

-- =====================================================

-- 4. สร้าง trigger สำหรับ auto-create profile (OPTIONAL)
-- ถ้าต้องการให้สร้าง profile อัตโนมัติเมื่อมี user ใหม่

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- สร้าง profile row อัตโนมัติเมื่อมี auth user ใหม่
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- ถ้ามีอยู่แล้วไม่ต้องทำอะไร

  RETURN new;
END;
$$;

-- ลบ trigger เดิม (ถ้ามี)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- สร้าง trigger ใหม่
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

COMMENT ON FUNCTION public.handle_new_auth_user() IS
'Auto-create profile when new auth.users row is inserted';

-- =====================================================

-- 5. ตรวจสอบผลลัพธ์
-- Query เพื่อดูว่า FK ทั้งหมดถูกต้องหรือไม่

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('admins', 'doctors', 'profiles')
ORDER BY tc.table_name;

-- ควรเห็น:
-- admins.user_id → auth.users.id
-- doctors.user_id → auth.users.id
-- profiles.id → auth.users.id

-- =====================================================
-- Migration Complete!
-- =====================================================

-- วิธีใช้:
-- 1. Copy script ทั้งหมด
-- 2. ไปที่ Supabase Dashboard → SQL Editor
-- 3. Paste และกด Run
-- 4. ตรวจสอบผลลัพธ์จาก query ข้อ 5

-- หมายเหตุ:
-- - ถ้ามี data เก่าใน admins/doctors ที่ user_id ชี้ไปที่ profiles.id
--   อาจต้องแก้ไขก่อน (หรือลบแล้วสร้างใหม่)
-- - Trigger จะทำงานเฉพาะ user ใหม่ที่สร้างหลังจากนี้
-- - User เก่าอาจต้องสร้าง profile manually หรือใช้งานได้โดยไม่มี profile
