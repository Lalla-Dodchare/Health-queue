import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

/**
 * Reschedule Appointment API
 * Allows users to reschedule their appointments to a new date/time
 */
export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const { newDate, newTime, reason } = await request.json()

    if (!newDate || !newTime) {
      return NextResponse.json(
        { error: 'New date and time are required' },
        { status: 400 }
      )
    }

    // Verify appointment belongs to user
    const { data: oldAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !oldAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if appointment is already cancelled
    if (oldAppointment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot reschedule cancelled appointment' },
        { status: 400 }
      )
    }

    // Check if new time slot is available
    const { data: conflictingAppointments } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', oldAppointment.doctor_id)
      .eq('appointment_date', newDate)
      .eq('appointment_time', newTime)
      .neq('status', 'cancelled')

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      return NextResponse.json(
        { error: 'Selected time slot is not available' },
        { status: 400 }
      )
    }

    // Create new appointment with rescheduled status
    const { data: newAppointment, error: createError } = await supabase
      .from('appointments')
      .insert([{
        user_id: oldAppointment.user_id,
        doctor_id: oldAppointment.doctor_id,
        appointment_date: newDate,
        appointment_time: newTime,
        symptoms: oldAppointment.symptoms,
        status: 'confirmed',
        rescheduled_from: oldAppointment.id
      }])
      .select()
      .single()

    if (createError) {
      throw createError
    }

    // Update old appointment to mark as rescheduled
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'rescheduled',
        rescheduled_to: newAppointment.id,
        cancellation_reason: reason || 'Rescheduled to new time'
      })
      .eq('id', id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      oldAppointment: { id, status: 'rescheduled' },
      newAppointment
    })

  } catch (error) {
    console.error('Reschedule appointment error:', error)
    return NextResponse.json(
      { error: 'Failed to reschedule appointment', details: error.message },
      { status: 500 }
    )
  }
}
