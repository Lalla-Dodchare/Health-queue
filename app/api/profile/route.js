import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * GET /api/profile
 * Get current user's profile data
 * ใช้สำหรับดึงข้อมูลส่วนตัวเมื่อต้องการ แทนการเก็บใน localStorage
 */
export async function GET(request) {
  try {
    // Get session from cookie
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลโปรไฟล์' },
        { status: 404 }
      )
    }

    // ⚠️ SECURITY: ส่งข้อมูลกลับไปเฉพาะที่จำเป็น
    // ไม่เก็บข้อมูลนี้ใน localStorage
    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
        id_card: profile.id_card,
        passport_number: profile.passport_number,
        allergies: profile.allergies,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      }
    })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}
