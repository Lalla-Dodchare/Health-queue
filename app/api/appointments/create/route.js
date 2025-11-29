/**
 * API Route: Create Appointment
 * POST /api/appointments/create
 * Creates new appointment and sends notifications (email + SMS)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAppointmentCreatedNotification } from '@/lib/notifications'

// Use service role key to bypass RLS and access all data
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()

    const {
      userId,
      doctorId,
      branchId,
      departmentId,
      primaryDate,
      primaryTime,
      secondaryDate,
      secondaryTime,
      symptoms,
      notes
    } = body

    // Validate required fields
    if (!userId || !doctorId || !branchId || !primaryDate || !primaryTime) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userId, doctorId, branchId, primaryDate, primaryTime'
        },
        { status: 400 }
      )
    }

    // Create appointment in database
    const { data: appointment, error: createError } = await supabase
      .from('appointments')
      .insert([
        {
          user_id: userId,
          doctor_id: doctorId,
          branch_id: branchId,
          department_id: departmentId,
          primary_date: primaryDate,
          primary_time: primaryTime,
          secondary_date: secondaryDate || null,
          secondary_time: secondaryTime || null,
          symptoms: symptoms || null,
          notes: notes || null,
          status: 'pending', // Pending approval
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (createError || !appointment) {
      console.error('Error creating appointment:', createError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create appointment',
          details: createError?.message
        },
        { status: 500 }
      )
    }

    // Fetch user profile for notifications (email, phone, notification preferences)
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email, phone, notification_preferences')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      // Don't fail the whole request, just log warning
      console.warn('Could not fetch user profile for notifications')
    }

    // Fetch doctor, branch, and department names for notification content
    const { data: doctor } = await supabase
      .from('doctors')
      .select('name')
      .eq('id', doctorId)
      .single()

    const { data: branch } = await supabase
      .from('branches')
      .select('name')
      .eq('id', branchId)
      .single()

    let departmentName = null
    if (departmentId) {
      const { data: department } = await supabase
        .from('departments')
        .select('name')
        .eq('id', departmentId)
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

    // Create notification and send email + SMS
    let notificationResult = null
    if (userProfile) {
      notificationResult = await createAppointmentCreatedNotification(
        appointmentWithDetails,
        userProfile,
        supabase
      )

      if (!notificationResult.success) {
        console.warn('Failed to create notification:', notificationResult.error)
        // Don't fail the whole request, notification is not critical
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment: appointmentWithDetails,
        notification: notificationResult
      }
    })
  } catch (error) {
    console.error('Error in create appointment API:', error)
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
