import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, recipient_id } = await request.json()

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    // Determine sender type based on user role
    const senderType = currentUser.role === 'admin' ? 'admin' : 'user'

    // Insert message into database
    const { data, error } = await supabase
      .from('admin_chats')
      .insert({
        user_id: senderType === 'user' ? currentUser.id : recipient_id,
        admin_id: senderType === 'admin' ? currentUser.id : null,
        message: message.trim(),
        sender_type: senderType,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('Error in send message API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
