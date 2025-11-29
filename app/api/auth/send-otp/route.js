/**
 * API Route: Send OTP Email
 * POST /api/auth/send-otp
 * Generates and sends a 6-digit OTP to user's email for verification
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

export async function POST(request) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()

    // OTP expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Store OTP in database (create a temporary otp_verifications table)
    const { error: insertError } = await supabase
      .from('otp_verifications')
      .insert({
        email: email,
        otp: otp,
        expires_at: expiresAt,
        verified: false,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error storing OTP:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to generate OTP' },
        { status: 500 }
      )
    }

    // Send OTP email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin: 30px 0; }
          .otp-code { font-size: 48px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; font-family: 'Courier New', monospace; }
          .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .info-box p { margin: 5px 0; color: #78350f; }
          .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
          .warning { color: #ef4444; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 รหัส OTP สำหรับการสมัครสมาชิก</h1>
            <p>Health Queue Management System</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; color: #333;">สวัสดีค่ะ/ครับ</p>
            <p style="font-size: 16px; color: #333; margin-top: 10px;">
              คุณได้ทำการขอรหัส OTP เพื่อยืนยันอีเมลในการสมัครสมาชิก Health Queue
            </p>

            <div class="otp-box">
              <p style="margin: 0; font-size: 18px;">รหัส OTP ของคุณคือ:</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">กรุณากรอกรหัสนี้ในหน้าสมัครสมาชิก</p>
            </div>

            <div class="info-box">
              <p><strong>⏰ รหัส OTP นี้จะหมดอายุภายใน 10 นาที</strong></p>
              <p>หากคุณไม่ได้ทำการขอรหัส OTP กรุณาเพิกเฉยต่ออีเมลนี้</p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              หากคุณมีปัญหาในการสมัครสมาชิก กรุณาติดต่อทีมงานของเรา
            </p>
          </div>

          <div class="footer">
            <p>© 2024 Health Queue Management System</p>
            <p>อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
          </div>
        </div>
      </body>
      </html>
    `

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: '🔐 รหัส OTP สำหรับการสมัครสมาชิก Health Queue',
        html: emailHtml
      })

      console.log('✅ OTP sent successfully to:', email)

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        expiresIn: 600 // seconds
      })
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError)
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in send-otp API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
