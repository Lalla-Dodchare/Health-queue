/**
 * API Route: Send Appointment Notification (Email + SMS + In-App)
 * POST /api/appointments/send-notification
 * Sends Email, SMS, and in-app notifications for appointment status changes
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  createAppointmentApprovedNotification,
  createAppointmentRejectedNotification
} from '@/lib/notifications'

// Use service role key to bypass RLS and access all data
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { appointmentId, action, rejectionReason } = body

    // Validate input
    if (!appointmentId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: appointmentId, action' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approved" or "rejected"' },
        { status: 400 }
      )
    }

    // Fetch appointment details with related data
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        id,
        user_id,
        primary_date,
        primary_time,
        secondary_date,
        secondary_time,
        approved_option,
        status,
        doctor_id,
        department_id,
        branch_id
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

    // Fetch user profile (with email, phone, notification preferences)
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, notification_preferences')
      .eq('id', appointment.user_id)
      .single()

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Fetch doctor, branch, department names for notification content
    const { data: doctor } = await supabase
      .from('doctors')
      .select('name')
      .eq('id', appointment.doctor_id)
      .single()

    const { data: branch } = await supabase
      .from('branches')
      .select('name')
      .eq('id', appointment.branch_id)
      .single()

    let departmentName = null
    if (appointment.department_id) {
      const { data: department } = await supabase
        .from('departments')
        .select('name')
        .eq('id', appointment.department_id)
        .single()
      departmentName = department?.name
    }

    // Attach names to appointment object for notification
    const appointmentWithDetails = {
      ...appointment,
      doctor_name: doctor?.name,
      branch_name: branch?.name,
      department_name: departmentName
    }

    let notificationResult

    if (action === 'approved') {
      // Send in-app notification + Email + SMS
      notificationResult = await createAppointmentApprovedNotification(
        appointmentWithDetails,
        userProfile,
        supabase
      )
    } else if (action === 'rejected') {
      // Send in-app notification + Email + SMS
      notificationResult = await createAppointmentRejectedNotification(
        appointmentWithDetails,
        rejectionReason || null,
        userProfile,
        supabase
      )
    }

    if (!notificationResult || !notificationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send notification',
          details: notificationResult?.error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Notification (in-app + Email + SMS) sent successfully to ${userProfile.email}`,
      data: notificationResult.data
    })
  } catch (error) {
    console.error('Error in send-notification API:', error)
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
