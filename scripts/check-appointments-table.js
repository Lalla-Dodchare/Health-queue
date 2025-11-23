/**
 * Check appointments table schema
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAppointmentsSchema() {
  try {
    console.log('🔍 Checking appointments table schema...\n')

    // Fetch one appointment to see the schema
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No appointments found, checking table structure...')

      // Try to fetch with specific columns we expect
      const { data: test, error: testError } = await supabase
        .from('appointments')
        .select('id, user_id, doctor_id, branch_id, department_id')
        .limit(1)

      if (testError) {
        console.error('❌ Error checking columns:', testError.message)
        console.log('\n💡 Missing columns detected!')
      }
      return
    }

    console.log('✅ Appointments table columns:')
    const columns = Object.keys(data[0])
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col}`)
    })

    console.log('\n🔍 Checking for required columns:')
    const requiredColumns = ['branch_id', 'department_id', 'doctor_id', 'user_id', 'primary_date', 'secondary_date']
    requiredColumns.forEach(col => {
      const exists = columns.includes(col)
      console.log(`${exists ? '✅' : '❌'} ${col}`)
    })

  } catch (error) {
    console.error('Fatal error:', error)
  }
}

checkAppointmentsSchema()
