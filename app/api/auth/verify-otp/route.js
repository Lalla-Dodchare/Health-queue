/**
 * API Route: Verify OTP
 * POST /api/auth/verify-otp
 * Verifies the OTP code entered by the user
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { email, otp } = await request.json()

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Find the most recent OTP for this email
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !otpRecord) {
      console.error('OTP not found:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Check if OTP has expired
    const now = new Date()
    const expiresAt = new Date(otpRecord.expires_at)

    if (now > expiresAt) {
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Verify OTP matches
    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP code' },
        { status: 400 }
      )
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', otpRecord.id)

    if (updateError) {
      console.error('Error updating OTP:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to verify OTP' },
        { status: 500 }
      )
    }

    console.log('✅ OTP verified successfully for:', email)

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    })
  } catch (error) {
    console.error('Error in verify-otp API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
