/**
 * List all columns in appointments table
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function listColumns() {
  try {
    console.log('🔍 Listing all columns in appointments table...\n')

    // Get one record to see all columns
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No data found')
      return
    }

    const columns = Object.keys(data[0])
    console.log('✅ Columns found in appointments table:')
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col}`)
    })

    console.log('\n📋 Sample data:')
    console.log(JSON.stringify(data[0], null, 2))

  } catch (error) {
    console.error('❌ Fatal error:', error.message)
  }
}

listColumns()
