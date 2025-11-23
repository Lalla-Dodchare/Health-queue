-- ดึงข้อมูลทั้งหมดจากตาราง doctors
SELECT
  id,
  contact_name,
  contact_email,
  phone,
  specialty,
  status,
  contact_type,
  branch_id,
  department_id,
  created_at
FROM doctors
ORDER BY created_at;
