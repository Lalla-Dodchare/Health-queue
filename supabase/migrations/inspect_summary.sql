-- สรุปจำนวน records
SELECT
  'Total doctors:' as description,
  COUNT(*) as count
FROM doctors
UNION ALL
SELECT
  'Total profiles:' as description,
  COUNT(*) as count
FROM profiles
UNION ALL
SELECT
  'Doctor records in profiles (WRONG!):' as description,
  COUNT(*) as count
FROM profiles
WHERE email LIKE '%doctor%'
  OR full_name LIKE 'ทพ.%'
  OR full_name LIKE 'ทพญ.%'
  OR full_name LIKE 'พญ.%'
  OR full_name LIKE 'นพ.%';
