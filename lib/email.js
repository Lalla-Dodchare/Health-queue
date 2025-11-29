/**
 * Email Service using Gmail SMTP (Nodemailer)
 * Sends email notifications to users
 */

import nodemailer from 'nodemailer'

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

/**
 * Send Email using Gmail SMTP
 * @param {string} to - Email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise<Object>} Result object
 */
export async function sendEmail(to, subject, html) {
  try {
    // Validate email address
    if (!to || !to.includes('@')) {
      throw new Error('Invalid email address')
    }

    // Validate subject and content
    if (!subject || subject.trim().length === 0) {
      throw new Error('Subject cannot be empty')
    }

    if (!html || html.trim().length === 0) {
      throw new Error('Email content cannot be empty')
    }

    // Check if Gmail is configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('Gmail credentials not configured, Email not sent')
      return {
        success: false,
        error: 'Gmail not configured',
        simulated: true
      }
    }

    // Send email via Gmail
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Health Queue <noreply@healthqueue.com>',
      to,
      subject,
      html
    })

    console.log('✅ Email sent successfully:', {
      to,
      messageId: result.messageId,
      response: result.response
    })

    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    }

  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Generate HTML template for appointment reminder email
 */
function generateReminderEmailTemplate({
  patientName,
  appointmentDate,
  appointmentTime,
  doctorName,
  branchName,
  departmentName,
  reminderType
}) {
  let headerText = ''
  let headerColor = ''
  let reminderMessage = ''

  switch (reminderType) {
    case '3_days':
      headerText = '🗓️ เตือนนัดหมาย - 3 วันก่อนนัด'
      headerColor = '#3b82f6'
      reminderMessage = 'คุณมีนัดพบแพทย์ในอีก 3 วัน กรุณาเตรียมตัวและจดจำวันนัดหมาย'
      break
    case '1_day':
      headerText = '⏰ เตือนนัดหมาย - พรุ่งนี้'
      headerColor = '#f59e0b'
      reminderMessage = 'พรุ่งนี้คุณมีนัดพบแพทย์ กรุณามาถึงก่อนเวลานัด 15 นาที'
      break
    case '6_hours':
      headerText = '🔔 เตือนนัดหมาย - อีก 6 ชั่วโมง'
      headerColor = '#ef4444'
      reminderMessage = 'ใกล้ถึงเวลานัดหมายแล้ว กรุณาเตรียมตัวและมาถึงก่อนเวลา'
      break
    default:
      headerText = '📅 เตือนนัดหมาย'
      headerColor = '#667eea'
      reminderMessage = 'คุณมีนัดพบแพทย์'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f3f4f6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, ${headerColor} 0%, ${shadeColor(headerColor, -20)} 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        .header p {
          margin: 0;
          font-size: 16px;
          opacity: 0.95;
        }
        .content {
          padding: 30px;
        }
        .info-box {
          background: #f9fafb;
          padding: 20px;
          margin: 15px 0;
          border-radius: 8px;
          border-left: 4px solid ${headerColor};
        }
        .info-row {
          display: flex;
          margin: 12px 0;
        }
        .info-label {
          font-weight: bold;
          color: ${headerColor};
          min-width: 120px;
          flex-shrink: 0;
        }
        .info-value {
          color: #333;
          flex-grow: 1;
        }
        .reminder-box {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          text-align: center;
        }
        .reminder-box p {
          margin: 0;
          color: #92400e;
          font-weight: 500;
          font-size: 15px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background: #f9fafb;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
        }
        @media only screen and (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .info-row {
            flex-direction: column;
          }
          .info-label {
            margin-bottom: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${headerText}</h1>
          <p>${reminderMessage}</p>
        </div>

        <div class="content">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            สวัสดีค่ะคุณ <strong>${patientName}</strong>
          </p>

          <div class="info-box">
            <h2 style="color: ${headerColor}; margin-top: 0; font-size: 18px;">📋 รายละเอียดการนัดหมาย</h2>

            <div class="info-row">
              <div class="info-label">📅 วันที่:</div>
              <div class="info-value"><strong>${appointmentDate}</strong></div>
            </div>

            <div class="info-row">
              <div class="info-label">⏰ เวลา:</div>
              <div class="info-value"><strong>${appointmentTime} น.</strong></div>
            </div>

            <div class="info-row">
              <div class="info-label">👨‍⚕️ แพทย์:</div>
              <div class="info-value">${doctorName || 'ไม่ระบุ'}</div>
            </div>

            <div class="info-row">
              <div class="info-label">🏥 สาขา:</div>
              <div class="info-value">${branchName || 'ไม่ระบุ'}</div>
            </div>

            ${departmentName ? `
            <div class="info-row">
              <div class="info-label">🏢 แผนก:</div>
              <div class="info-value">${departmentName}</div>
            </div>
            ` : ''}
          </div>

          ${reminderType === '1_day' || reminderType === '6_hours' ? `
          <div class="reminder-box">
            <p>⚠️ กรุณามาถึงก่อนเวลานัด 15 นาที</p>
          </div>
          ` : ''}

          <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
            หากต้องการยกเลิกหรือเลื่อนนัดหมาย กรุณาติดต่อสาขาโดยตรง
          </p>
        </div>

        <div class="footer">
          <p><strong>Health Queue Management System</strong></p>
          <p>อีเมลนี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Helper function to darken color
 */
function shadeColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1)
}

/**
 * Send appointment reminder email
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function sendAppointmentReminderEmail({
  email,
  patientName,
  appointmentDate,
  appointmentTime,
  doctorName,
  branchName,
  departmentName,
  reminderType
}) {
  const subjectMap = {
    '3_days': '🗓️ เตือนนัดหมาย - 3 วันก่อนนัด',
    '1_day': '⏰ เตือนนัดหมาย - พรุ่งนี้มีนัดพบแพทย์',
    '6_hours': '🔔 เตือนนัดหมาย - อีก 6 ชั่วโมงถึงเวลานัด'
  }

  const subject = subjectMap[reminderType] || '📅 เตือนนัดหมาย - Health Queue'

  const html = generateReminderEmailTemplate({
    patientName,
    appointmentDate,
    appointmentTime,
    doctorName,
    branchName,
    departmentName,
    reminderType
  })

  return sendEmail(email, subject, html)
}

/**
 * Send appointment approved email
 */
export async function sendAppointmentApprovedEmail({
  email,
  patientName,
  appointmentDate,
  appointmentTime,
  doctorName,
  branchName
}) {
  const subject = '✅ การนัดหมายของคุณได้รับการอนุมัติแล้ว'

  const html = `
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
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ การนัดหมายของคุณได้รับอนุมัติ</h1>
          <p>กรุณามาตรงเวลานะคะ</p>
        </div>

        <div class="content">
          <p>สวัสดีค่ะคุณ <strong>${patientName}</strong></p>

          <div class="info-box">
            <h2 style="color: #10b981; margin-top: 0;">รายละเอียดนัดหมาย</h2>
            <div class="info-label">วันที่</div>
            <div class="info-value">${appointmentDate}</div>

            <div class="info-label">เวลา</div>
            <div class="info-value">${appointmentTime} น.</div>

            <div class="info-label">แพทย์</div>
            <div class="info-value">${doctorName || 'ไม่ระบุ'}</div>

            <div class="info-label">สาขา</div>
            <div class="info-value">${branchName || 'ไม่ระบุ'}</div>
          </div>

          <p style="color: #6b7280;">กรุณามาถึงก่อนเวลานัด 15 นาที</p>
        </div>

        <div class="footer">
          <p>Health Queue Management System</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail(email, subject, html)
}

/**
 * Send appointment rejected email
 */
export async function sendAppointmentRejectedEmail({
  email,
  patientName,
  reason
}) {
  const subject = '❌ ขออภัย การนัดหมายของคุณถูกปฏิเสธ'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ef4444; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ การนัดหมายถูกปฏิเสธ</h1>
          <p>ขออภัยในความไม่สะดวก</p>
        </div>

        <div class="content">
          <p>สวัสดีค่ะคุณ <strong>${patientName}</strong></p>

          <div class="info-box">
            <h2 style="color: #ef4444; margin-top: 0;">เหตุผล</h2>
            <p>${reason || 'ไม่ระบุเหตุผล'}</p>
          </div>

          <p style="color: #6b7280;">กรุณาติดต่อเจ้าหน้าที่เพื่อขอข้อมูลเพิ่มเติมค่ะ</p>
        </div>

        <div class="footer">
          <p>Health Queue Management System</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail(email, subject, html)
}

/**
 * Send Email Verification Code (OTP)
 * For email change verification
 */
export async function sendEmailVerificationCode(email, code) {
  const subject = '🔐 รหัสยืนยันการเปลี่ยนอีเมล - Health Queue'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Sarabun', Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .otp-box { background-color: #f0f4ff; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
        .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 10px 0; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 14px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 รหัสยืนยันการเปลี่ยนอีเมล</h1>
        </div>
        <div class="content">
          <p>สวัสดีค่ะ</p>
          <p>คุณได้ทำการร้องขอเปลี่ยนที่อยู่อีเมลในระบบ Health Queue</p>

          <div class="otp-box">
            <p style="margin: 0; color: #667eea; font-weight: bold;">รหัสยืนยันของคุณคือ:</p>
            <div class="otp-code">${code}</div>
            <p style="margin: 0; color: #6c757d; font-size: 14px;">รหัสนี้จะหมดอายุใน 10 นาที</p>
          </div>

          <div class="warning">
            <strong>⚠️ คำเตือน:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>กรุณาอย่าแชร์รหัสนี้กับผู้อื่น</li>
              <li>หากคุณไม่ได้ทำการร้องขอนี้ กรุณาเพิกเฉยและติดต่อเจ้าหน้าที่</li>
              <li>รหัสนี้จะหมดอายุภายใน 10 นาที</li>
            </ul>
          </div>

          <p style="margin-top: 30px;">ขอแสดงความนับถือ,<br><strong>ทีมงาน Health Queue</strong></p>
        </div>
        <div class="footer">
          <p>อีเมลนี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ</p>
          <p>© 2025 Health Queue. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail(email, subject, html)
}

/**
 * Send appointment created/booked email
 * Sent when user successfully creates a new appointment
 */
export async function sendAppointmentCreatedEmail({
  email,
  patientName,
  primaryDate,
  primaryTime,
  secondaryDate,
  secondaryTime,
  doctorName,
  branchName,
  departmentName
}) {
  const subject = '📋 ยืนยันการจองนัดหมาย - รอการอนุมัติ'

  const html = `
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
        .status-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 ยืนยันการจองนัดหมาย</h1>
          <p>การจองของคุณส่งเรียบร้อยแล้ว</p>
        </div>

        <div class="content">
          <p>สวัสดีค่ะคุณ <strong>${patientName}</strong></p>

          <div class="status-box">
            <p style="margin: 0; color: #92400e; font-weight: 500;">⏳ รอการอนุมัติจากเจ้าหน้าที่</p>
          </div>

          <div class="info-box">
            <h2 style="color: #667eea; margin-top: 0;">รายละเอียดการจอง</h2>

            ${doctorName ? `
            <div class="info-label">👨‍⚕️ แพทย์</div>
            <div class="info-value">${doctorName}</div>
            ` : ''}

            ${departmentName ? `
            <div class="info-label">🏢 แผนก</div>
            <div class="info-value">${departmentName}</div>
            ` : ''}

            ${branchName ? `
            <div class="info-label">🏥 สาขา</div>
            <div class="info-value">${branchName}</div>
            ` : ''}

            <div class="info-label">📅 ตัวเลือกที่ 1 (หลัก)</div>
            <div class="info-value">${primaryDate} เวลา ${primaryTime} น.</div>

            ${secondaryDate && secondaryTime ? `
            <div class="info-label">📅 ตัวเลือกที่ 2 (สำรอง)</div>
            <div class="info-value">${secondaryDate} เวลา ${secondaryTime} น.</div>
            ` : ''}
          </div>

          <p style="color: #6b7280;">
            เจ้าหน้าที่จะทำการตรวจสอบและอนุมัติการจองของคุณภายใน 24 ชั่วโมง<br>
            คุณจะได้รับอีเมลแจ้งเตือนเมื่อการจองได้รับการอนุมัติ
          </p>
        </div>

        <div class="footer">
          <p>Health Queue Management System</p>
          <p>อีเมลนี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail(email, subject, html)
}

/**
 * Format date for email display
 */
export function formatEmailDate(dateString) {
  const date = new Date(dateString)
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                     'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']

  return `${thaiDays[date.getDay()]} ที่ ${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`
}
