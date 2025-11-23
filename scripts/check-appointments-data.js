/**
 * Check if appointments data exists in database
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAppointmentsData() {
  try {
    console.log('🔍 Checking appointments data in database...\n')

    // Simple query to get all appointments
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No appointments found in database!')
      console.log('This means the INSERT is failing silently.\n')
      return
    }

    console.log(`✅ Found ${data.length} appointment(s):\n`)
    data.forEach((apt, index) => {
      console.log(`${index + 1}. ID: ${apt.id}`)
      console.log(`   User ID: ${apt.user_id}`)
      console.log(`   Doctor ID: ${apt.doctor_id}`)
      console.log(`   Status: ${apt.status}`)
      console.log(`   Primary Date: ${apt.primary_date}`)
      console.log(`   Created: ${apt.created_at}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Fatal error:', error.message)
  }
}

checkAppointmentsData()
