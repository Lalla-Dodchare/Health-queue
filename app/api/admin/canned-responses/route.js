import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/admin/canned-responses
 * Fetch all canned responses (optionally filter by category)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabaseAdmin
      .from('canned_responses')
      .select('*')
      .order('category', { ascending: true })
      .order('usage_count', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching canned responses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch canned responses' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      responses: data || []
    })

  } catch (error) {
    console.error('Error in GET /api/admin/canned-responses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/canned-responses
 * Create a new canned response
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { title, message, category, shortcut } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: 'title and message are required' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user } } = await supabaseAdmin.auth.getUser()

    const { data, error } = await supabaseAdmin
      .from('canned_responses')
      .insert({
        title,
        message,
        category: category || 'other',
        shortcut: shortcut || null,
        created_by: user?.id
      })
      .select()
      .single()

    if (error) {
      // Check for unique constraint violation on shortcut
      if (error.code === '23505' && error.message.includes('shortcut')) {
        return NextResponse.json(
          { error: 'This shortcut is already in use' },
          { status: 400 }
        )
      }
      console.error('Error creating canned response:', error)
      return NextResponse.json(
        { error: 'Failed to create canned response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      response: data,
      message: 'Canned response created successfully'
    })

  } catch (error) {
    console.error('Error in POST /api/admin/canned-responses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
