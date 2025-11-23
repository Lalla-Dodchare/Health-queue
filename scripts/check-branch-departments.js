/**
 * Script to check branch_departments and departments data
 * Run: node scripts/check-branch-departments.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruipljhpvyoxvnhvtugt.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aXBsamhwdnlveHZuaHZ0dWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NjQ0NjEsImV4cCI6MjA1MTM0MDQ2MX0.gByOcEaL-QVAMnB7fCCXAIbuzLF_qDY_H31JxZXLxTg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBranchDepartments() {
  console.log('\n🔍 Checking Branches...')
  const { data: branches, error: branchError } = await supabase
    .from('branches')
    .select('*')
    .order('name')

  if (branchError) {
    console.error('❌ Error loading branches:', branchError)
    return
  }

  console.log(`✅ Found ${branches.length} branches:`)
  console.log('   Branch schema:', Object.keys(branches[0] || {}))
  branches.forEach((b, i) => {
    console.log(`   ${i + 1}.`, JSON.stringify(b))
  })

  console.log('\n🔍 Checking Departments...')
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  if (deptError) {
    console.error('❌ Error loading departments:', deptError)
    return
  }

  console.log(`✅ Found ${departments.length} departments:`)
  console.log('   Department schema:', Object.keys(departments[0] || {}))
  departments.forEach((d, i) => {
    console.log(`   ${i + 1}.`, JSON.stringify(d))
  })

  console.log('\n🔍 Checking Branch-Department Links...')
  const { data: links, error: linkError } = await supabase
    .from('branch_departments')
    .select(`
      id,
      branch_id,
      department_id,
      branches (name),
      departments (name)
    `)

  if (linkError) {
    console.error('❌ Error loading branch_departments:', linkError)
    return
  }

  console.log(`✅ Found ${links.length} branch-department links:`)
  links.forEach((link, i) => {
    console.log(`   ${i + 1}. ${link.branches?.name} → ${link.departments?.name}`)
  })

  if (links.length === 0) {
    console.log('\n⚠️  WARNING: No branch_departments links found!')
    console.log('   You need to create links between branches and departments.')
  }

  // Check for each branch
  console.log('\n📊 Departments per Branch:')
  for (const branch of branches) {
    const { data: branchDepts } = await supabase
      .from('branch_departments')
      .select(`
        departments (name)
      `)
      .eq('branch_id', branch.id)

    console.log(`\n   ${branch.name}:`)
    if (!branchDepts || branchDepts.length === 0) {
      console.log('      ❌ No departments linked!')
    } else {
      branchDepts.forEach((bd, i) => {
        console.log(`      ${i + 1}. ${bd.departments?.name}`)
      })
    }
  }
}

checkBranchDepartments()
  .then(() => {
    console.log('\n✅ Check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
