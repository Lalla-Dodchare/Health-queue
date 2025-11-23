const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function inspectSchema() {
  console.log('📊 Fetching all tables from Supabase...\n')

  // List of known tables to check
  const knownTables = [
    'profiles',
    'appointments',
    'doctors',
    'departments',
    'branches',
    'admin_messages',
    'notifications',
    'queue_items',
    'medical_records'
  ]

  console.log('🔍 Inspecting tables:\n')

  for (const tableName of knownTables) {
    console.log(`\n${'='.repeat(70)}`)
    console.log(`📋 TABLE: ${tableName}`)
    console.log('='.repeat(70))

    // Get one sample row to see columns
    const { data: columns, error: colError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (colError) {
      console.log(`❌ Error: ${colError.message}`)
      continue
    }

    if (columns && columns.length > 0) {
      const sampleRow = columns[0]
      console.log('\n📝 Columns:')
      Object.keys(sampleRow).forEach(col => {
        const value = sampleRow[col]
        let type = typeof value
        if (value === null) type = 'null'
        else if (typeof value === 'object') type = 'object/json'
        console.log(`   • ${col.padEnd(25)} (${type})`)
      })

      console.log('\n📄 Sample data:')
      console.log(JSON.stringify(sampleRow, null, 2))
    } else {
      console.log('\n   (Table is empty - no data to show structure)')
    }

    // Get row count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (!countError) {
      console.log(`\n📊 Total rows: ${count}`)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('✅ Schema inspection complete!')
  console.log('\n💡 ตอนนี้เราจะเห็นตารางทั้งหมดที่มีอยู่ใน Supabase แล้ว')
  console.log('   พร้อมจะวิเคราะห์ว่าอะไรต้องลบ/ปรับตาม V2 plan\n')
}

inspectSchema().catch(console.error)
