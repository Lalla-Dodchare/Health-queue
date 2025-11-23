/**
 * Check appointments table status enum values
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkStatusEnum() {
  try {
    console.log('🔍 Checking appointments.status enum values...\n')

    // Query to get enum values
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT
          enumlabel as allowed_values
        FROM pg_enum
        WHERE enumtypid = (
          SELECT oid
          FROM pg_type
          WHERE typname = 'appointment_status'
        )
        ORDER BY enumsortorder;
      `
    })

    if (error) {
      console.error('❌ Error (RPC not available):', error.message)
      console.log('\n💡 Trying alternative method...\n')

      // Try inserting with different status values to see what works
      const testStatuses = ['pending', 'approved', 'rejected', 'confirmed', 'scheduled']

      for (const status of testStatuses) {
        const { data: testData, error: testError } = await supabase
          .from('appointments')
          .insert({
            status: status,
            user_id: '00000000-0000-0000-0000-000000000000' // Fake UUID for test
          })
          .select()

        if (!testError) {
          console.log(`✅ "${status}" - VALID`)
          // Clean up test data
          await supabase.from('appointments').delete().eq('user_id', '00000000-0000-0000-0000-000000000000')
        } else {
          if (testError.code === '22P02') {
            console.log(`❌ "${status}" - INVALID (not in enum)`)
          } else {
            console.log(`⚠️  "${status}" - ${testError.message}`)
          }
        }
      }
      return
    }

    console.log('✅ Allowed status values:')
    data.forEach((row, index) => {
      console.log(`${index + 1}. "${row.allowed_values}"`)
    })

  } catch (error) {
    console.error('❌ Fatal error:', error.message)
  }
}

checkStatusEnum()
