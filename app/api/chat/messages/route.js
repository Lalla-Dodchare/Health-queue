import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request) {
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

    const user = session.user

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    // Use service role client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user is admin using service role
    const { data: adminData } = await supabaseAdmin
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const currentUser = {
      id: user.id,
      email: user.email,
      role: adminData ? 'admin' : 'user',
    }

    let query = supabaseAdmin
      .from('admin_messages')
      .select('*')
      .order('created_at', { ascending: true })

    // If user is not admin, only get their own messages
    if (currentUser.role !== 'admin') {
      query = query.eq('user_id', currentUser.id)
    } else if (userId) {
      // Admin viewing specific user's conversation
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: data || [] }, { status: 200 })
  } catch (error) {
    console.error('Error in messages API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
