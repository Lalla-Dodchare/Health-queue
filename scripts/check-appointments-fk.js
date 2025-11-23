/**
 * Check appointments foreign keys
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkForeignKeys() {
  try {
    console.log('🔍 Checking appointments table foreign keys...\n')

    // Try different query approaches
    console.log('Testing query with doctor_id FK name:\n')

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        doctor:doctor_id(id, contact_name),
        user:user_id(id, name)
      `)
      .limit(1)

    if (error) {
      console.log('❌ Error with doctor:doctor_id syntax:', error.message)
      console.log('\nTrying alternative...\n')

      // Try with FK constraint name
      const { data: data2, error: error2 } = await supabase
        .from('appointments')
        .select(`
          id,
          doctors!appointments_doctor_id_fkey(id, contact_name)
        `)
        .limit(1)

      if (error2) {
        console.log('❌ Error with FK constraint name:', error2.message)
        console.log('\nDetails:', error2.details)
        console.log('Hint:', error2.hint)
      } else {
        console.log('✅ Success with FK constraint name!')
        console.log('Use: doctors!appointments_doctor_id_fkey(...)')
      }
    } else {
      console.log('✅ Success with doctor:doctor_id syntax!')
      console.log('Use: doctor:doctor_id(...)')
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message)
  }
}

checkForeignKeys()
