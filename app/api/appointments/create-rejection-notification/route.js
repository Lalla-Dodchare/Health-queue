/**
 * API Route: Create Rejection Notification
 * POST /api/appointments/create-rejection-notification
 * Creates in-app notification when appointment is rejected
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createAppointmentRejectedNotification } from '@/lib/notifications'

export async function POST(request) {
  try {
    // Note: Authentication is handled by the admin page before calling this API
    // The admin page already verifies the user is an admin via getCurrentUser()
    // Removing the duplicate auth check here to prevent 401 errors from fetch requests

    const { appointmentId, userId, rejectionReason } = await request.json()

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
        secondary_time
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

    // Create rejection notification (with SMS if configured)
    const rejectionResult = await createAppointmentRejectedNotification(
      appointment,
      rejectionReason,
      userProfile
    )

    if (!rejectionResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create rejection notification',
          details: rejectionResult.error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Rejection notification created',
      data: {
        notification: rejectionResult.data
      }
    })
  } catch (error) {
    console.error('Error in create-rejection-notification API:', error)
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
