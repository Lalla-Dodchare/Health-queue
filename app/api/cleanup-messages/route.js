/**
 * API Endpoint for cleaning up expired admin messages
 * Call this endpoint daily via external cron service
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create admin client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Need to add this to .env.local
)

export async function POST(request) {
  try {
    // Verify secret key to prevent unauthorized access
    const { secret } = await request.json()

    if (secret !== process.env.CLEANUP_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete expired messages
    const { data, error } = await supabase
      .from('admin_messages')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select()

    if (error) throw error

    const deletedCount = data?.length || 0

    console.log(`✅ Deleted ${deletedCount} expired messages`)

    return NextResponse.json({
      success: true,
      deletedCount,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('❌ Cleanup error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Also support GET for testing
export async function GET() {
  try {
    // Count how many messages will be deleted
    const { count, error } = await supabase
      .from('admin_messages')
      .select('*', { count: 'exact', head: true })
      .lt('expires_at', new Date().toISOString())

    if (error) throw error

    return NextResponse.json({
      expiredCount: count || 0,
      message: 'Use POST with secret to delete',
    })

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
