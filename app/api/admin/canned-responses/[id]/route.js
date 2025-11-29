import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * PUT /api/admin/canned-responses/[id]
 * Update a canned response
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, message, category, shortcut } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Response ID is required' },
        { status: 400 }
      )
    }

    if (!title || !message) {
      return NextResponse.json(
        { error: 'title and message are required' },
        { status: 400 }
      )
    }

    const updateData = {
      title,
      message,
      category: category || 'other',
      shortcut: shortcut || null
    }

    const { data, error } = await supabaseAdmin
      .from('canned_responses')
      .update(updateData)
      .eq('id', id)
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
      console.error('Error updating canned response:', error)
      return NextResponse.json(
        { error: 'Failed to update canned response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      response: data,
      message: 'Canned response updated successfully'
    })

  } catch (error) {
    console.error('Error in PUT /api/admin/canned-responses/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/canned-responses/[id]
 * Delete a canned response
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Response ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('canned_responses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting canned response:', error)
      return NextResponse.json(
        { error: 'Failed to delete canned response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Canned response deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/admin/canned-responses/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/canned-responses/[id]
 * Increment usage count
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Response ID is required' },
        { status: 400 }
      )
    }

    // Increment usage_count
    const { data, error } = await supabaseAdmin.rpc('increment_response_usage', {
      response_id: id
    })

    // If function doesn't exist, do it manually
    if (error && error.code === '42883') {
      const { data: current } = await supabaseAdmin
        .from('canned_responses')
        .select('usage_count')
        .eq('id', id)
        .single()

      const { error: updateError } = await supabaseAdmin
        .from('canned_responses')
        .update({ usage_count: (current?.usage_count || 0) + 1 })
        .eq('id', id)

      if (updateError) {
        console.error('Error incrementing usage count:', updateError)
        return NextResponse.json(
          { error: 'Failed to increment usage count' },
          { status: 500 }
        )
      }
    } else if (error) {
      console.error('Error incrementing usage count:', error)
      return NextResponse.json(
        { error: 'Failed to increment usage count' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Usage count incremented'
    })

  } catch (error) {
    console.error('Error in PATCH /api/admin/canned-responses/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
