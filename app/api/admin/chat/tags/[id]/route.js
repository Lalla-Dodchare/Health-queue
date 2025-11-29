import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * DELETE /api/admin/chat/tags/[id]
 * Delete a specific tag
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('chat_tags')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting tag:', error)
      return NextResponse.json(
        { error: 'Failed to delete tag' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/admin/chat/tags/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
