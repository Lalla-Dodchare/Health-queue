/**
 * Script to verify doctors data after insertion
 * Run: node scripts/verify-doctors-data.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruipljhpvyoxvnhvtugt.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aXBsamhwdnlveHZuaHZ0dWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NjQ0NjEsImV4cCI6MjA1MTM0MDQ2MX0.gByOcEaL-QVAMnB7fCCXAIbuzLF_qDY_H31JxZXLxTg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyDoctorsData() {
  console.log('\n🔍 Verifying Doctors Data...\n')

  // Get total count
  const { count: totalCount, error: countError } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.log('❌ Error counting doctors:', countError.message)
    return
  }

  console.log(`✅ Total Doctors: ${totalCount}`)

  // Get count by branch
  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .order('name')

  console.log('\n📊 Doctors per Branch:')
  for (const branch of branches) {
    const { count } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('branch_id', branch.id)

    console.log(`   ${branch.name}: ${count} doctors`)
  }

  // Check departments with doctor counts
  console.log('\n🏥 Doctors per Department (Chula):')
  const { data: chulaDepts } = await supabase
    .from('branch_departments')
    .select(`
      departments (
        id,
        name
      )
    `)
    .eq('branch_id', 1)

  for (const item of chulaDepts) {
    const { count } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', item.departments.id)
      .eq('branch_id', 1)

    console.log(`   ${item.departments.name}: ${count} doctors`)
  }

  console.log('\n🏥 Doctors per Department (Phahonyothin):')
  const { data: phahonDepts } = await supabase
    .from('branch_departments')
    .select(`
      departments (
        id,
        name
      )
    `)
    .eq('branch_id', 2)

  for (const item of phahonDepts) {
    const { count } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', item.departments.id)
      .eq('branch_id', 2)

    console.log(`   ${item.departments.name}: ${count} doctors`)
  }

  // Show sample doctors
  console.log('\n👨‍⚕️ Sample Doctors:')
  const { data: sampleDoctors } = await supabase
    .from('doctors')
    .select('name_th, name_en, specialty_th, specialty_en')
    .limit(5)

  sampleDoctors.forEach((doc, idx) => {
    console.log(`   ${idx + 1}. ${doc.name_th} (${doc.name_en})`)
    console.log(`      ${doc.specialty_th} (${doc.specialty_en})`)
  })

  console.log('\n✅ Verification Complete!')
}

verifyDoctorsData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
