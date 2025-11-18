import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

/**
 * POST /api/favorites/[doctorId]
 * Toggle favorite doctor (add or remove)
 */
export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { doctorId } = params

    // Check if already favorited
    const { data: existing, error: fetchError } = await supabase
      .from('favorite_doctors')
      .select('id')
      .eq('user_id', user.id)
      .eq('doctor_id', doctorId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected
      throw fetchError
    }

    if (existing) {
      // Remove from favorites
      const { error: deleteError } = await supabase
        .from('favorite_doctors')
        .delete()
        .eq('id', existing.id)

      if (deleteError) throw deleteError

      return NextResponse.json({
        success: true,
        action: 'removed',
        is_favorite: false,
        message: 'Doctor removed from favorites'
      })
    } else {
      // Add to favorites
      const { data, error: insertError } = await supabase
        .from('favorite_doctors')
        .insert([{
          user_id: user.id,
          doctor_id: doctorId
        }])
        .select()
        .single()

      if (insertError) throw insertError

      return NextResponse.json({
        success: true,
        action: 'added',
        is_favorite: true,
        message: 'Doctor added to favorites',
        favorite: data
      })
    }

  } catch (error) {
    console.error('Toggle favorite error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle favorite', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/favorites/[doctorId]
 * Check if doctor is favorited by current user
 */
export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { doctorId } = params

    const { data, error } = await supabase
      .from('favorite_doctors')
      .select('id')
      .eq('user_id', user.id)
      .eq('doctor_id', doctorId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      success: true,
      is_favorite: !!data
    })

  } catch (error) {
    console.error('Check favorite error:', error)
    return NextResponse.json(
      { error: 'Failed to check favorite status', details: error.message },
      { status: 500 }
    )
  }
}
