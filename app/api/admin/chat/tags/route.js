import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/admin/chat/tags?user_id=xxx
 * Get all tags for a specific user
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('chat_tags')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tags:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tags' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tags: data || []
    })

  } catch (error) {
    console.error('Error in GET /api/admin/chat/tags:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/chat/tags
 * Add a new tag to a user
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { user_id, tag_name, tag_color, tag_category } = body

    // Validate required fields
    if (!user_id || !tag_name) {
      return NextResponse.json(
        { error: 'user_id and tag_name are required' },
        { status: 400 }
      )
    }

    // Get current admin user
    const { data: { user } } = await supabaseAdmin.auth.getUser()

    // Insert tag
    const { data, error } = await supabaseAdmin
      .from('chat_tags')
      .insert({
        user_id,
        tag_name,
        tag_color: tag_color || '#6b7280',
        tag_category: tag_category || 'other',
        created_by: user?.id
      })
      .select()
      .single()

    if (error) {
      // Check if it's a duplicate tag error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Tag already exists for this user' },
          { status: 400 }
        )
      }

      console.error('Error creating tag:', error)
      return NextResponse.json(
        { error: 'Failed to create tag' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tag: data,
      message: 'Tag created successfully'
    })

  } catch (error) {
    console.error('Error in POST /api/admin/chat/tags:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
