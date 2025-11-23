/**
 * Fix appointments table schema - Add missing columns
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixAppointmentsSchema() {
  try {
    console.log('🔧 Fixing appointments table schema...\n')

    // Read the SQL file
    const sql = fs.readFileSync('supabase/migrations/add_missing_columns_to_appointments.sql', 'utf8')

    // Execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('❌ Error executing SQL:', error.message)
      console.log('\n💡 Please run the SQL manually in Supabase Dashboard → SQL Editor')
      console.log('\nSQL to run:')
      console.log('---')
      console.log(sql)
      console.log('---')
      return
    }

    console.log('✅ Schema fixed successfully!')
    console.log('✅ Added columns: branch_id, department_id')
    console.log('✅ Added indexes for better performance')

  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    console.log('\n💡 Please run the SQL manually in Supabase Dashboard → SQL Editor')
    console.log('\nFile location: supabase/migrations/add_missing_columns_to_appointments.sql')
  }
}

fixAppointmentsSchema()
