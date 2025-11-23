-- ดึงข้อมูลทั้งหมดจากตาราง profiles
SELECT
  id,
  full_name,
  email,
  phone,
  role,
  is_foreign,
  passport_number,
  created_at
FROM profiles
ORDER BY created_at;
