/**
 * Script to get exact doctors table schema from database
 * Run: node scripts/get-doctors-schema.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruipljhpvyoxvnhvtugt.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aXBsamhwdnlveHZuaHZ0dWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NjQ0NjEsImV4cCI6MjA1MTM0MDQ2MX0.gByOcEaL-QVAMnB7fCCXAIbuzLF_qDY_H31JxZXLxTg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function getDoctorsSchema() {
  console.log('\n🔍 Getting doctors table schema from database...\n')

  // Use RPC to query information_schema
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'doctors'
      ORDER BY ordinal_position;
    `
  })

  if (error) {
    console.log('❌ RPC method not available. Trying alternative method...\n')

    // Try to insert a test record to see what columns are expected
    const { error: insertError } = await supabase
      .from('doctors')
      .insert({
        name_th: 'TEST',
        name_en: 'TEST',
        specialty_th: 'TEST',
        specialty_en: 'TEST',
        department_id: 1,
        branch_id: 1
      })
      .select()

    if (insertError) {
      console.log('📋 Error message reveals schema info:')
      console.log(insertError.message)
      console.log('\n💡 From the error, we can see which columns exist or are missing.')
    } else {
      console.log('✅ Test insert succeeded! Columns are correct.')
      console.log('   Deleting test record...')
      await supabase.from('doctors').delete().eq('name_th', 'TEST')
    }
  } else {
    console.log('✅ Schema from database:')
    console.log(data)
  }

  console.log('\n✅ Done!')
}

getDoctorsSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
