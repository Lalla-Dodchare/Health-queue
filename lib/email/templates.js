/**
 * Email Templates
 * HTML templates for various notification emails
 * Supports both Thai and English languages
 */

/**
 * Appointment Approved Email Template
 * Sent when admin approves an appointment
 */
export const appointmentApprovedTemplate = ({
  patientName,
  doctorName,
  specialty,
  departmentName,
  branchName,
  appointmentDate,
  appointmentTime,
  approvedSlot, // 'primary' or 'secondary'
  language = 'th'
}) => {
  const translations = {
    th: {
      subject: 'การนัดหมายของคุณได้รับการอนุมัติแล้ว ✅',
      title: 'การนัดหมายได้รับการอนุมัติ',
      greeting: `เรียน คุณ${patientName}`,
      message: 'การนัดหมายของคุณได้รับการอนุมัติแล้ว โปรดมาตามวันและเวลาที่กำหนด',
      appointmentDetails: 'รายละเอียดการนัดหมาย',
      doctor: 'แพทย์',
      department: 'แผนก',
      branch: 'สาขา',
      dateTime: 'วันที่และเวลา',
      selectedSlot: approvedSlot === 'primary' ? 'วันที่ต้องการอันดับ 1' : 'วันที่ต้องการอันดับ 2',
      important: 'สำคัญ',
      reminder: 'กรุณามาถึงก่อนเวลานัดอย่างน้อย 15 นาที',
      bringDocument: 'กรุณานำบัตรประชาชนและบัตรประกันสุขภาพ (ถ้ามี)',
      footer: 'หากต้องการยกเลิกหรือเปลี่ยนแปลงการนัดหมาย กรุณาติดต่อโรงพยาบาลล่วงหน้าอย่างน้อย 24 ชั่วโมง'
    },
    en: {
      subject: 'Your Appointment Has Been Approved ✅',
      title: 'Appointment Approved',
      greeting: `Dear ${patientName}`,
      message: 'Your appointment has been approved. Please arrive on the scheduled date and time.',
      appointmentDetails: 'Appointment Details',
      doctor: 'Doctor',
      department: 'Department',
      branch: 'Branch',
      dateTime: 'Date & Time',
      selectedSlot: approvedSlot === 'primary' ? 'First Choice Date' : 'Second Choice Date',
      important: 'Important',
      reminder: 'Please arrive at least 15 minutes before your appointment',
      bringDocument: 'Please bring your ID card and health insurance card (if any)',
      footer: 'To cancel or reschedule, please contact the hospital at least 24 hours in advance'
    }
  }

  const t = translations[language]

  return {
    subject: t.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px 20px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .message {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
          }
          .details-card {
            background-color: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .details-card h2 {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #1e293b;
          }
          .detail-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #64748b;
            width: 140px;
            flex-shrink: 0;
          }
          .detail-value {
            color: #1e293b;
            font-weight: 500;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            background-color: #dbeafe;
            color: #1e40af;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
          }
          .important-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .important-box h3 {
            margin: 0 0 10px 0;
            color: #92400e;
            font-size: 16px;
          }
          .important-box ul {
            margin: 0;
            padding-left: 20px;
            color: #78350f;
          }
          .important-box li {
            margin: 5px 0;
          }
          .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
          .hospital-name {
            font-weight: 600;
            color: #2563eb;
            font-size: 18px;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="hospital-name">Health Queue</div>
            <h1>✅ ${t.title}</h1>
          </div>

          <div class="content">
            <p class="greeting"><strong>${t.greeting}</strong></p>
            <p class="message">${t.message}</p>

            <div class="details-card">
              <h2>${t.appointmentDetails}</h2>
              <div class="detail-row">
                <span class="detail-label">${t.doctor}:</span>
                <span class="detail-value">${doctorName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${t.department}:</span>
                <span class="detail-value">${specialty || departmentName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${t.branch}:</span>
                <span class="detail-value">${branchName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${t.dateTime}:</span>
                <span class="detail-value">
                  ${appointmentDate} • ${appointmentTime}
                  <span class="badge">${t.selectedSlot}</span>
                </span>
              </div>
            </div>

            <div class="important-box">
              <h3>⚠️ ${t.important}</h3>
              <ul>
                <li>${t.reminder}</li>
                <li>${t.bringDocument}</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>${t.footer}</p>
            <p style="margin-top: 15px;">
              <strong>Health Queue Hospital</strong><br>
              ${language === 'th' ? 'ระบบจองนัดหมายแพทย์ออนไลน์' : 'Online Medical Appointment System'}
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

/**
 * Appointment Rejected Email Template
 * Sent when admin rejects an appointment
 */
export const appointmentRejectedTemplate = ({
  patientName,
  doctorName,
  specialty,
  departmentName,
  branchName,
  primaryDate,
  primaryTime,
  secondaryDate,
  secondaryTime,
  rejectionReason,
  language = 'th'
}) => {
  const translations = {
    th: {
      subject: 'การนัดหมายของคุณไม่สามารถดำเนินการได้',
      title: 'การนัดหมายไม่สามารถดำเนินการได้',
      greeting: `เรียน คุณ${patientName}`,
      message: 'ขออภัย เราไม่สามารถอนุมัติการนัดหมายของคุณได้ในขณะนี้',
      requestedDetails: 'รายละเอียดที่คุณขอ',
      doctor: 'แพทย์',
      department: 'แผนก',
      branch: 'สาขา',
      requestedDates: 'วันที่ต้องการ',
      primaryChoice: 'ตัวเลือกที่ 1',
      secondaryChoice: 'ตัวเลือกที่ 2',
      reason: 'เหตุผล',
      defaultReason: 'แพทย์ไม่ว่างในช่วงเวลาที่เลือก',
      nextSteps: 'ขั้นตอนต่อไป',
      suggestion1: 'คุณสามารถจองนัดหมายใหม่ในวันและเวลาอื่นได้',
      suggestion2: 'หรือติดต่อโรงพยาบาลเพื่อสอบถามข้อมูลเพิ่มเติม',
      bookAgain: 'จองนัดหมายใหม่',
      footer: 'ขออภัยในความไม่สะดวก เราหวังว่าจะได้ให้บริการคุณในโอกาสถัดไป'
    },
    en: {
      subject: 'Appointment Request Could Not Be Processed',
      title: 'Appointment Not Available',
      greeting: `Dear ${patientName}`,
      message: 'We apologize, but we cannot approve your appointment request at this time.',
      requestedDetails: 'Your Requested Details',
      doctor: 'Doctor',
      department: 'Department',
      branch: 'Branch',
      requestedDates: 'Requested Dates',
      primaryChoice: 'First Choice',
      secondaryChoice: 'Second Choice',
      reason: 'Reason',
      defaultReason: 'Doctor not available during selected time slots',
      nextSteps: 'Next Steps',
      suggestion1: 'You can book a new appointment with different dates/times',
      suggestion2: 'Or contact the hospital for more information',
      bookAgain: 'Book New Appointment',
      footer: 'We apologize for any inconvenience. We hope to serve you in the near future.'
    }
  }

  const t = translations[language]

  return {
    subject: t.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px 20px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .message {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
          }
          .details-card {
            background-color: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .details-card h2 {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #7f1d1d;
          }
          .detail-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #fee2e2;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #991b1b;
            width: 140px;
            flex-shrink: 0;
          }
          .detail-value {
            color: #7f1d1d;
            font-weight: 500;
          }
          .dates-box {
            background-color: #f8fafc;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
          }
          .date-item {
            margin: 8px 0;
            font-size: 14px;
          }
          .date-label {
            font-weight: 600;
            color: #475569;
          }
          .reason-box {
            background-color: #fff7ed;
            border-left: 4px solid #f97316;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .reason-box h3 {
            margin: 0 0 10px 0;
            color: #9a3412;
            font-size: 16px;
          }
          .reason-text {
            color: #7c2d12;
            margin: 0;
          }
          .next-steps {
            background-color: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .next-steps h3 {
            margin: 0 0 10px 0;
            color: #1e3a8a;
            font-size: 16px;
          }
          .next-steps ul {
            margin: 0;
            padding-left: 20px;
            color: #1e40af;
          }
          .next-steps li {
            margin: 5px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
          .hospital-name {
            font-weight: 600;
            color: #dc2626;
            font-size: 18px;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="hospital-name">Health Queue</div>
            <h1>❌ ${t.title}</h1>
          </div>

          <div class="content">
            <p class="greeting"><strong>${t.greeting}</strong></p>
            <p class="message">${t.message}</p>

            <div class="details-card">
              <h2>${t.requestedDetails}</h2>
              <div class="detail-row">
                <span class="detail-label">${t.doctor}:</span>
                <span class="detail-value">${doctorName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${t.department}:</span>
                <span class="detail-value">${specialty || departmentName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${t.branch}:</span>
                <span class="detail-value">${branchName}</span>
              </div>
            </div>

            <div class="dates-box">
              <strong>${t.requestedDates}:</strong>
              <div class="date-item">
                <span class="date-label">${t.primaryChoice}:</span> ${primaryDate} • ${primaryTime}
              </div>
              ${secondaryDate ? `
                <div class="date-item">
                  <span class="date-label">${t.secondaryChoice}:</span> ${secondaryDate} • ${secondaryTime}
                </div>
              ` : ''}
            </div>

            <div class="reason-box">
              <h3>${t.reason}</h3>
              <p class="reason-text">${rejectionReason || t.defaultReason}</p>
            </div>

            <div class="next-steps">
              <h3>💡 ${t.nextSteps}</h3>
              <ul>
                <li>${t.suggestion1}</li>
                <li>${t.suggestion2}</li>
              </ul>
            </div>

            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/book-appointment" class="button">
                ${t.bookAgain}
              </a>
            </center>
          </div>

          <div class="footer">
            <p>${t.footer}</p>
            <p style="margin-top: 15px;">
              <strong>Health Queue Hospital</strong><br>
              ${language === 'th' ? 'ระบบจองนัดหมายแพทย์ออนไลน์' : 'Online Medical Appointment System'}
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

/**
 * New Appointment Notification for Doctor
 * Sent when a patient books an appointment
 */
export const newAppointmentDoctorTemplate = ({
  doctorName,
  patientName,
  departmentName,
  branchName,
  primaryDate,
  primaryTime,
  secondaryDate,
  secondaryTime,
  symptoms,
  language = 'th'
}) => {
  const translations = {
    th: {
      subject: `มีการจองนัดหมายใหม่กับคุณ - ${patientName}`,
      title: 'มีการจองนัดหมายใหม่',
      greeting: `เรียน ${doctorName}`,
      message: 'คุณมีการจองนัดหมายใหม่ที่รอการพิจารณา',
      patientInfo: 'ข้อมูลผู้ป่วย',
      patient: 'ผู้ป่วย',
      department: 'แผนก',
      branch: 'สาขา',
      requestedDates: 'วันที่ต้องการ',
      primaryChoice: 'ตัวเลือกที่ 1',
      secondaryChoice: 'ตัวเลือกที่ 2',
      symptoms: 'อาการเบื้องต้น',
      action: 'กรุณาตรวจสอบและยืนยันการนัดหมายผ่านระบบ Admin',
      viewAppointment: 'ดูรายละเอียดการนัดหมาย'
    },
    en: {
      subject: `New Appointment Request - ${patientName}`,
      title: 'New Appointment Request',
      greeting: `Dear Dr. ${doctorName}`,
      message: 'You have a new appointment request pending review.',
      patientInfo: 'Patient Information',
      patient: 'Patient',
      department: 'Department',
      branch: 'Branch',
      requestedDates: 'Requested Dates',
      primaryChoice: 'First Choice',
      secondaryChoice: 'Second Choice',
      symptoms: 'Symptoms',
      action: 'Please review and confirm the appointment through the Admin system',
      viewAppointment: 'View Appointment Details'
    }
  }

  const t = translations[language]

  return {
    subject: t.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px 20px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .message {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
          }
          .info-card {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-card h2 {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #064e3b;
          }
          .detail-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #d1fae5;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #065f46;
            width: 140px;
            flex-shrink: 0;
          }
          .detail-value {
            color: #064e3b;
            font-weight: 500;
          }
          .dates-box {
            background-color: #eff6ff;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
            border: 1px solid #dbeafe;
          }
          .date-item {
            margin: 8px 0;
            font-size: 14px;
          }
          .date-label {
            font-weight: 600;
            color: #1e40af;
          }
          .symptoms-box {
            background-color: #fef3c7;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            border-left: 4px solid #f59e0b;
          }
          .symptoms-box h3 {
            margin: 0 0 10px 0;
            color: #78350f;
            font-size: 16px;
          }
          .symptoms-text {
            color: #92400e;
            margin: 0;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #10b981;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
          .hospital-name {
            font-weight: 600;
            color: #10b981;
            font-size: 18px;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="hospital-name">Health Queue</div>
            <h1>🔔 ${t.title}</h1>
          </div>

          <div class="content">
            <p class="greeting"><strong>${t.greeting}</strong></p>
            <p class="message">${t.message}</p>

            <div class="info-card">
              <h2>${t.patientInfo}</h2>
              <div class="detail-row">
                <span class="detail-label">${t.patient}:</span>
                <span class="detail-value">${patientName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${t.department}:</span>
                <span class="detail-value">${departmentName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${t.branch}:</span>
                <span class="detail-value">${branchName}</span>
              </div>
            </div>

            <div class="dates-box">
              <strong>${t.requestedDates}:</strong>
              <div class="date-item">
                <span class="date-label">${t.primaryChoice}:</span> ${primaryDate} • ${primaryTime}
              </div>
              ${secondaryDate ? `
                <div class="date-item">
                  <span class="date-label">${t.secondaryChoice}:</span> ${secondaryDate} • ${secondaryTime}
                </div>
              ` : ''}
            </div>

            ${symptoms ? `
              <div class="symptoms-box">
                <h3>${t.symptoms}</h3>
                <p class="symptoms-text">${symptoms}</p>
              </div>
            ` : ''}

            <p style="color: #475569; margin: 20px 0;">${t.action}</p>

            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/appointments" class="button">
                ${t.viewAppointment}
              </a>
            </center>
          </div>

          <div class="footer">
            <p style="margin-top: 15px;">
              <strong>Health Queue Hospital</strong><br>
              ${language === 'th' ? 'ระบบจองนัดหมายแพทย์ออนไลน์' : 'Online Medical Appointment System'}
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}
