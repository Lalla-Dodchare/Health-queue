/**
 * API Route: Send Appointment Notification Email
 * POST /api/appointments/send-notification
 * Sends email notifications for appointment status changes
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  sendAppointmentApprovedEmail,
  sendAppointmentRejectedEmail,
  formatEmailDate,
  formatEmailTime
} from '@/lib/email/emailService'

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
        primary_flexible,
        secondary_flexible,
        symptoms,
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

    // Fetch related data separately
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', appointment.user_id)
      .single()

    const { data: doctor } = await supabase
      .from('doctors')
      .select('id, contact_name, contact_email, specialty')
      .eq('id', appointment.doctor_id)
      .single()

    const { data: department } = await supabase
      .from('departments')
      .select('id, name')
      .eq('id', appointment.department_id)
      .single()

    const { data: branch } = await supabase
      .from('branches')
      .select('id, name')
      .eq('id', appointment.branch_id)
      .single()

    // Reconstruct appointment object
    appointment.profiles = profile
    appointment.doctors = doctor
    appointment.departments = department
    appointment.branches = branch

    // Determine language (default to Thai)
    const language = 'th' // Can be enhanced to check user preferences

    // Prepare common data
    const patientName = appointment.profiles?.full_name || 'Patient'
    const patientEmail = appointment.profiles?.email
    const doctorName = appointment.doctors?.contact_name || 'Doctor'
    const specialty = appointment.doctors?.specialty || ''
    const departmentName = appointment.departments?.name || 'Department'
    const branchName = appointment.branches?.name || 'Branch'

    // Format dates and times
    const primaryDate = formatEmailDate(appointment.primary_date, language === 'th' ? 'th-TH' : 'en-US')
    const primaryTime = formatEmailTime(appointment.primary_time, language === 'th' ? 'th-TH' : 'en-US')
    const secondaryDate = appointment.secondary_date
      ? formatEmailDate(appointment.secondary_date, language === 'th' ? 'th-TH' : 'en-US')
      : null
    const secondaryTime = appointment.secondary_time
      ? formatEmailTime(appointment.secondary_time, language === 'th' ? 'th-TH' : 'en-US')
      : null

    // Validate patient email
    if (!patientEmail) {
      console.error('Patient email not found for appointment:', appointmentId)
      return NextResponse.json(
        { success: false, error: 'Patient email not found' },
        { status: 400 }
      )
    }

    let emailResult

    if (action === 'approved') {
      // Determine which date was approved
      const approvedSlot = appointment.approved_option || 'primary'
      const appointmentDate = approvedSlot === 'primary' ? primaryDate : secondaryDate
      const appointmentTime = approvedSlot === 'primary' ? primaryTime : secondaryTime

      // Send approved email
      emailResult = await sendAppointmentApprovedEmail({
        to: patientEmail,
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
    } else if (action === 'rejected') {
      // Send rejected email
      emailResult = await sendAppointmentRejectedEmail({
        to: patientEmail,
        patientName,
        doctorName,
        specialty,
        departmentName,
        branchName,
        primaryDate,
        primaryTime,
        secondaryDate,
        secondaryTime,
        rejectionReason: rejectionReason || null,
        language
      })
    }

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email',
          details: emailResult.error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${patientEmail}`,
      data: emailResult.data
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
