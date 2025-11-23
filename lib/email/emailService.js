/**
 * Email Service
 * Handles sending emails using Resend
 * Note: Requires RESEND_API_KEY environment variable
 */

import { Resend } from 'resend'
import {
  appointmentApprovedTemplate,
  appointmentRejectedTemplate,
  newAppointmentDoctorTemplate
} from './templates'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender email (must be verified in Resend dashboard)
const DEFAULT_FROM = process.env.EMAIL_FROM || 'Health Queue <noreply@healthqueue.com>'

/**
 * Send appointment approved email to patient
 * @param {Object} params - Email parameters
 * @param {string} params.to - Patient email
 * @param {string} params.patientName - Patient name
 * @param {string} params.doctorName - Doctor name
 * @param {string} params.specialty - Doctor specialty
 * @param {string} params.departmentName - Department name
 * @param {string} params.branchName - Branch name
 * @param {string} params.appointmentDate - Approved date (formatted)
 * @param {string} params.appointmentTime - Approved time (formatted)
 * @param {string} params.approvedSlot - 'primary' or 'secondary'
 * @param {string} params.language - 'th' or 'en'
 * @returns {Promise<Object>} Resend response
 */
export async function sendAppointmentApprovedEmail({
  to,
  patientName,
  doctorName,
  specialty,
  departmentName,
  branchName,
  appointmentDate,
  appointmentTime,
  approvedSlot,
  language = 'th'
}) {
  try {
    const { subject, html } = appointmentApprovedTemplate({
      patientName,
      doctorName,
      specialty,
      departmentName,
      branchName,
      appointmentDate,
      appointmentTime,
      approvedSlot,
      language
    })

    const result = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html
    })

    console.log('✅ Appointment approved email sent:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('❌ Error sending appointment approved email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send appointment rejected email to patient
 * @param {Object} params - Email parameters
 * @param {string} params.to - Patient email
 * @param {string} params.patientName - Patient name
 * @param {string} params.doctorName - Doctor name
 * @param {string} params.specialty - Doctor specialty
 * @param {string} params.departmentName - Department name
 * @param {string} params.branchName - Branch name
 * @param {string} params.primaryDate - Primary date (formatted)
 * @param {string} params.primaryTime - Primary time (formatted)
 * @param {string} params.secondaryDate - Secondary date (formatted)
 * @param {string} params.secondaryTime - Secondary time (formatted)
 * @param {string} params.rejectionReason - Reason for rejection
 * @param {string} params.language - 'th' or 'en'
 * @returns {Promise<Object>} Resend response
 */
export async function sendAppointmentRejectedEmail({
  to,
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
}) {
  try {
    const { subject, html } = appointmentRejectedTemplate({
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
      language
    })

    const result = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html
    })

    console.log('✅ Appointment rejected email sent:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('❌ Error sending appointment rejected email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send new appointment notification to doctor
 * @param {Object} params - Email parameters
 * @param {string} params.to - Doctor email
 * @param {string} params.doctorName - Doctor name
 * @param {string} params.patientName - Patient name
 * @param {string} params.departmentName - Department name
 * @param {string} params.branchName - Branch name
 * @param {string} params.primaryDate - Primary date (formatted)
 * @param {string} params.primaryTime - Primary time (formatted)
 * @param {string} params.secondaryDate - Secondary date (formatted)
 * @param {string} params.secondaryTime - Secondary time (formatted)
 * @param {string} params.symptoms - Patient symptoms
 * @param {string} params.language - 'th' or 'en'
 * @returns {Promise<Object>} Resend response
 */
export async function sendNewAppointmentDoctorEmail({
  to,
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
}) {
  try {
    const { subject, html } = newAppointmentDoctorTemplate({
      doctorName,
      patientName,
      departmentName,
      branchName,
      primaryDate,
      primaryTime,
      secondaryDate,
      secondaryTime,
      symptoms,
      language
    })

    const result = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html
    })

    console.log('✅ New appointment doctor email sent:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('❌ Error sending new appointment doctor email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Format date for email display
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} locale - 'th-TH' or 'en-US'
 * @returns {string} Formatted date
 */
export function formatEmailDate(date, locale = 'th-TH') {
  if (!date) return 'N/A'

  try {
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return date
  }
}

/**
 * Format time for email display
 * @param {string} time - Time string (HH:MM or HH:MM-HH:MM)
 * @param {string} locale - 'th-TH' or 'en-US'
 * @returns {string} Formatted time
 */
export function formatEmailTime(time, locale = 'th-TH') {
  if (!time) return 'N/A'

  // If time range (e.g., "10:00-11:00")
  if (time.includes('-')) {
    return time
  }

  // If single time (e.g., "10:00")
  const [hours, minutes] = time.split(':')
  const timeObj = new Date()
  timeObj.setHours(parseInt(hours), parseInt(minutes))

  return timeObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' น.'
}
