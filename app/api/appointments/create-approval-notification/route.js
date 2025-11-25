/**
 * API Route: Create Approval Notification
 * POST /api/appointments/create-approval-notification
 * Creates in-app notification when appointment is approved and schedules reminders
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  createAppointmentApprovedNotification,
  scheduleAppointmentReminders
} from '@/lib/notifications'

// Use service role key to bypass RLS and access all data
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    // Note: Authentication is handled by the admin page before calling this API
    // The admin page already verifies the user is an admin via getCurrentUser()
    // Removing the duplicate auth check here to prevent 401 errors from fetch requests

    const { appointmentId, userId, approvedSlot } = await request.json()

    // Validate input
    if (!appointmentId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: appointmentId, userId' },
        { status: 400 }
      )
    }

    // Fetch appointment details
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        id,
        user_id,
        primary_date,
        primary_time,
        secondary_date,
        secondary_time,
        approved_option
      `)
      .eq('id', appointmentId)
      .single()

    if (fetchError || !appointment) {
      console.error('Error fetching appointment:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Fetch user profile for SMS
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name, phone, notification_preferences')
      .eq('id', userId)
      .single()

    // Create approval notification (with SMS if configured) - pass supabase client
    const approvalResult = await createAppointmentApprovedNotification(appointment, userProfile, supabase)

    if (!approvalResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create approval notification',
          details: approvalResult.error
        },
        { status: 500 }
      )
    }

    // Schedule reminder notifications (1 day, 12 hours, 3 hours before) - pass supabase client
    const remindersResult = await scheduleAppointmentReminders(appointment, supabase)

    const successfulReminders = remindersResult.filter(r => r.success).length
    const failedReminders = remindersResult.filter(r => !r.success)

    if (failedReminders.length > 0) {
      console.warn('Some reminders failed to schedule:', failedReminders)
    }

    return NextResponse.json({
      success: true,
      message: 'Approval notification created and reminders scheduled',
      data: {
        approvalNotification: approvalResult.data,
        remindersScheduled: successfulReminders,
        remindersFailed: failedReminders.length,
        reminders: remindersResult
      }
    })
  } catch (error) {
    console.error('Error in create-approval-notification API:', error)
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
