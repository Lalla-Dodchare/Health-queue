/**
 * API Route: Send Scheduled Notifications (Cron Job)
 * GET/POST /api/cron/send-scheduled-notifications
 * Sends all scheduled notifications that are due
 *
 * This should be called by a cron job every 5-15 minutes
 *
 * Setup Cron Job:
 * - Vercel Cron: Add to vercel.json
 * - External Cron: Use services like cron-job.org or EasyCron
 * - Call: GET https://your-domain.com/api/cron/send-scheduled-notifications?secret=YOUR_SECRET
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendAppointmentReminderSMS, formatPhoneNumber } from '@/lib/sms'

export async function GET(request) {
  return handleSendScheduledNotifications(request)
}

export async function POST(request) {
  return handleSendScheduledNotifications(request)
}

async function handleSendScheduledNotifications(request) {
  try {
    // Security: Check secret key to prevent unauthorized access
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.CLEANUP_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid secret' },
        { status: 401 }
      )
    }

    const now = new Date().toISOString()

    // Fetch all notifications that are scheduled and due to be sent
    const { data: scheduledNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select(`
        *,
        appointment:appointments!related_appointment_id (
          primary_date,
          primary_time,
          secondary_date,
          secondary_time,
          approved_option
        ),
        user:profiles!user_id (
          full_name,
          phone,
          notification_preferences
        )
      `)
      .not('scheduled_for', 'is', null)
      .is('sent_at', null)
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })

    if (fetchError) {
      console.error('Error fetching scheduled notifications:', fetchError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch scheduled notifications',
          details: fetchError.message
        },
        { status: 500 }
      )
    }

    if (!scheduledNotifications || scheduledNotifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled notifications to send',
        count: 0,
        timestamp: now
      })
    }

    // Send SMS for reminder notifications
    let smsSentCount = 0
    for (const notif of scheduledNotifications) {
      // Only send SMS for reminder type notifications
      if (notif.reminder_type && notif.user?.phone && notif.appointment) {
        // Check if SMS is enabled for this user
        if (notif.user.notification_preferences?.sms_notifications !== false) {
          const phone = formatPhoneNumber(notif.user.phone)
          if (phone) {
            const appointment = notif.appointment
            const approvedSlot = appointment.approved_option || 'primary'
            const appointmentDate = approvedSlot === 'primary'
              ? appointment.primary_date
              : appointment.secondary_date
            const appointmentTime = approvedSlot === 'primary'
              ? appointment.primary_time
              : appointment.secondary_time

            const formattedDate = new Date(appointmentDate).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })

            const smsResult = await sendAppointmentReminderSMS({
              phone,
              patientName: notif.user.full_name || 'คุณ',
              appointmentDate: formattedDate,
              appointmentTime,
              reminderType: notif.reminder_type
            })

            if (smsResult.success) {
              smsSentCount++
            }
          }
        }
      }
    }

    // Mark all due notifications as sent
    const notificationIds = scheduledNotifications.map(n => n.id)

    const { error: updateError } = await supabase
      .from('notifications')
      .update({ sent_at: now })
      .in('id', notificationIds)

    if (updateError) {
      console.error('Error updating notifications:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update notifications',
          details: updateError.message
        },
        { status: 500 }
      )
    }

    // Log success
    console.log(`✅ Sent ${scheduledNotifications.length} scheduled notifications`)
    console.log(`📱 Sent ${smsSentCount} SMS reminders`)

    // Return summary
    const reminderTypeCounts = scheduledNotifications.reduce((acc, n) => {
      const type = n.reminder_type || 'other'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      message: 'Scheduled notifications sent successfully',
      count: scheduledNotifications.length,
      smsSent: smsSentCount,
      reminderTypes: reminderTypeCounts,
      timestamp: now,
      notifications: scheduledNotifications.map(n => ({
        id: n.id,
        user_id: n.user_id,
        title: n.title,
        reminder_type: n.reminder_type,
        scheduled_for: n.scheduled_for,
        sms_capable: !!(n.user?.phone && n.user?.notification_preferences?.sms_notifications !== false)
      }))
    })
  } catch (error) {
    console.error('Error in send-scheduled-notifications cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}
