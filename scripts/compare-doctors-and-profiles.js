const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function compareData() {
  console.log('🔍 Comparing doctors table vs profiles with doctor data...\n')

  // 1. ดึงข้อมูลจากตาราง doctors
  console.log('=' .repeat(80))
  console.log('📋 TABLE: doctors (current state)')
  console.log('=' .repeat(80))

  const { data: doctorsData, error: doctorsError } = await supabase
    .from('doctors')
    .select('*')
    .order('created_at', { ascending: true })

  if (doctorsError) {
    console.log(`❌ Error: ${doctorsError.message}`)
  } else {
    console.log(`\n📊 Total records: ${doctorsData.length}`)
    doctorsData.forEach((doc, idx) => {
      console.log(`\n[${idx + 1}] Doctor:`)
      console.log(`   Name: ${doc.contact_name || doc.name}`)
      console.log(`   Email: ${doc.contact_email || doc.email}`)
      console.log(`   Specialty: ${doc.specialty}`)
      console.log(`   Branch ID: ${doc.branch_id}`)
      console.log(`   Department ID: ${doc.department_id}`)
      console.log(`   User ID: ${doc.user_id}`)
    })
  }

  // 2. ดึงข้อมูลหมอจากตาราง profiles (ข้อมูลที่อยู่ผิดที่)
  console.log('\n\n' + '=' .repeat(80))
  console.log('📋 TABLE: profiles (doctor data - WRONG TABLE!)')
  console.log('=' .repeat(80))

  const { data: profileDoctors, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, created_at')
    .or('email.like.%doctor%,full_name.like.ทพ.%,full_name.like.ทพญ.%,full_name.like.พญ.%,full_name.like.นพ.%')
    .order('created_at', { ascending: true })

  if (profileError) {
    console.log(`❌ Error: ${profileError.message}`)
  } else {
    console.log(`\n📊 Total doctor records in profiles: ${profileDoctors.length}`)
    console.log('\n⚠️  These should be in "doctors" table, not "profiles"!\n')

    profileDoctors.forEach((doc, idx) => {
      console.log(`[${idx + 1}] ${doc.full_name}`)
      console.log(`    Email: ${doc.email}`)
      console.log(`    Phone: ${doc.phone || 'N/A'}`)
      console.log(`    ID: ${doc.id}`)
      console.log('')
    })
  }

  // 3. วิเคราะห์และแนะนำ
  console.log('=' .repeat(80))
  console.log('💡 ANALYSIS & RECOMMENDATIONS')
  console.log('=' .repeat(80))
  console.log('')
  console.log('🔴 Problem:')
  console.log(`   • doctors table has only ${doctorsData?.length || 0} record(s)`)
  console.log(`   • profiles table has ${profileDoctors?.length || 0} doctor records (WRONG!)`)
  console.log('')
  console.log('✅ Solution:')
  console.log('   1. Migrate doctor data from profiles → doctors table')
  console.log('   2. Map email/name to contact_email/contact_name')
  console.log('   3. Extract specialty from full_name or email')
  console.log('   4. Delete doctor records from profiles')
  console.log('')
  console.log('📝 Fields to migrate:')
  console.log('   profiles.full_name     → doctors.contact_name')
  console.log('   profiles.email         → doctors.contact_email')
  console.log('   profiles.phone         → doctors.phone')
  console.log('   Extract from name/email → doctors.specialty')
  console.log('')
  console.log('⚠️  Note: Do NOT delete yet - migrate first!')
  console.log('')
}

compareData().catch(console.error)
