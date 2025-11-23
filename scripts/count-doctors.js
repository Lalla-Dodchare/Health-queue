/**
 * Script to count doctors by branch
 * Run: node scripts/count-doctors.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruipljhpvyoxvnhvtugt.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aXBsamhwdnlveHZuaHZ0dWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NjQ0NjEsImV4cCI6MjA1MTM0MDQ2MX0.gByOcEaL-QVAMnB7fCCXAIbuzLF_qDY_H31JxZXLxTg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function countDoctors() {
  console.log('\n📊 นับจำนวนหมอในระบบ...\n')

  // Get total count
  const { count: totalCount, error: totalError } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })

  if (totalError) {
    console.log('❌ Error:', totalError.message)
    return
  }

  console.log(`✅ จำนวนหมอทั้งหมด: ${totalCount} คน`)
  console.log('')

  // Get branches
  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .order('id')

  // Count by branch
  console.log('📍 แยกตามสาขา:')
  for (const branch of branches) {
    const { count } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('branch_id', branch.id)

    const icon = branch.id === 1 ? '🏥' : '🏨'
    console.log(`   ${icon} ${branch.name}: ${count} คน`)
  }

  console.log('\n✅ เสร็จสิ้น!')
}

countDoctors()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
