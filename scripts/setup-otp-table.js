/**
 * Script to verify or create otp_verifications table
 * This script will check if the table exists and provide SQL if it doesn't
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SQL_TO_RUN = `
-- Create otp_verifications table for email OTP verification during registration
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON otp_verifications(expires_at);

-- Enable Row Level Security
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage OTPs" ON otp_verifications;
DROP POLICY IF EXISTS "Users cannot access OTPs" ON otp_verifications;

-- Policy: Allow service role to do everything (for API routes)
CREATE POLICY "Service role can manage OTPs"
  ON otp_verifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Users cannot access OTP table directly (security)
CREATE POLICY "Users cannot access OTPs"
  ON otp_verifications
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);
`

async function checkAndSetupOTPTable() {
  console.log('🔵 Checking otp_verifications table...')

  try {
    // Try to select from the table
    const { data, error } = await supabase
      .from('otp_verifications')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205' || error.message.includes('does not exist') || error.message.includes('Could not find')) {
        console.log('⚠️  Table does not exist!')
        console.log('\n📋 Please run this SQL in your Supabase Dashboard (SQL Editor):')
        console.log('=' .repeat(80))
        console.log(SQL_TO_RUN)
        console.log('=' .repeat(80))
        console.log('\n📍 Steps:')
        console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard')
        console.log('2. Select your project')
        console.log('3. Click "SQL Editor" in the left sidebar')
        console.log('4. Click "New Query"')
        console.log('5. Copy and paste the SQL above')
        console.log('6. Click "Run" or press Ctrl+Enter')
        console.log('7. Re-run this script to verify')
      } else {
        console.error('❌ Error checking table:', error)
      }
    } else {
      console.log('✅ otp_verifications table exists and is accessible!')
      console.log('✅ OTP system is ready to use')
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  }
}

checkAndSetupOTPTable()
