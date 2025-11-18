import { NextResponse } from 'next/server'
import generatePayload from 'promptpay-qr'

/**
 * API Route: Generate PromptPay QR Code
 * Generates QR code data for payment via PromptPay
 * Uses Sandbox mode (manual verification by staff)
 */

export async function POST(request) {
  try {
    const { amount, mobileNumber = '0991234567' } = await request.json()

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Generate PromptPay QR payload
    // Format: mobileNumber without leading 0, then add 66 (Thailand country code)
    const phoneNumber = mobileNumber.startsWith('0')
      ? `66${mobileNumber.slice(1)}`
      : mobileNumber

    // Generate QR code payload
    const qrData = generatePayload(phoneNumber, { amount: parseFloat(amount) })

    // Generate reference number for tracking
    const refNumber = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    return NextResponse.json({
      success: true,
      qrData,
      refNumber,
      amount: parseFloat(amount),
      phoneNumber: mobileNumber,
      message: 'QR Code generated successfully'
    })

  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code', details: error.message },
      { status: 500 }
    )
  }
}
