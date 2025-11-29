import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * POST /api/admin/users
 * Create new user
 */
export async function POST(request) {
  try {
    const body = await request.json()

    const {
      full_name,
      email,
      phone,
      gender,
      date_of_birth,
      id_card,
      passport_number,
      allergies
    } = body

    // Validate required fields
    if (!full_name || !email) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อและอีเมล' },
        { status: 400 }
      )
    }

    // Validate that at least one ID is provided
    if (!id_card && !passport_number) {
      return NextResponse.json(
        { error: 'กรุณากรอกเลขบัตรประชาชนหรือเลขพาสปอร์ต' },
        { status: 400 }
      )
    }

    // Create user in auth.users (with a random password - user can reset later)
    const randomPassword = Math.random().toString(36).slice(-8) + 'Aa1!'

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message || 'ไม่สามารถสร้างผู้ใช้ได้' },
        { status: 400 }
      )
    }

    // Build profile data - only include non-empty values
    const profileData = {
      id: authData.user.id,
      email,
      full_name,
      phone: phone || null,
      gender: gender || null,
      date_of_birth: date_of_birth || null,
      allergies: allergies || null
    }

    // Add ID card or passport (one of them must exist due to validation above)
    if (id_card && id_card.trim()) {
      profileData.id_card = id_card.trim()
    }
    if (passport_number && passport_number.trim()) {
      profileData.passport_number = passport_number.trim()
    }

    // Update profile (created automatically by trigger) with additional data
    const { data: insertedProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single()

    if (profileError) {
      // Rollback: Delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)

      console.error('Profile error:', profileError)
      return NextResponse.json(
        { error: `ไม่สามารถสร้างโปรไฟล์ผู้ใช้ได้: ${profileError.message || 'Unknown error'}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: insertedProfile,
      message: 'เพิ่มผู้ใช้สำเร็จ'
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' },
      { status: 500 }
    )
  }
}
