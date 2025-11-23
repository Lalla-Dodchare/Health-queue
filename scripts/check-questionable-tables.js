const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkQuestionableTables() {
  console.log('🔍 ตรวจสอบตารางที่ต้องการยืนยัน...\n')

  // Check admins table
  console.log('=' .repeat(70))
  console.log('📋 TABLE: admins (1 row)')
  console.log('=' .repeat(70))
  const { data: adminsData, error: adminsError } = await supabase
    .from('admins')
    .select('*')

  if (!adminsError) {
    console.log('\n📄 Data:')
    console.log(JSON.stringify(adminsData, null, 2))

    // Check if same data in profiles
    if (adminsData && adminsData.length > 0) {
      const adminUserId = adminsData[0].user_id
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', adminUserId)
        .single()

      console.log('\n🔗 Linked profile:')
      console.log(JSON.stringify(profileData, null, 2))

      console.log('\n💡 Analysis:')
      console.log('   • admins table มีแค่: id, user_id, status, created_at')
      console.log('   • profiles table มี role="admin" อยู่แล้ว')
      console.log('   • ❓ status field ใน admins table ใช้ทำอะไร?')
      console.log('   • ❓ ถ้าไม่มีข้อมูลเพิ่มเติม = ตารางซ้ำซ้อน ควรลบ')
    }
  } else {
    console.log(`❌ Error: ${adminsError.message}`)
  }

  // Check notifications table
  console.log('\n\n' + '='.repeat(70))
  console.log('📋 TABLE: notifications (0 rows)')
  console.log('=' .repeat(70))
  console.log('\n💡 Analysis:')
  console.log('   • ว่างเปล่า แต่เป็น future feature สำหรับการแจ้งเตือน')
  console.log('   • ✅ ควรเก็บไว้ - จะใช้แจ้งเตือน appointment confirmations/reminders')
  console.log('   • ต้องมี columns: user_id, type, title, message, is_read, created_at')

  // Check payments table
  console.log('\n\n' + '='.repeat(70))
  console.log('📋 TABLE: payments (0 rows)')
  console.log('=' .repeat(70))
  console.log('\n💡 Analysis:')
  console.log('   • ว่างเปล่า แต่อาจจะต้องใช้ในอนาคต')
  console.log('   • 🤔 Business Model Analysis:')
  console.log('      1. User จองผ่านเว็บ (ฟรี)')
  console.log('      2. User ชำระเงินที่รพ. จริง')
  console.log('      3. รพ. ตัดยอดให้เอเจนซี่ทุกสิ้นเดือน')
  console.log('')
  console.log('   • ❓ payments table ใช้เก็บอะไร?')
  console.log('      → Option A: เก็บประวัติการจ่ายเงินที่รพ. (manual entry)')
  console.log('      → Option B: ไว้สำหรับ online payment ในอนาคต')
  console.log('      → Option C: เก็บยอด commission ที่ต้องจ่ายให้เอเจนซี่')
  console.log('')
  console.log('   • 💭 ตามที่คิด: เว็บเป็นแค่ lead generation')
  console.log('      → User จ่ายตังที่รพ. จริง')
  console.log('      → รพ. ตัดยอดให้เอเจนซี่ทุกสิ้นเดือน')
  console.log('      → ดังนั้น payments table อาจจะ:')
  console.log('         • ไม่จำเป็นเลย (ถ้าไม่มี online payment)')
  console.log('         • หรือเก็บไว้ future (ถ้าจะมี online payment)')
  console.log('')
  console.log('   • ✅ แนะนำ: เก็บไว้ก่อน แต่ไม่ต้อง implement ตอนนี้')

  console.log('\n\n' + '='.repeat(70))
  console.log('📊 SUMMARY')
  console.log('=' .repeat(70))
  console.log('\n✅ ตารางที่ต้องเก็บไว้:')
  console.log('   • notifications (เก็บไว้ - future: แจ้งเตือน)')
  console.log('   • payments (เก็บไว้ - future: อาจจะมี online payment)')
  console.log('')
  console.log('❓ ตารางที่ต้องตัดสินใจ:')
  console.log('   • admins (ซ้ำกับ profiles.role="admin" หรือเปล่า?)')
  console.log('     → ถ้า status field ไม่ได้ใช้งาน = ควรลบ')
  console.log('     → ถ้ามีประโยชน์ (เช่น active/inactive admin) = เก็บไว้')
  console.log('')
}

checkQuestionableTables().catch(console.error)
