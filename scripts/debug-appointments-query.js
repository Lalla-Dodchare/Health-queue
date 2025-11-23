/**
 * Debug appointments query to find exact error
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugQuery() {
  try {
    console.log('🔍 Testing appointments query with FK relationships...\n')

    const userId = 'c12db1cb-d298-4abf-931a-01e451210c5b'

    // Test the exact query from app/dashboard/appointments/page.js
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        primary_date,
        primary_time,
        secondary_date,
        secondary_time,
        approved_option,
        primary_flexible,
        secondary_flexible,
        status,
        notes,
        created_at,
        doctors!appointments_doctor_id_fkey (
          id,
          contact_name,
          contact_email,
          specialty
        ),
        branches!appointments_branch_id_fkey (
          id,
          name
        ),
        departments!appointments_department_id_fkey (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .order('primary_date', { ascending: false })
      .order('primary_time', { ascending: false })

    if (error) {
      console.error('❌ Error details:')
      console.error('Message:', error.message)
      console.error('Details:', error.details)
      console.error('Hint:', error.hint)
      console.error('Code:', error.code)
      console.error('Full error:', JSON.stringify(error, null, 2))
      return
    }

    console.log('✅ Query successful!')
    console.log(`Found ${data.length} appointments:\n`)
    console.log(JSON.stringify(data, null, 2))

  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    console.error('Stack:', error.stack)
  }
}

debugQuery()
