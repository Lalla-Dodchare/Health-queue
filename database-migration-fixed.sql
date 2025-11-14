-- =====================================================
-- Health Queue - Database Migration Script (FIXED)
-- =====================================================
-- แก้ไข: ทำความสะอาดข้อมูลเก่าก่อนสร้าง FK
-- =====================================================

-- ขั้นตอนที่ 1: ลบข้อมูลทดสอบเก่าทั้งหมด (ถ้ามี)
-- ⚠️ คำเตือน: จะลบข้อมูลทดสอบเก่าทั้งหมด!

-- ลบข้อมูลเก่าใน profiles ที่ไม่มี auth.users
DELETE FROM public.profiles
WHERE id NOT IN (SELECT id FROM auth.users);

-- ลบข้อมูลเก่าใน admins ที่ไม่มี auth.users
DELETE FROM public.admins
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- ลบข้อมูลเก่าใน doctors ที่ไม่มี auth.users
DELETE FROM public.doctors
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- =====================================================

-- ขั้นตอนที่ 2: ลบ FK constraints เดิมทั้งหมด

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.admins
  DROP CONSTRAINT IF EXISTS admins_user_fk;

ALTER TABLE public.admins
  DROP CONSTRAINT IF EXISTS admins_user_id_fkey;

ALTER TABLE public.doctors
  DROP CONSTRAINT IF EXISTS doctors_user_fk;

ALTER TABLE public.doctors
  DROP CONSTRAINT IF EXISTS doctors_user_id_fkey;

-- =====================================================

-- ขั้นตอนที่ 3: สร้าง FK constraints ใหม่ที่ถูกต้อง

-- profiles.id → auth.users.id
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- admins.user_id → auth.users.id
ALTER TABLE public.admins
  ADD CONSTRAINT admins_user_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- doctors.user_id → auth.users.id
ALTER TABLE public.doctors
  ADD CONSTRAINT doctors_user_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- =====================================================

-- ขั้นตอนที่ 4: สร้าง trigger สำหรับ auto-create profile

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
  ON CONFLICT (id) DO NOTHING;

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

-- =====================================================

-- ขั้นตอนที่ 5: ตรวจสอบผลลัพธ์

-- ดู FK constraints ทั้งหมด
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
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('admins', 'doctors', 'profiles')
ORDER BY tc.table_name;

-- ควรเห็นผลลัพธ์:
-- profiles | id       | users   | id        ← profiles.id → auth.users.id
-- admins   | user_id  | users   | id        ← admins.user_id → auth.users.id
-- doctors  | user_id  | users   | id        ← doctors.user_id → auth.users.id

-- =====================================================
-- ตรวจสอบข้อมูลที่เหลือ
-- =====================================================

SELECT 'auth.users' as table_name, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'admins' as table_name, COUNT(*) as count FROM public.admins
UNION ALL
SELECT 'doctors' as table_name, COUNT(*) as count FROM public.doctors;

-- =====================================================
-- Migration Complete!
-- =====================================================

-- Next Steps:
-- 1. ไปที่ http://localhost:3001/register
-- 2. สมัครสมาชิกใหม่
-- 3. ระบบจะสร้าง auth.users และ profiles อัตโนมัติ
-- 4. Login เพื่อทดสอบ
