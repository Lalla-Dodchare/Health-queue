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

    // Get appointment with user info
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        user:profiles!appointments_user_id_fkey (
          full_name,
          email
        ),
        branch:branches!appointments_branch_id_fkey (name),
        department:departments!appointments_department_id_fkey (name)
      `)
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Parse file URLs
    let fileUrls = []
    if (appointment.treatment_file_url) {
      try {
        fileUrls = JSON.parse(appointment.treatment_file_url)
        if (!Array.isArray(fileUrls)) fileUrls = [appointment.treatment_file_url]
      } catch {
        fileUrls = [appointment.treatment_file_url]
      }
    }

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
          .info-value { color: #333; margin-bottom: 15px; white-space: pre-wrap; }
          .file-item { background: #f3f4f6; padding: 12px; margin: 8px 0; border-radius: 6px; }
          .btn { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 8px; font-weight: bold; background: #10b981; color: white; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ ผลการรักษาของคุณ</h1>
            <p>แพทย์ได้ส่งผลการรักษาให้คุณแล้ว</p>
          </div>

          <div class="content">
            <div class="info-box">
              <h2 style="color: #10b981; margin-top: 0;">ข้อมูลการนัดหมาย</h2>
              <div class="info-label">สาขา</div>
              <div class="info-value">${appointment.branch?.name || 'ไม่ระบุ'}</div>

              <div class="info-label">แผนก</div>
              <div class="info-value">${appointment.department?.name || 'ไม่ระบุ'}</div>

              <div class="info-label">วันที่รักษา</div>
              <div class="info-value">${new Date(appointment.appointment_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} เวลา ${appointment.appointment_time}</div>
            </div>

            <div class="info-box">
              <h2 style="color: #10b981; margin-top: 0;">📋 ผลการรักษาและคำแนะนำ</h2>
              <div class="info-value" style="font-size: 15px;">${appointment.treatment_note || 'ไม่มีหมายเหตุ'}</div>
            </div>

            ${fileUrls.length > 0 ? `
              <div class="info-box">
                <h2 style="color: #10b981; margin-top: 0;">📎 ไฟล์ผลการรักษา (${fileUrls.length})</h2>
                ${fileUrls.map((url, index) => `
                  <div class="file-item">
                    <a href="${url}" target="_blank" style="color: #10b981; text-decoration: none; font-weight: bold;">
                      📄 ดาวน์โหลดไฟล์ที่ ${index + 1}
                    </a>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <p style="text-align: center; color: #6b7280; margin-top: 30px;">
              คุณสามารถดูประวัติการรักษาทั้งหมดได้ที่ Dashboard
            </p>
          </div>

          <div class="footer">
            <p>Health Queue Management System</p>
            <p>หากมีคำถามเพิ่มเติม กรุณาติดต่อสาขาโดยตรง</p>
          </div>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: appointment.user?.email,
      subject: `✅ ผลการรักษาของคุณพร้อมแล้ว - ${appointment.branch?.name || 'Health Queue'}`,
      html: emailHtml
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error sending treatment results email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
