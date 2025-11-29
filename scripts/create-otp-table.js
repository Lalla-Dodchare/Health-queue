/**
 * Script to create otp_verifications table in Supabase
 * Run: node scripts/create-otp-table.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createOTPTable() {
  console.log('🔵 Creating otp_verifications table...')

  try {
    // Create table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create otp_verifications table
        CREATE TABLE IF NOT EXISTS otp_verifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT NOT NULL,
          otp TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);
        CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON otp_verifications(expires_at);

        -- Enable RLS
        ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Service role can manage OTPs" ON otp_verifications;
        DROP POLICY IF EXISTS "Users cannot access OTPs" ON otp_verifications;

        -- Create policies
        CREATE POLICY "Service role can manage OTPs"
          ON otp_verifications
          FOR ALL
          TO service_role
          USING (true)
          WITH CHECK (true);

        CREATE POLICY "Users cannot access OTPs"
          ON otp_verifications
          FOR ALL
          TO authenticated
          USING (false)
          WITH CHECK (false);
      `
    })

    if (error) {
      console.error('❌ Error creating table:', error)

      // Alternative approach: Use direct SQL execution
      console.log('🔄 Trying alternative approach...')

      const { data, error: queryError } = await supabase
        .from('otp_verifications')
        .select('id')
        .limit(1)

      if (queryError && queryError.code === '42P01') {
        console.log('⚠️  Table does not exist. Please run this SQL manually in Supabase Dashboard:')
        console.log(`
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON otp_verifications(expires_at);

ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage OTPs"
  ON otp_verifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users cannot access OTPs"
  ON otp_verifications
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);
        `)
      } else {
        console.log('✅ Table already exists or was created successfully!')
      }
    } else {
      console.log('✅ Table created successfully!')
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

createOTPTable()
