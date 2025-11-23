-- ============================================================================
-- DATABASE CLEANUP & V2 UPGRADE MIGRATION
-- ============================================================================
-- Purpose: ลบตารางที่ไม่ใช้แล้ว + เพิ่ม V2 features
-- Date: 2025-01-21
-- Author: Nam + Claude
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: ลบตารางที่ไม่ใช้แล้ว (V1 Legacy)
-- ============================================================================

RAISE NOTICE 'PART 1: Cleaning up unused tables...';

-- 1. ลบตาราง admin_chats (ว่างเปล่า + มี admin_messages แล้ว)
DROP TABLE IF EXISTS admin_chats CASCADE;
RAISE NOTICE '   ✓ Dropped admin_chats';

-- 2. ลบตาราง appointment_events (ว่างเปล่า + ไม่ได้ใช้งาน)
DROP TABLE IF EXISTS appointment_events CASCADE;
RAISE NOTICE '   ✓ Dropped appointment_events';

-- 3. ลบตาราง appointment_queue_config (V2 ไม่ใช้ queue แบบเดิม)
DROP TABLE IF EXISTS appointment_queue_config CASCADE;
RAISE NOTICE '   ✓ Dropped appointment_queue_config';

-- 4. ลบตาราง points_history (ว่างเปล่า + profiles มี points อยู่แล้ว)
DROP TABLE IF EXISTS points_history CASCADE;
RAISE NOTICE '   ✓ Dropped points_history';

-- 5. ลบ view v_doctor_today_queue (V2 ไม่มี doctor role)
DROP VIEW IF EXISTS v_doctor_today_queue CASCADE;
RAISE NOTICE '   ✓ Dropped v_doctor_today_queue';

-- 6. เก็บตาราง admins ไว้ (สำหรับ admin-specific features ในอนาคต)
--    เช่น: permissions, assigned_branches, admin_status
--    Note: ไม่ลบ เพราะ admin มี fields เฉพาะที่ไม่ควรปนกับ profiles
RAISE NOTICE '   INFO: Kept admins table (for future admin-specific features)';

RAISE NOTICE 'Part 1 Complete: Cleaned up 5 unused tables/views';

-- ============================================================================
-- PART 2: อัพเกรด profiles table (เพิ่ม V2 fields)
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE 'PART 2: Upgrading profiles table...';

-- เพิ่ม id_card column สำหรับคนไทย
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS id_card TEXT UNIQUE;

-- เพิ่ม status column (สำหรับ user status - ไม่ใช่ admin status)
-- admin status จะอยู่ในตาราง admins แยก
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
CHECK (status IN ('active', 'inactive', 'suspended', 'banned'));

-- เพิ่ม gender column (มีใน foreigner registration)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gender TEXT
CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));

-- เพิ่ม index
CREATE INDEX IF NOT EXISTS idx_profiles_id_card ON profiles(id_card);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_foreign ON profiles(is_foreign);

RAISE NOTICE '   ✓ Added id_card column (for Thai citizens)';
RAISE NOTICE '   ✓ Added status column (user status, not admin status)';
RAISE NOTICE '   ✓ Added gender column';
RAISE NOTICE '   ✓ Created indexes';
RAISE NOTICE 'Part 2 Complete: profiles table upgraded';

-- ============================================================================
-- PART 3: อัพเกรด appointments table (เพิ่ม V2 fields)
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE 'PART 3: Upgrading appointments table...';

-- V2 Two-date booking system
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS primary_date DATE;

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS primary_time TIME;

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS primary_flexible BOOLEAN DEFAULT false;

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS secondary_date DATE;

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS secondary_time TIME;

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS secondary_flexible BOOLEAN DEFAULT false;

-- Admin approval fields
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS confirmed_date DATE;

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS confirmed_time TIME;

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS approved_option TEXT
CHECK (approved_option IN ('primary', 'secondary'));

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Service type (standard vs agency_assisted)
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'standard'
CHECK (service_type IN ('standard', 'agency_assisted'));

-- Symptoms and notes
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS symptoms TEXT;

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS notes TEXT;

-- เพิ่ม index
CREATE INDEX IF NOT EXISTS idx_appointments_primary_date ON appointments(primary_date);
CREATE INDEX IF NOT EXISTS idx_appointments_secondary_date ON appointments(secondary_date);
CREATE INDEX IF NOT EXISTS idx_appointments_confirmed_date ON appointments(confirmed_date);
CREATE INDEX IF NOT EXISTS idx_appointments_service_type ON appointments(service_type);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

RAISE NOTICE '   ✓ Added two-date booking fields';
RAISE NOTICE '   ✓ Added admin approval fields';
RAISE NOTICE '   ✓ Added service_type, symptoms, notes';
RAISE NOTICE '   ✓ Created indexes';
RAISE NOTICE 'Part 3 Complete: appointments table upgraded';

-- ============================================================================
-- PART 4: ทำความสะอาด doctors table
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE 'PART 4: Cleaning up doctors table...';

-- ลบ user_id column (หมอไม่ใช่ user ในระบบ)
ALTER TABLE doctors
DROP COLUMN IF EXISTS user_id CASCADE;

-- ลบ email, name ที่ซ้ำกับ contact_email, contact_name
ALTER TABLE doctors
DROP COLUMN IF EXISTS email CASCADE;

