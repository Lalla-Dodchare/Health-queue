/**
 * Notification Helper Functions
 * Utilities for creating notifications in the database and sending SMS
 */

import { supabase as defaultSupabase } from './supabase'
import {
  sendAppointmentApprovedSMS,
  sendAppointmentRejectedSMS,
  sendAppointmentReminderSMS,
  formatPhoneNumber
} from './sms'

/**
 * Create a notification in the database
 * @param {Object} params - Notification parameters
 * @param {Object} supabaseClient - Optional Supabase client (defaults to client-side supabase)
 * @returns {Promise<Object>} Created notification or error
 */
export async function createNotification({
  userId,
  title,
  message,
  type = 'info',
  priority = 'normal',
  relatedAppointmentId = null,
  relatedPaymentId = null,
  actionUrl = null,
  scheduledFor = null,
  reminderType = null,
  supabaseClient = null
}) {
  try {
    const supabase = supabaseClient || defaultSupabase

    // Validate required fields
    if (!userId) {
      throw new Error('userId is required')
    }
    if (!title || !message) {
      throw new Error('title and message are required')
    }

    // Prepare notification data
    const notificationData = {
      user_id: userId,
      title,
      message,
      type,
      priority,
      related_appointment_id: relatedAppointmentId,
      related_payment_id: relatedPaymentId,
      action_url: actionUrl,
      reminder_type: reminderType,
      is_read: false
    }

    // If scheduled for later, set scheduled_for, otherwise set sent_at to now
    if (scheduledFor) {
      notificationData.scheduled_for = scheduledFor
    } else {
      notificationData.sent_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Create notification error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create appointment approved notification (with SMS)
 * @param {Object} appointment - Appointment data
 * @param {Object} userProfile - User profile data (optional)
 * @param {Object} supabaseClient - Supabase client to use (optional)
 */
export async function createAppointmentApprovedNotification(appointment, userProfile = null, supabaseClient = null) {
  const approvedSlot = appointment.approved_option || 'primary'
  const appointmentDate = approvedSlot === 'primary'
    ? appointment.primary_date
    : appointment.secondary_date
  const appointmentTime = approvedSlot === 'primary'
    ? appointment.primary_time
    : appointment.secondary_time

  // Format date and time for display
  const formattedDate = new Date(appointmentDate).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
  const formattedTime = appointmentTime

  // Create in-app notification
  const notifResult = await createNotification({
    userId: appointment.user_id,
    title: '✅ การจองได้รับการอนุมัติแล้ว',
    message: `การนัดหมายของคุณได้รับการอนุมัติแล้ว\nวันที่: ${formattedDate}\nเวลา: ${formattedTime}`,
    type: 'appointment',
    priority: 'high',
    relatedAppointmentId: appointment.id,
    actionUrl: '/dashboard/appointments',
    supabaseClient
  })

  // Send SMS if user profile has phone and SMS enabled
  if (userProfile?.phone && userProfile?.notification_preferences?.sms_notifications !== false) {
    const phone = formatPhoneNumber(userProfile.phone)
    if (phone) {
      await sendAppointmentApprovedSMS({
        phone,
        patientName: userProfile.full_name || 'คุณ',
        appointmentDate: formattedDate,
        appointmentTime: formattedTime
      })
    }
  }

  return notifResult
}

/**
 * Create appointment rejected notification (with SMS)
 * @param {Object} appointment - Appointment data
 * @param {string} reason - Rejection reason (optional)
 * @param {Object} userProfile - User profile data (optional)
 * @param {Object} supabaseClient - Supabase client to use (optional)
 */
export async function createAppointmentRejectedNotification(appointment, reason = null, userProfile = null, supabaseClient = null) {
  const reasonText = reason ? `\nเหตุผล: ${reason}` : ''

  // Create in-app notification
  const notifResult = await createNotification({
    userId: appointment.user_id,
    title: '❌ การจองถูกปฏิเสธ',
    message: `ขออภัย การนัดหมายของคุณถูกปฏิเสธ${reasonText}\nกรุณาติดต่อเจ้าหน้าที่เพื่อขอข้อมูลเพิ่มเติม`,
    type: 'appointment',
    priority: 'high',
    relatedAppointmentId: appointment.id,
    actionUrl: '/dashboard/appointments',
    supabaseClient
  })

  // Send SMS if user profile has phone and SMS enabled
  if (userProfile?.phone && userProfile?.notification_preferences?.sms_notifications !== false) {
    const phone = formatPhoneNumber(userProfile.phone)
    if (phone) {
      await sendAppointmentRejectedSMS({
        phone,
        patientName: userProfile.full_name || 'คุณ',
        reason
      })
    }
  }

  return notifResult
}

/**
 * Create appointment reminder notification (scheduled)
 * @param {Object} params - Reminder parameters
 * @param {Object} params.appointment - Appointment data
 * @param {string} params.reminderType - '1day_before', '12hours_before', '3hours_before'
 * @param {string} params.scheduledFor - ISO timestamp when to send
 * @param {Object} params.supabaseClient - Supabase client to use (optional)
 */
export async function createAppointmentReminder({
  appointment,
  reminderType, // '1day_before', '12hours_before', '3hours_before'
  scheduledFor,
  supabaseClient = null
}) {
  const approvedSlot = appointment.approved_option || 'primary'
  const appointmentDate = approvedSlot === 'primary'
    ? appointment.primary_date
    : appointment.secondary_date
  const appointmentTime = approvedSlot === 'primary'
    ? appointment.primary_time
    : appointment.secondary_time

  const formattedDate = new Date(appointmentDate).toLocaleDateString('th-TH', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  })

  // Determine message based on reminder type
  let title = ''
  let message = ''

  switch (reminderType) {
    case '1day_before':
      title = '📅 เตือน: วันนัดพรุ่งนี้'
      message = `คุณมีนัดหมายในวันพรุ่งนี้\nวันที่: ${formattedDate}\nเวลา: ${appointmentTime}\nกรุณาเตรียมตัวล่วงหน้า`
      break
    case '12hours_before':
      title = '⏰ เตือน: นัดใกล้เข้ามาแล้ว (12 ชม.)'
      message = `คุณมีนัดหมายในอีก 12 ชั่วโมง\nวันที่: ${formattedDate}\nเวลา: ${appointmentTime}`
      break
    case '3hours_before':
      title = '🔔 เตือน: ใกล้ถึงเวลานัดแล้ว (3 ชม.)'
      message = `คุณมีนัดหมายในอีก 3 ชั่วโมง\nเวลา: ${appointmentTime}\nอย่าลืมไปพบแพทย์ตรงเวลานะคะ`
      break
    default:
      title = '🔔 เตือนการนัดหมาย'
      message = `คุณมีนัดหมาย\nวันที่: ${formattedDate}\nเวลา: ${appointmentTime}`
  }

  return createNotification({
    userId: appointment.user_id,
    title,
    message,
    type: 'reminder',
    priority: 'high',
    relatedAppointmentId: appointment.id,
    actionUrl: '/dashboard/appointments',
    scheduledFor,
    reminderType,
    supabaseClient
  })
}

/**
 * Schedule all reminders for an approved appointment
 * @param {Object} appointment - Appointment data
 * @param {Object} supabaseClient - Supabase client to use (optional)
 */
export async function scheduleAppointmentReminders(appointment, supabaseClient = null) {
  const approvedSlot = appointment.approved_option || 'primary'
  const appointmentDate = approvedSlot === 'primary'
    ? appointment.primary_date
    : appointment.secondary_date
  const appointmentTime = approvedSlot === 'primary'
    ? appointment.primary_time
    : appointment.secondary_time

  // Combine date and time to create full datetime
  const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`)

  // Calculate reminder times
  const oneDayBefore = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000)
  const twelveHoursBefore = new Date(appointmentDateTime.getTime() - 12 * 60 * 60 * 1000)
  const threeHoursBefore = new Date(appointmentDateTime.getTime() - 3 * 60 * 60 * 1000)

  const results = []

  // Only schedule future reminders
  const now = new Date()

  if (oneDayBefore > now) {
    const result = await createAppointmentReminder({
      appointment,
      reminderType: '1day_before',
      scheduledFor: oneDayBefore.toISOString(),
      supabaseClient
    })
    results.push({ type: '1day_before', ...result })
  }

  if (twelveHoursBefore > now) {
    const result = await createAppointmentReminder({
      appointment,
      reminderType: '12hours_before',
      scheduledFor: twelveHoursBefore.toISOString(),
      supabaseClient
    })
    results.push({ type: '12hours_before', ...result })
  }

  if (threeHoursBefore > now) {
    const result = await createAppointmentReminder({
      appointment,
      reminderType: '3hours_before',
      scheduledFor: threeHoursBefore.toISOString(),
      supabaseClient
    })
    results.push({ type: '3hours_before', ...result })
  }

  return results
}
