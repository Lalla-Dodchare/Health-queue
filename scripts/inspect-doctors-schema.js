/**
 * Script to inspect doctors table schema
 * Run: node scripts/inspect-doctors-schema.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruipljhpvyoxvnhvtugt.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aXBsamhwdnlveHZuaHZ0dWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NjQ0NjEsImV4cCI6MjA1MTM0MDQ2MX0.gByOcEaL-QVAMnB7fCCXAIbuzLF_qDY_H31JxZXLxTg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectDoctorsSchema() {
  console.log('\n🔍 Inspecting doctors table schema...\n')

  // Try to get one doctor record to see schema
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .limit(1)

  if (error) {
    console.log('❌ Error:', error.message)
    console.log('   This might mean the table is empty or has permission issues')
  }

  if (data && data.length > 0) {
    console.log('✅ Doctors table has records!')
    console.log('📋 Schema (column names):')
    console.log('   ', Object.keys(data[0]))
    console.log('\n📄 Sample record:')
    console.log('   ', JSON.stringify(data[0], null, 2))
  } else {
    console.log('⚠️  Doctors table is empty')

    // Get schema from information_schema
    console.log('\n📋 Attempting to get schema from database metadata...')
  }

  console.log('\n✅ Done!')
}

inspectDoctorsSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
