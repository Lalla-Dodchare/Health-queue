import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// สร้าง Gmail transporter
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

    // 1. ดึงข้อมูล appointment พร้อมข้อมูลผู้ป่วย, หมอ, สาขา, แผนก, ไฟล์
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        user:profiles!appointments_user_id_fkey (
          id,
          full_name,
          email,
          phone,
          date_of_birth,
          allergies
        ),
        doctor:doctors!appointments_doctor_id_fkey (
          id,
          contact_name,
          contact_email,
          specialty
        ),
        branch:branches!appointments_branch_id_fkey (
          id,
          name
        ),
        department:departments!appointments_department_id_fkey (
          id,
          name
        ),
        files:appointment_files (
          id,
          file_name,
          file_url,
          file_type,
          file_size
        )
      `)
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // 2. สร้าง token สำหรับหน้า doctor response (ใช้ appointment id + secret)
    const token = Buffer.from(`${appointmentId}:${process.env.DOCTOR_RESPONSE_SECRET || 'secret'}`).toString('base64')
    const responseUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/doctor-response/${token}`

    // 3. สร้าง HTML email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .info-label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
          .info-value { color: #333; margin-bottom: 15px; }
          .buttons { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; padding: 15px 30px; margin: 10px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
          .btn-primary { background: #10b981; color: white; }
          .btn-secondary { background: #3b82f6; color: white; }
          .btn-danger { background: #ef4444; color: white; }
          .file-list { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .file-item { padding: 10px; margin: 5px 0; background: #f3f4f6; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 คำขอนัดหมายผู้ป่วยใหม่</h1>
            <p>มีคนไข้ต้องการนัดหมายกับคุณ</p>
          </div>

          <div class="content">
            <div class="info-box">
              <h2 style="color: #667eea; margin-top: 0;">ข้อมูลผู้ป่วย</h2>
              <div class="info-label">ชื่อ-นามสกุล</div>
              <div class="info-value">${appointment.user?.full_name || 'ไม่ระบุ'}</div>

              <div class="info-label">เบอร์โทรศัพท์</div>
              <div class="info-value">${appointment.user?.phone || 'ไม่ระบุ'}</div>

              <div class="info-label">Email</div>
              <div class="info-value">${appointment.user?.email || 'ไม่ระบุ'}</div>

              ${appointment.user?.date_of_birth ? `
                <div class="info-label">วันเกิด</div>
                <div class="info-value">${new Date(appointment.user.date_of_birth).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              ` : ''}

              ${appointment.user?.allergies ? `
                <div class="info-label" style="color: #ef4444;">⚠️ ประวัติการแพ้</div>
                <div class="info-value" style="color: #ef4444; font-weight: bold;">${appointment.user.allergies}</div>
              ` : ''}
            </div>

            <div class="info-box">
              <h2 style="color: #667eea; margin-top: 0;">สถานที่และแพทย์</h2>
              <div class="info-label">สาขา</div>
              <div class="info-value">${appointment.branch?.name || 'ไม่ระบุ'}</div>

              <div class="info-label">แผนก</div>
              <div class="info-value">${appointment.department?.name || 'ไม่ระบุ'}</div>

              <div class="info-label">แพทย์</div>
              <div class="info-value">${appointment.doctor?.contact_name || 'ไม่ระบุ'}</div>
            </div>

            <div class="info-box">
              <h2 style="color: #667eea; margin-top: 0;">วันและเวลาที่ขอนัด</h2>
              <div class="info-label">🗓️ ตัวเลือกที่ 1 (วันหลัก)</div>
              <div class="info-value">
                ${new Date(appointment.primary_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                เวลา ${appointment.primary_time}
                ${appointment.primary_flexible ? ' <span style="color: #3b82f6;">(ยืดหยุ่นเวลาได้)</span>' : ''}
              </div>

              <div class="info-label">🗓️ ตัวเลือกที่ 2 (วันรอง)</div>
              <div class="info-value">
                ${new Date(appointment.secondary_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                เวลา ${appointment.secondary_time}
                ${appointment.secondary_flexible ? ' <span style="color: #3b82f6;">(ยืดหยุ่นเวลาได้)</span>' : ''}
              </div>
            </div>

            <div class="info-box">
              <h2 style="color: #667eea; margin-top: 0;">อาการและหมายเหตุ</h2>
              <div class="info-label">อาการ</div>
              <div class="info-value" style="white-space: pre-wrap;">${appointment.symptoms || 'ไม่ระบุ'}</div>

              ${appointment.notes ? `
                <div class="info-label">หมายเหตุเพิ่มเติม</div>
                <div class="info-value" style="white-space: pre-wrap;">${appointment.notes}</div>
              ` : ''}
            </div>

            ${appointment.files && appointment.files.length > 0 ? `
              <div class="file-list">
                <h3 style="color: #667eea; margin-top: 0;">📎 ไฟล์เอกสารที่แนบ (${appointment.files.length})</h3>
                ${appointment.files.map(file => `
                  <div class="file-item">
                    📄 <a href="${file.file_url}" target="_blank" style="color: #3b82f6; text-decoration: none;">${file.file_name}</a>
                    <span style="color: #6b7280; font-size: 12px;">(${(file.file_size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="info-box" style="background: #fef3c7; border-left-color: #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">📋 วิธีการตอบกลับ</h3>
              <p style="color: #78350f; margin: 10px 0;">
                กรุณาตอบกลับอีเมลนี้โดยระบุตัวเลือกของคุณ:
              </p>
              <ul style="color: #78350f; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                <li><strong>อนุมัติวันหลัก</strong> - ถ้าสะดวกตามวันที่ตัวเลือกที่ 1</li>
                <li><strong>อนุมัติวันรอง</strong> - ถ้าสะดวกตามวันที่ตัวเลือกที่ 2</li>
                <li><strong>เสนอวันที่อื่น</strong> - ระบุวันที่และเวลาที่สะดวก (เช่น "5 ธันวาคม 2567 เวลา 14:00")</li>
                <li><strong>ปฏิเสธ</strong> - หากไม่สะดวกรับผู้ป่วย</li>
              </ul>
              <p style="color: #92400e; font-weight: bold; margin-top: 15px;">
                แอดมินจะดำเนินการอนุมัติในระบบหลังจากได้รับการตอบกลับจากคุณ
              </p>
            </div>
          </div>

          <div class="footer">
            <p>Health Queue Management System</p>
            <p>กรุณาตอบกลับอีเมลนี้เพื่อแจ้งการตัดสินใจของคุณ</p>
          </div>
        </div>
      </body>
      </html>
    `

    // 4. ส่ง email ผ่าน Gmail SMTP
    const doctorEmail = 'peekmail198@gmail.com' // Email หมอที่ใช้ร่วมกัน
    console.log('📧 Sending email to:', doctorEmail)
    console.log('📧 From:', process.env.EMAIL_FROM)
    console.log('📧 Response URL:', responseUrl)

    try {
      const emailResult = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: doctorEmail,
        subject: `🏥 คำขอนัดหมายผู้ป่วยใหม่ - ${appointment.user?.full_name}`,
        html: emailHtml
      })

      console.log('✅ Email sent successfully:', emailResult)
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError)
      return NextResponse.json({ error: emailError.message }, { status: 500 })
    }

    // 5. อัพเดท sent_to_doctor_at
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ sent_to_doctor_at: new Date().toISOString() })
      .eq('id', appointmentId)

    if (updateError) {
      console.error('Error updating sent_to_doctor_at:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      responseUrl // ส่ง URL กลับไปด้วยเพื่อ debug (เอาออกได้เมื่อ production)
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
