/**
 * SMS Service using Twilio
 * Sends SMS notifications to users
 */

/**
 * Send SMS using Twilio
 * @param {string} to - Phone number (with country code, e.g., +66812345678)
 * @param {string} message - SMS message content
 * @returns {Promise<Object>} Result object
 */
export async function sendSMS(to, message) {
  try {
    // Validate phone number format
    if (!to || !to.startsWith('+')) {
      throw new Error('Phone number must start with + and country code')
    }

    // Validate message
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty')
    }

    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('Twilio credentials not configured, SMS not sent')
      return {
        success: false,
        error: 'Twilio not configured',
        simulated: true
      }
    }

    // Use Twilio REST API directly (without installing SDK)
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID

    // Prepare request body
    const formData = new URLSearchParams()
    formData.append('To', to)
    formData.append('Body', message)

    // Use either phone number or messaging service SID
    if (messagingServiceSid) {
      formData.append('MessagingServiceSid', messagingServiceSid)
    } else if (fromNumber) {
      formData.append('From', fromNumber)
    } else {
      throw new Error('Either TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID must be configured')
    }

    // Make request to Twilio API
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Twilio API error:', data)
      return {
        success: false,
        error: data.message || 'Failed to send SMS',
        details: data
      }
    }

    console.log('✅ SMS sent successfully:', {
      to,
      sid: data.sid,
      status: data.status
    })

    return {
      success: true,
      sid: data.sid,
      status: data.status,
      to: data.to
    }

  } catch (error) {
    console.error('SMS send error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Send appointment approved SMS
 */
export async function sendAppointmentApprovedSMS({ phone, patientName, appointmentDate, appointmentTime }) {
  const message = `สวัสดีค่ะคุณ ${patientName}\n\n✅ การจองนัดหมายของคุณได้รับการอนุมัติแล้ว\n\nวันที่: ${appointmentDate}\nเวลา: ${appointmentTime}\n\nกรุณามาตรงเวลานะคะ\n\n- Health Queue`

  return sendSMS(phone, message)
}

/**
 * Send appointment rejected SMS
 */
export async function sendAppointmentRejectedSMS({ phone, patientName, reason }) {
  let message = `สวัสดีค่ะคุณ ${patientName}\n\n❌ ขออภัยค่ะ การจองนัดหมายของคุณถูกปฏิเสธ`

  if (reason) {
    message += `\n\nเหตุผล: ${reason}`
  }

  message += `\n\nกรุณาติดต่อเจ้าหน้าที่เพื่อขอข้อมูลเพิ่มเติมค่ะ\n\n- Health Queue`

  return sendSMS(phone, message)
}

/**
 * Send appointment reminder SMS
 */
export async function sendAppointmentReminderSMS({ phone, patientName, appointmentDate, appointmentTime, reminderType }) {
  let message = ''

  switch (reminderType) {
    case '1day_before':
      message = `สวัสดีค่ะคุณ ${patientName}\n\n📅 เตือนค่ะ: พรุ่งนี้คุณมีนัดหมาย\nวันที่: ${appointmentDate}\nเวลา: ${appointmentTime}\n\nกรุณาเตรียมตัวล่วงหน้านะคะ\n\n- Health Queue`
      break

    case '12hours_before':
      message = `สวัสดีค่ะคุณ ${patientName}\n\n⏰ เตือนค่ะ: อีก 12 ชั่วโมงคุณมีนัดหมาย\nวันที่: ${appointmentDate}\nเวลา: ${appointmentTime}\n\n- Health Queue`
      break

    case '3hours_before':
      message = `สวัสดีค่ะคุณ ${patientName}\n\n🔔 เตือนค่ะ: อีก 3 ชั่วโมงคุณมีนัดหมาย\nเวลา: ${appointmentTime}\n\nอย่าลืมมาพบแพทย์ตรงเวลานะคะ\n\n- Health Queue`
      break

    default:
      message = `สวัสดีค่ะคุณ ${patientName}\n\n🔔 คุณมีนัดหมาย\nวันที่: ${appointmentDate}\nเวลา: ${appointmentTime}\n\n- Health Queue`
  }

  return sendSMS(phone, message)
}

/**
 * Format phone number to international format
 * Converts Thai phone numbers to +66 format
 */
export function formatPhoneNumber(phone) {
  if (!phone) return null

  // Remove all spaces, dashes, and parentheses
  let cleaned = phone.replace(/[\s\-()]/g, '')

  // If already has +, return as is
  if (cleaned.startsWith('+')) {
    return cleaned
  }

  // If starts with 0 (Thai format), convert to +66
  if (cleaned.startsWith('0')) {
    return '+66' + cleaned.substring(1)
  }

  // If starts with 66, add +
  if (cleaned.startsWith('66')) {
    return '+' + cleaned
  }

  // Otherwise, assume it's Thai and add +66
  return '+66' + cleaned
}
