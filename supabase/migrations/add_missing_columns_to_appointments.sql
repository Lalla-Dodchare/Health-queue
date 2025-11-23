-- Add missing columns to appointments table
-- This fixes the "branch_id does not exist" error

-- Add branch_id column (foreign key to branches table)
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;

-- Add department_id column if it doesn't exist
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_branch_id ON appointments(branch_id);
CREATE INDEX IF NOT EXISTS idx_appointments_department_id ON appointments(department_id);

-- Add comment for documentation
COMMENT ON COLUMN appointments.branch_id IS 'Reference to the branch where the appointment is scheduled';
COMMENT ON COLUMN appointments.department_id IS 'Reference to the department for the appointment';