ALTER TABLE doctors
DROP COLUMN IF EXISTS name CASCADE;

-- ลบ fee column (ไม่มีระบบคิดค่าบริการออนไลน์)
ALTER TABLE doctors
DROP COLUMN IF EXISTS fee CASCADE;

-- ลบ available_days column (ใช้ doctor_available_times table แทน)
ALTER TABLE doctors
DROP COLUMN IF EXISTS available_days CASCADE;

-- เปลี่ยนชื่อ contact_* fields ให้สั้นลง (เพราะลบ email/name แล้ว)
-- Note: ถ้ามี contact_email, contact_name อยู่แล้ว จะเก็บไว้
-- ถ้าไม่มี จะสร้างใหม่

-- Ensure contact fields exist
ALTER TABLE doctors
ADD COLUMN IF NOT EXISTS contact_name TEXT NOT NULL DEFAULT 'Unknown Doctor';

ALTER TABLE doctors
ADD COLUMN IF NOT EXISTS contact_email TEXT;

ALTER TABLE doctors
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE doctors
ADD COLUMN IF NOT EXISTS line_id TEXT;

RAISE NOTICE '   ✓ Removed user_id (doctors are not users)';
RAISE NOTICE '   ✓ Removed duplicate email/name columns';
RAISE NOTICE '   ✓ Removed fee column (no online payment system)';
RAISE NOTICE '   ✓ Removed available_days column (use doctor_available_times instead)';
RAISE NOTICE '   ✓ Ensured contact fields exist';
RAISE NOTICE 'Part 4 Complete: doctors table cleaned';

-- ============================================================================
-- PART 5: เพิ่ม Comments & Documentation
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE 'PART 5: Adding table comments...';

COMMENT ON TABLE profiles IS 'User profiles - supports both Thai citizens (with id_card) and foreigners (with passport_number)';
COMMENT ON COLUMN profiles.id_card IS 'Thai national ID (13 digits) - for Thai citizens only';
COMMENT ON COLUMN profiles.passport_number IS 'Passport number - for foreigners only';
COMMENT ON COLUMN profiles.is_foreign IS 'true = foreigner, false = Thai citizen';
COMMENT ON COLUMN profiles.status IS 'User status: active, inactive, suspended, or banned (admin status is in admins table)';
COMMENT ON COLUMN profiles.service_preference IS 'For foreigners: standard (self-service) or agency_assisted';

COMMENT ON TABLE appointments IS 'V2 appointments with two-date booking system';
COMMENT ON COLUMN appointments.primary_date IS 'First choice date';
COMMENT ON COLUMN appointments.primary_time IS 'First choice time';
COMMENT ON COLUMN appointments.primary_flexible IS 'Allow ±1 hour flexibility for primary time';
COMMENT ON COLUMN appointments.secondary_date IS 'Second choice date';
COMMENT ON COLUMN appointments.secondary_time IS 'Second choice time';
COMMENT ON COLUMN appointments.secondary_flexible IS 'Allow ±1 hour flexibility for secondary time';
COMMENT ON COLUMN appointments.confirmed_date IS 'Admin-approved date (from primary or secondary)';
COMMENT ON COLUMN appointments.confirmed_time IS 'Admin-approved time';
COMMENT ON COLUMN appointments.approved_option IS 'Which option was approved: primary or secondary';
COMMENT ON COLUMN appointments.service_type IS 'standard (self) or agency_assisted (with admin help)';

COMMENT ON TABLE doctors IS 'Doctor contact information (NOT user accounts - doctors cannot log in)';
COMMENT ON COLUMN doctors.contact_name IS 'Doctor full name';
COMMENT ON COLUMN doctors.contact_email IS 'Doctor email for coordination';
COMMENT ON COLUMN doctors.phone IS 'Doctor phone number';
COMMENT ON COLUMN doctors.line_id IS 'Doctor LINE ID for chat coordination';

RAISE NOTICE 'Part 5 Complete: Documentation added';

-- ============================================================================
-- SUMMARY
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '============================================';
RAISE NOTICE ' MIGRATION COMPLETE!';
RAISE NOTICE '============================================';
RAISE NOTICE '';
RAISE NOTICE 'Deleted Tables:';
RAISE NOTICE '   • admin_chats';
RAISE NOTICE '   • appointment_events';
RAISE NOTICE '   • appointment_queue_config';
RAISE NOTICE '   • points_history';
RAISE NOTICE '   • v_doctor_today_queue';
RAISE NOTICE '';
RAISE NOTICE 'Kept Tables:';
RAISE NOTICE '   • admins (for future admin-specific features)';
RAISE NOTICE '   • notifications (for future notifications)';
RAISE NOTICE '   • payments (for future payment tracking)';
RAISE NOTICE '';
RAISE NOTICE 'Updated Tables:';
RAISE NOTICE '   • profiles: +id_card, +status, +gender';
RAISE NOTICE '   • appointments: +two-date fields, +service_type';
RAISE NOTICE '   • doctors: -user_id, -email, -name, -fee, -available_days';
RAISE NOTICE '';
RAISE NOTICE '🚀 System is now V2 ready!';
RAISE NOTICE '';

COMMIT;
