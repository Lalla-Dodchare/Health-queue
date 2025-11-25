import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for current user
 * Auth: Uses Authorization header from client
 */
export async function POST(request) {
  try {
    // Get auth token from request header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
    }

    // Create Supabase client with the user's token
    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    // Mark all unread notifications as read
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true
      })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read'
    })

  } catch (error) {
    console.error('Mark all as read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark all as read', details: error.message },
      { status: 500 }
    )
  }
}
