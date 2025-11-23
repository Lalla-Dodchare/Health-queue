/**
 * Script to check RLS policies for booking-related tables
 * Run: node scripts/check-rls-policies.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruipljhpvyoxvnhvtugt.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aXBsamhwdnlveHZuaHZ0dWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NjQ0NjEsImV4cCI6MjA1MTM0MDQ2MX0.gByOcEaL-QVAMnB7fCCXAIbuzLF_qDY_H31JxZXLxTg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRLSPolicies() {
  const tablesToCheck = [
    'branches',
    'departments',
    'branch_departments',
    'doctors'
  ]

  console.log('\n🔍 Testing RLS Policies for Booking Tables...\n')

  for (const table of tablesToCheck) {
    console.log(`\n📋 Testing: ${table}`)
    console.log('─'.repeat(50))

    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false })
        .limit(1)

      if (error) {
        console.log(`❌ ERROR: ${error.message}`)
        console.log(`   Code: ${error.code}`)
        console.log(`   Details: ${JSON.stringify(error.details)}`)
        console.log(`   Hint: ${error.hint}`)
        console.log(`\n   🔒 RLS is likely BLOCKING access!`)
        console.log(`   Fix: Enable RLS policy for 'anon' role or disable RLS`)
      } else {
        console.log(`✅ SUCCESS: Can read from ${table}`)
        console.log(`   Total records available: ${count || data?.length || 0}`)
        if (data && data.length > 0) {
          console.log(`   Sample record:`, JSON.stringify(data[0]))
        }
      }
    } catch (e) {
      console.log(`❌ EXCEPTION: ${e.message}`)
    }
  }

  // Test specific query that the booking page uses
  console.log(`\n\n🎯 Testing Exact Booking Page Query...`)
  console.log('─'.repeat(50))

  try {
    const { data, error } = await supabase
      .from('branch_departments')
      .select(`
        department_id,
        departments (
          id,
          name
        )
      `)
      .eq('branch_id', 1)
      .limit(5)

    if (error) {
      console.log(`❌ ERROR: ${error.message}`)
      console.log(`   This is why the dropdown is empty!`)
    } else {
      console.log(`✅ SUCCESS: Query works!`)
      console.log(`   Found ${data?.length || 0} departments for branch 1`)
      console.log(`   Data:`, JSON.stringify(data, null, 2))
    }
  } catch (e) {
    console.log(`❌ EXCEPTION: ${e.message}`)
  }
}

checkRLSPolicies()
  .then(() => {
    console.log('\n\n✅ Check complete!\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
