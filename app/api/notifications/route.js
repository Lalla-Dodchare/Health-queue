import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/notifications
 * Get all notifications for current user
 */
export async function GET(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query

    if (error) throw error

    // Count unread notifications
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({
      success: true,
      notifications: data || [],
      unreadCount: unreadCount || 0
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications
 * Create a new notification (admin/system use)
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, title, message, type, relatedAppointmentId, relatedPaymentId, actionUrl } = await request.json()

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId || user.id,
        title,
        message,
        type: type || 'info',
        related_appointment_id: relatedAppointmentId,
        related_payment_id: relatedPaymentId,
        action_url: actionUrl
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      notification: data
    })

  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Failed to create notification', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications
 * Delete all read notifications for current user
 */
export async function DELETE(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
      .eq('is_read', true)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Read notifications deleted'
    })

  } catch (error) {
    console.error('Delete notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to delete notifications', details: error.message },
      { status: 500 }
    )
  }
}
