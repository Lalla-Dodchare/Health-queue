import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * PUT /api/admin/users/[id]
 * Update existing user
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      full_name,
      phone,
      gender,
      date_of_birth,
      id_card,
      passport_number,
      allergies
    } = body

    // Validate required fields
    if (!full_name) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อ' },
        { status: 400 }
      )
    }

    // Build update object - always include basic fields
    const updateData = {
      full_name,
      phone: phone || null,
      gender: gender || null,
      date_of_birth: date_of_birth || null,
      allergies: allergies || null
    }

    // Handle ID fields conditionally:
    // - If id_card is provided and not empty -> update id_card, clear passport
    // - If passport_number is provided and not empty -> update passport, clear id_card
    // - If both are empty -> don't touch existing values
    if (id_card && id_card.trim()) {
      updateData.id_card = id_card.trim()
      updateData.passport_number = null
    } else if (passport_number && passport_number.trim()) {
      updateData.passport_number = passport_number.trim()
      updateData.id_card = null
    }
    // If both are empty, we don't add them to updateData, so existing values remain

    // Update user profile in profiles table
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: 'ไม่สามารถอัปเดตข้อมูลได้' },
        { status: 400 }
      )
    }

    // Also update auth user metadata
    await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: {
        full_name
      }
    })

    return NextResponse.json({
      success: true,
      data,
      message: 'อัปเดตข้อมูลสำเร็จ'
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' },
      { status: 500 }
    )
  }
}
