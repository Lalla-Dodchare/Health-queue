import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/favorites
 * Get all favorite doctors for current user
 */
export async function GET(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('favorite_doctors')
      .select(`
        id,
        created_at,
        doctors (
          id,
          full_name,
          name_th,
          name_en,
          specialization,
          specialty_th,
          specialty_en,
          education,
          experience_years,
          consultation_fee,
          average_rating,
          review_count,
          clinics (
            id,
            name,
            name_th,
            name_en
          ),
          branches (
            id,
            name,
            name_th,
            name_en
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      favorites: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites', details: error.message },
      { status: 500 }
    )
  }
}
