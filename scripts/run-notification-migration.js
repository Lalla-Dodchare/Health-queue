require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runMigration() {
  console.log('🚀 Creating appointment_notifications table...\n')

  try {
    // ลบตารางเก่าถ้ามี (สำหรับ development)
    console.log('🗑️  Dropping existing table (if any)...')
    const { error: dropError } = await supabase.rpc('exec', {
      sql: 'DROP TABLE IF EXISTS appointment_notifications CASCADE;'
    }).catch(() => {
      // Ignore error if function doesn't exist
    })

    // สร้างตาราง
    console.log('📝 Creating table...')

    // เนื่องจากไม่สามารถรัน SQL โดยตรงได้ ให้ใช้วิธีสร้างผ่าน Supabase Dashboard
    console.log('\n⚠️  Please run this SQL manually in Supabase Dashboard:\n')
    console.log('='.repeat(60))
    console.log(`
-- สร้างตารางสำหรับ track การส่ง SMS แจ้งเตือน
CREATE TABLE IF NOT EXISTS appointment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('3_days', '1_day', '6_hours')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(appointment_id, reminder_type)
);

-- Foreign key (ถ้ามีตาราง appointments)
ALTER TABLE appointment_notifications
  ADD CONSTRAINT fk_appointment
  FOREIGN KEY (appointment_id)
  REFERENCES appointments(id)
  ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_appointment
  ON appointment_notifications(appointment_id);

CREATE INDEX IF NOT EXISTS idx_appointment_notifications_type
  ON appointment_notifications(reminder_type);

CREATE INDEX IF NOT EXISTS idx_appointment_notifications_sent_at
  ON appointment_notifications(sent_at);

-- Enable RLS
ALTER TABLE appointment_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own appointment notifications"
  ON appointment_notifications FOR SELECT
  USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all notifications"
  ON appointment_notifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
`)
    console.log('='.repeat(60))

    console.log('\n📍 Steps:')
    console.log('1. Go to https://supabase.com/dashboard')
    console.log('2. Select your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Paste the SQL above')
    console.log('5. Click "Run"\n')

    console.log('✅ After running the SQL, your notification system will be ready!\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

runMigration()
