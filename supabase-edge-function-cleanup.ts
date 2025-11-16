// Supabase Edge Function: cleanup-messages
// Copy code นี้ไป Paste ใน Supabase Dashboard → Edge Functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    // Get Supabase URL and Service Role Key from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🗑️ Starting cleanup of expired messages...')

    // Delete expired messages (older than 60 days)
    const { data, error } = await supabase
      .from('admin_messages')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select()

    if (error) {
      console.error('❌ Delete error:', error)
      throw error
    }

    const deletedCount = data?.length || 0

    console.log(`✅ Successfully deleted ${deletedCount} expired messages`)

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount,
        timestamp: new Date().toISOString(),
        message: `Deleted ${deletedCount} expired messages`
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('❌ Cleanup failed:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
