-- Remove duplicate and unused columns from profiles table

-- 1. Drop address column (not needed)
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS address;

-- 2. Drop passport_id column (use passport_number instead)
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS passport_id;

-- Note: We keep passport_number as the main passport field
COMMENT ON COLUMN public.profiles.passport_number IS 'Passport number for foreign users (alternative to id_card)';
