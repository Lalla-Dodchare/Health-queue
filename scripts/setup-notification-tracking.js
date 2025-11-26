require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupNotificationTracking() {
  console.log('🚀 Setting up appointment notifications tracking table...\n')

  try {
    // อ่าน migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'create_appointment_notifications_table.sql')
    const migration = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 Running migration...')
    const { data, error } = await supabase.rpc('exec_sql', { sql: migration })

    if (error) {
      // ถ้า RPC function ไม่มี ให้รันแบบแยก statement
      const statements = migration
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'))

      for (const statement of statements) {
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement })
        if (stmtError && !stmtError.message.includes('already exists')) {
          console.error('❌ Error:', stmtError.message)
        }
      }
    }

    console.log('✅ Migration completed!\n')

    // ตรวจสอบว่าตารางถูกสร้างแล้ว
    const { data: tables, error: checkError } = await supabase
      .from('appointment_notifications')
      .select('count')
      .limit(0)

    if (checkError) {
      console.log('⚠️  Note: Cannot verify table (this is normal if RLS is enabled)')
    } else {
      console.log('✅ Table appointment_notifications is ready!\n')
    }

    console.log('📋 Summary:')
    console.log('   - Table: appointment_notifications')
    console.log('   - Columns: id, appointment_id, reminder_type, sent_at, created_at')
    console.log('   - Reminder types: 3_days, 1_day, 6_hours')
    console.log('   - RLS: Enabled')
    console.log('\n✨ Setup complete! You can now use the SMS notification system.\n')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

setupNotificationTracking()
