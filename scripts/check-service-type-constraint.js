/**
 * Check service_type constraint values
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkServiceTypeConstraint() {
  try {
    console.log('🔍 Testing service_type values...\n')

    const testValues = ['standard', 'premium', 'vip', 'normal', 'basic', null]

    for (const serviceType of testValues) {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          status: 'pending',
          service_type: serviceType
        })
        .select()

      if (!error) {
        console.log(`✅ "${serviceType}" - VALID`)
        // Clean up
        await supabase.from('appointments').delete().eq('user_id', '00000000-0000-0000-0000-000000000000')
      } else {
        if (error.code === '23514') {
          console.log(`❌ "${serviceType}" - INVALID (violates constraint)`)
        } else {
          console.log(`⚠️  "${serviceType}" - ${error.message}`)
        }
      }
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message)
  }
}

checkServiceTypeConstraint()
