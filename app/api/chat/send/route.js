import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify token and get user
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    const { message, recipient_id } = await request.json()

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user is admin using service role
    const { data: adminData } = await supabaseAdmin
      .from('admins')
      .select('user_id')
      .eq('user_id', currentUser.id)
      .maybeSingle()

    // Determine sender type based on user role
    const senderRole = adminData ? 'admin' : 'user'

    // Insert message into database
    const { data, error } = await supabaseAdmin
      .from('admin_messages')
      .insert({
        user_id: senderRole === 'user' ? currentUser.id : recipient_id,
        sender_id: currentUser.id,
        sender_role: senderRole,
        recipient_id: senderRole === 'admin' ? recipient_id : null,
        message: message.trim(),
        message_type: 'text',
      })
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return NextResponse.json({ error: 'Failed to send message', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('Error in send message API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
