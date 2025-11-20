-- =============================================================================
-- Google OAuth Profile Auto-Creation Fix
-- =============================================================================
-- ปัญหา: User ที่ login ด้วย Google ไม่มี profile ใน profiles table
-- ทำให้ Admin ไม่เห็นแชทของ user คนนั้น
--
-- วิธีแก้: สร้าง trigger ที่สร้าง profile อัตโนมัติเมื่อมี user ใหม่
-- =============================================================================

-- 1. สร้าง function สำหรับสร้าง profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. สร้าง trigger ที่เรียก function นี้เมื่อมี user ใหม่
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. เพิ่ม profile สำหรับ user ที่มีอยู่แล้วแต่ยังไม่มี profile
INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email) as full_name,
  u.email,
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- =============================================================================
-- หมายเหตุ:
-- - ต้องรัน SQL นี้ใน Supabase SQL Editor
-- - Trigger จะสร้าง profile อัตโนมัติสำหรับ user ใหม่ทุกคน
-- - INSERT statement จะเพิ่ม profile ให้ user ที่มีอยู่แล้ว
-- =============================================================================
