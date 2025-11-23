const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function inspectAllTables() {
  console.log('📊 Inspecting ALL tables from screenshot...\n')

  // All tables from the screenshot
  const allTables = [
    // Core tables
    'profiles',
    'appointments',
    'doctors',
    'departments',
    'branches',
    'admin_messages',
    'notifications',

    // Questionable tables
    'admin_chats',
    'admins',
    'appointment_events',
    'branch_departments',
    'doctor_available_times',
    'appointment_queue_config',

    // Possibly unused
    'payments',
    'points_history',

    // Views (v_ prefix)
    'v_admin_message_conversations',
    'v_doctor_today_queue'
  ]

  for (const tableName of allTables) {
    console.log(`\n${'='.repeat(70)}`)
    console.log(`📋 TABLE: ${tableName}`)
    console.log('='.repeat(70))

    // Try to get row count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log(`❌ Error: ${countError.message}`)
      console.log('   → Likely a VIEW or doesn\'t exist\n')
      continue
    }

    console.log(`📊 Total rows: ${count}`)

    // If has data, show sample
    if (count > 0) {
      const { data: sample, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (!sampleError && sample && sample.length > 0) {
        console.log('\n📝 Columns:')
        Object.keys(sample[0]).forEach(col => {
          console.log(`   • ${col}`)
        })
      }
    } else {
      console.log('   → Empty table (not used yet)\n')
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('✅ Full inspection complete!\n')
}

inspectAllTables().catch(console.error)
