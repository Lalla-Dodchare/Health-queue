import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request) {
  try {
    // Get session from cookies
    const cookieStore = cookies()
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: {
          getItem: (key) => cookieStore.get(key)?.value,
          setItem: () => {},
          removeItem: () => {},
        },
      },
    })

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = session.user

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
    const senderType = adminData ? 'admin' : 'user'

    // Insert message into database
    const { data, error } = await supabaseAdmin
      .from('admin_messages')
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
      return NextResponse.json({ error: 'Failed to send message', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('Error in send message API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
