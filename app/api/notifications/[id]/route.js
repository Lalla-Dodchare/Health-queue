import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * PATCH /api/notifications/[id]
 * Mark notification as read
 * Auth: Uses Authorization header from client
 */
export async function PATCH(request, { params }) {
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

    const { id } = params

    // Verify notification belongs to user
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // Mark as read (if not already read)
    if (!notification.is_read) {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true
        })
        .eq('id', id)

      if (updateError) throw updateError
    }

    return NextResponse.json({
      success: true,
      notification: { ...notification, is_read: true }
    })

  } catch (error) {
    console.error('Mark notification as read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a single notification
 * Auth: Uses Authorization header from client
 */
export async function DELETE(request, { params }) {
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

    const { id } = params

    // Verify notification belongs to user and delete
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Notification deleted'
    })

  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification', details: error.message },
      { status: 500 }
    )
  }
}
