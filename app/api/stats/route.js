/**
 * API Endpoint for getting system statistics
 * Returns real counts of doctors, users, and admins
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Disable caching for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Create client with service role key for admin access (inside function to avoid caching)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Count doctors
    const { count: doctorCount, error: doctorError } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })

    if (doctorError) throw doctorError

    // Count regular users (profiles)
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (userError) throw userError

    // Count admins
    const { count: adminCount, error: adminError } = await supabase
      .from('admins')
      .select('*', { count: 'exact', head: true })

    if (adminError) throw adminError

    // Get today's appointments count (appointments CREATED today, regardless of appointment date)
    // Use Thailand timezone (UTC+7) to get the correct local date
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    endOfToday.setHours(23, 59, 59, 999)

    // Count appointments created today (based on created_at timestamp)
    const { count: appointmentCount, error: appointmentError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfToday.toISOString())
      .lte('created_at', endOfToday.toISOString())

    // Get this month's appointments (based on created_at)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    const { count: monthlyAppointments, error: monthlyError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())

    const monthlyCount = monthlyError ? 0 : (monthlyAppointments || 0)

    return NextResponse.json({
      success: true,
      data: {
        doctors: doctorCount || 0,
        users: userCount || 0,
        admins: adminCount || 0,
        appointmentsToday: appointmentCount || 0,
        appointmentsThisMonth: monthlyCount,
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('❌ Stats API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
