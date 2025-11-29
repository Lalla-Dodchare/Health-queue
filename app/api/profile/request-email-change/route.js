import { NextResponse } from 'next/server'
import { sendEmailVerificationCode } from '@/lib/email'

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map()

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request) {
  try {
    const { userId, newEmail } = await request.json()

    if (!userId || !newEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = generateOTP()

    // Store OTP with expiration (10 minutes)
    const key = `${userId}-${newEmail}`
    verificationCodes.set(key, {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    })

    console.log(`🔐 Generated OTP for ${newEmail}: ${otp}`)

    // Send verification email
    try {
      await sendEmailVerificationCode(newEmail, otp)
      console.log(`✅ Verification email sent to ${newEmail}`)
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError)
      // For development, still return success even if email fails
      // In production, you might want to throw error here
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to new email',
    })

  } catch (error) {
    console.error('❌ Error in request-email-change:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
