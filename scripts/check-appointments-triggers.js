/**
 * Check triggers on appointments table
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTriggers() {
  try {
    console.log('🔍 Checking triggers on appointments table...\\n')

    // Query to get all triggers on appointments table
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          trigger_name,
          event_manipulation,
          action_statement,
          action_timing
        FROM information_schema.triggers
        WHERE event_object_table = 'appointments'
        ORDER BY trigger_name;
      `
    })

    if (error) {
      console.log('⚠️  Cannot query triggers via RPC (expected - trying direct query)\\n')

      // Try alternative: query pg_trigger directly
      const query = `
        SELECT DISTINCT
          t.tgname AS trigger_name,
          pg_get_triggerdef(t.oid) AS trigger_definition
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'appointments'
          AND NOT t.tgisinternal
        ORDER BY t.tgname;
      `

      console.log('SQL to run in Supabase SQL Editor:')
      console.log('='.repeat(60))
      console.log(query)
      console.log('='.repeat(60))
      return
    }

    if (!data || data.length === 0) {
      console.log('✅ No triggers found on appointments table')
      return
    }

    console.log(`⚠️  Found ${data.length} trigger(s):\\n`)
    data.forEach((trigger, index) => {
      console.log(`${index + 1}. ${trigger.trigger_name}`)
      console.log(`   Event: ${trigger.event_manipulation}`)
      console.log(`   Timing: ${trigger.action_timing}`)
      console.log(`   Action: ${trigger.action_statement}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkTriggers()
