import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

export async function POST(request) {
  try {
    const { appointmentId } = await request.json()

    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 })
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        user:profiles!appointments_user_id_fkey (
          full_name,
          email,
          phone
        ),
        doctor:doctors!appointments_doctor_id_fkey (
          contact_name,
          contact_email
        ),
        branch:branches!appointments_branch_id_fkey (name),
        department:departments!appointments_department_id_fkey (name)
      `)
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Create upload token
    const token = Buffer.from(`${appointmentId}:${process.env.DOCTOR_RESPONSE_SECRET || 'secret'}`).toString('base64')
    const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/doctor-upload/${token}`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
          .info-label { font-weight: bold; color: #10b981; margin-bottom: 5px; }
          .info-value { color: #333; margin-bottom: 15px; }
          .btn { display: inline-block; padding: 15px 30px; margin: 20px 0; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; background: #10b981; color: white; text-align: center; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ การรักษาเสร็จสมบูรณ์</h1>
            <p>กรุณาอัปโหลดผลการรักษา</p>
          </div>

          <div class="content">
            <div class="info-box">
              <h2 style="color: #10b981; margin-top: 0;">ข้อมูลผู้ป่วย</h2>
              <div class="info-label">ชื่อ-นามสกุล</div>
              <div class="info-value">${appointment.user?.full_name || 'ไม่ระบุ'}</div>

              <div class="info-label">เบอร์โทรศัพท์</div>
              <div class="info-value">${appointment.user?.phone || 'ไม่ระบุ'}</div>
            </div>

            <div class="info-box">
              <h2 style="color: #10b981; margin-top: 0;">รายละเอียดการนัด</h2>
              <div class="info-label">สาขา</div>
              <div class="info-value">${appointment.branch?.name || 'ไม่ระบุ'}</div>

              <div class="info-label">แผนก</div>
              <div class="info-value">${appointment.department?.name || 'ไม่ระบุ'}</div>

              <div class="info-label">อาการ</div>
              <div class="info-value">${appointment.symptoms || 'ไม่ระบุ'}</div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
                กรุณาอัปโหลดผลการรักษาและเพิ่มหมายเหตุ
              </p>
              <a href="${uploadUrl}" class="btn">📤 อัปโหลดผลการรักษา</a>
            </div>

            <p style="text-align: center; color: #6b7280;">
              กดปุ่มด้านบนเพื่อเข้าสู่หน้าอัปโหลดผลการรักษา
            </p>
          </div>

          <div class="footer">
            <p>Health Queue Management System</p>
            <p>Email นี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ</p>
          </div>
        </div>
      </body>
      </html>
    `

    const doctorEmail = 'peekmail198@gmail.com'

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: doctorEmail,
      subject: `✅ [รักษาเสร็จแล้ว] กรุณาอัปโหลดผลการรักษา - ${appointment.user?.full_name}`,
      html: emailHtml
    })

    // Update followup_email_sent_at
    await supabase
      .from('appointments')
      .update({ followup_email_sent_at: new Date().toISOString() })
      .eq('id', appointmentId)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error sending follow-up email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
