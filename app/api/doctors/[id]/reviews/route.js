import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/doctors/[id]/reviews
 * Get all reviews for a specific doctor
 */
export async function GET(request, { params }) {
  try {
    const { id: doctorId } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get reviews with user info
    const { data: reviews, error: reviewsError } = await supabase
      .from('doctor_reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        users (
          id,
          name,
          full_name
        )
      `)
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (reviewsError) throw reviewsError

    // Get doctor rating statistics
    const { data: stats, error: statsError } = await supabase
      .from('doctors')
      .select('average_rating, review_count')
      .eq('id', doctorId)
      .single()

    if (statsError) throw statsError

    // Calculate rating breakdown
    const ratingBreakdown = {
      5: reviews?.filter(r => r.rating === 5).length || 0,
      4: reviews?.filter(r => r.rating === 4).length || 0,
      3: reviews?.filter(r => r.rating === 3).length || 0,
      2: reviews?.filter(r => r.rating === 2).length || 0,
      1: reviews?.filter(r => r.rating === 1).length || 0
    }

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
      statistics: {
        averageRating: parseFloat(stats?.average_rating || 0),
        totalReviews: stats?.review_count || 0,
        ratingBreakdown
      }
    })

  } catch (error) {
    console.error('Get doctor reviews error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/doctors/[id]/reviews
 * Create a new review for a doctor
 */
export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: doctorId } = params
    const { rating, comment, appointmentId } = await request.json()

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // If appointmentId provided, verify it
    if (appointmentId) {
      const { data: appointment, error: aptError } = await supabase
        .from('appointments')
        .select('id, user_id, doctor_id, appointment_date, appointment_time')
        .eq('id', appointmentId)
        .single()

      if (aptError || !appointment) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        )
      }

      // Verify appointment belongs to user
      if (appointment.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Appointment does not belong to you' },
          { status: 403 }
        )
      }

      // Verify appointment is with this doctor
      if (appointment.doctor_id !== doctorId) {
        return NextResponse.json(
          { error: 'Appointment is not with this doctor' },
          { status: 400 }
        )
      }

      // Check if appointment is in the past
      const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
      if (appointmentDateTime > new Date()) {
        return NextResponse.json(
          { error: 'Cannot review future appointments' },
          { status: 400 }
        )
      }

      // Check if already reviewed this appointment
      const { data: existingReview } = await supabase
        .from('doctor_reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('appointment_id', appointmentId)
        .single()

      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this appointment' },
          { status: 400 }
        )
      }
    }

    // Create review
    const { data, error } = await supabase
      .from('doctor_reviews')
      .insert([{
        doctor_id: doctorId,
        user_id: user.id,
        appointment_id: appointmentId || null,
        rating,
        comment: comment || null
      }])
      .select(`
        id,
        rating,
        comment,
        created_at,
        users (
          id,
          name,
          full_name
        )
      `)
      .single()

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You have already reviewed this appointment' },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      review: data,
      message: 'Review submitted successfully'
    })

  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Failed to submit review', details: error.message },
      { status: 500 }
    )
  }
}
