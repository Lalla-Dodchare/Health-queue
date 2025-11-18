-- Add columns for appointment cancellation and rescheduling
-- Run this in Supabase SQL Editor

-- Add cancellation fields to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS rescheduled_from UUID REFERENCES appointments(id),
ADD COLUMN IF NOT EXISTS rescheduled_to UUID REFERENCES appointments(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_cancelled_at ON appointments(cancelled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_rescheduled_from ON appointments(rescheduled_from);

-- Update status enum to include 'cancelled' and 'rescheduled'
-- Note: You may need to run this depending on your existing status field type
-- ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'cancelled';
-- ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'rescheduled';

-- Or if status is just a text field, no changes needed

COMMENT ON COLUMN appointments.cancelled_at IS 'Timestamp when appointment was cancelled';
COMMENT ON COLUMN appointments.cancellation_reason IS 'Reason for cancellation';
COMMENT ON COLUMN appointments.cancelled_by IS 'User who cancelled the appointment';
COMMENT ON COLUMN appointments.rescheduled_from IS 'Original appointment ID if this is a rescheduled appointment';
COMMENT ON COLUMN appointments.rescheduled_to IS 'New appointment ID if this appointment was rescheduled';
