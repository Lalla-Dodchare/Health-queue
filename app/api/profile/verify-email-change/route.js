import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Import verification codes from request-email-change
// In production, use shared store (Redis, database, etc.)
const verificationCodes = new Map()

export async function POST(request) {
  try {
    const { userId, newEmail, code } = await request.json()

    if (!userId || !newEmail || !code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get stored OTP
    const key = `${userId}-${newEmail}`
    const stored = verificationCodes.get(key)

    if (!stored) {
      return NextResponse.json(
        { error: 'Verification code not found or expired' },
        { status: 400 }
      )
    }

    // Check expiration
    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(key)
      return NextResponse.json(
        { error: 'Verification code expired' },
        { status: 400 }
      )
    }

    // Verify OTP
    if (stored.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    console.log(`✅ OTP verified for ${newEmail}`)

    // Delete used OTP
    verificationCodes.delete(key)

    // Update email in profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ email: newEmail })
      .eq('id', userId)

    if (error) {
      console.error('❌ Error updating email in profiles:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Email changed successfully',
    })

  } catch (error) {
    console.error('❌ Error in verify-email-change:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
