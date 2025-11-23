-- Remove foreign key constraint from doctors table
-- Reason: Doctors don't need to login to the system, so they don't need to be linked to users table

-- Drop the foreign key constraint
ALTER TABLE doctors DROP CONSTRAINT IF EXISTS doctors_id_fkey;

-- Verify constraint was removed
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conrelid = 'doctors'::regclass
  AND contype = 'f';  -- foreign key constraints only
