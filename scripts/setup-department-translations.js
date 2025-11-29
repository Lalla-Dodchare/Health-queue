/**
 * Complete Setup Script for Department Translations
 * This script will:
 * 1. Create the department_translations table (if not exists)
 * 2. Migrate all 21 medical centers data
 *
 * Run: node scripts/setup-department-translations.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTableIfNotExists() {
  console.log('📋 Step 1: Creating department_translations table...\n')

  const createTableSQL = `
    -- Create department_translations table
    CREATE TABLE IF NOT EXISTS public.department_translations (
      id SERIAL PRIMARY KEY,
      department_id INTEGER NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
      locale VARCHAR(5) NOT NULL CHECK (locale IN ('th', 'en', 'ja', 'ko', 'zh', 'ru', 'hi')),
      name TEXT NOT NULL,
      name_en TEXT,
      description TEXT,
      services JSONB,
      icon VARCHAR(50),
      color VARCHAR(50),
      has_branches BOOLEAN DEFAULT false,
      branches JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(department_id, locale)
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_dept_trans_dept_id ON public.department_translations(department_id);
    CREATE INDEX IF NOT EXISTS idx_dept_trans_locale ON public.department_translations(locale);
    CREATE INDEX IF NOT EXISTS idx_dept_trans_dept_locale ON public.department_translations(department_id, locale);

    -- Create updated_at trigger function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Create trigger
    DROP TRIGGER IF EXISTS update_department_translations_updated_at ON public.department_translations;
    CREATE TRIGGER update_department_translations_updated_at
      BEFORE UPDATE ON public.department_translations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    -- Enable RLS
    ALTER TABLE public.department_translations ENABLE ROW LEVEL SECURITY;

    -- Create policies
    DROP POLICY IF EXISTS "Allow public read access" ON public.department_translations;
    CREATE POLICY "Allow public read access"
      ON public.department_translations
      FOR SELECT
      USING (true);

    DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.department_translations;
    CREATE POLICY "Allow authenticated users to insert"
      ON public.department_translations
      FOR INSERT
      TO authenticated
      WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow authenticated users to update" ON public.department_translations;
    CREATE POLICY "Allow authenticated users to update"
      ON public.department_translations
      FOR UPDATE
      TO authenticated
      USING (true);

    DROP POLICY IF EXISTS "Allow authenticated users to delete" ON public.department_translations;
    CREATE POLICY "Allow authenticated users to delete"
      ON public.department_translations
      FOR DELETE
      TO authenticated
      USING (true);
  `

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL })

    if (error) {
      console.log('⚠️  Note: Table might already exist or RPC not available. Proceeding with data migration...\n')
      console.log('If you see errors below, please run the SQL migration manually:\n')
      console.log('File: supabase/migrations/create_department_translations.sql\n')
    } else {
      console.log('✅ Table created successfully!\n')
    }
  } catch (err) {
    console.log('⚠️  Note: Using alternative approach. Table structure assumed to exist.\n')
  }
}

// Medical Centers Data (Thai and English only for now)
const medicalCentersData = require('./migrate-medical-centers')

async function migrateMedicalCenters() {
  console.log('📋 Step 2: Migrating Medical Centers data...\n')

  let totalInserted = 0

  // Insert Thai translations
  console.log('📝 Inserting Thai translations...')
  for (const center of medicalCentersData.th) {
    const { data, error } = await supabase
      .from('department_translations')
      .upsert({
        department_id: center.departmentId,
        locale: 'th',
        name: center.name,
        name_en: center.nameEn,
        description: center.description,
        services: center.services,
        icon: center.icon,
        color: center.color,
        has_branches: center.hasBranches,
        branches: center.branches
      }, {
        onConflict: 'department_id,locale'
      })

    if (error) {
      console.error(`❌ Error inserting ${center.name}:`, error.message)
    } else {
      console.log(`✅ Inserted: ${center.name}`)
      totalInserted++
    }
  }

  // Insert English translations
  console.log('\n📝 Inserting English translations...')
  for (const center of medicalCentersData.en) {
    const { data, error } = await supabase
      .from('department_translations')
      .upsert({
        department_id: center.departmentId,
        locale: 'en',
        name: center.name,
        description: center.description,
        services: center.services
      }, {
        onConflict: 'department_id,locale'
      })

    if (error) {
      console.error(`❌ Error inserting ${center.name}:`, error.message)
    } else {
      console.log(`✅ Inserted: ${center.name}`)
      totalInserted++
    }
  }

  console.log(`\n🎉 Migration completed! Total inserted: ${totalInserted} translations`)
  console.log('\n✅ Next steps:')
  console.log('1. Update dashboard page to fetch from database')
  console.log('2. Add translations for remaining languages (ja, ko, zh, ru, hi)')
  console.log('3. Test language switching functionality')
}

async function main() {
  console.log('🚀 Starting Department Translations Setup...\n')

  try {
    await createTableIfNotExists()
    await migrateMedicalCenters()

    console.log('\n✨ All done!')
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.error('\nPlease check:')
    console.error('1. NEXT_PUBLIC_SUPABASE_URL is set in .env.local')
    console.error('2. SUPABASE_SERVICE_ROLE_KEY is set in .env.local')
    console.error('3. Database connection is working')
    process.exit(1)
  }
}

// Run setup
main()
