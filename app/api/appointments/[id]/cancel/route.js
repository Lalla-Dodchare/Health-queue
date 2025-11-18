import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

/**
 * Cancel Appointment API
 * Allows users to cancel their upcoming appointments
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
    const { reason } = await request.json()

    // Verify appointment belongs to user
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if appointment is already cancelled
    if (appointment.status === 'cancelled' || appointment.cancelled_at) {
      return NextResponse.json(
        { error: 'Appointment is already cancelled' },
        { status: 400 }
      )
    }

    // Check if appointment is in the past
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
    if (appointmentDate < new Date()) {
      return NextResponse.json(
        { error: 'Cannot cancel past appointments' },
        { status: 400 }
      )
    }

    // Update appointment status to cancelled
    const { data, error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || 'No reason provided',
        cancelled_by: user.id
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: data
    })

  } catch (error) {
    console.error('Cancel appointment error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel appointment', details: error.message },
      { status: 500 }
    )
  }
}
