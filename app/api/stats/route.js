/**
 * API Endpoint for getting system statistics
 * Returns real counts of doctors, users, and admins
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
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

    // Get today's appointments count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { count: todayAppointments, error: appointmentError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('appointment_date', today.toISOString())
      .lt('appointment_date', tomorrow.toISOString())

    // Don't throw error if appointments table doesn't exist yet
    const appointmentCount = appointmentError ? 0 : (todayAppointments || 0)

    // Get this month's appointments
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    const { count: monthlyAppointments, error: monthlyError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('appointment_date', startOfMonth.toISOString())
      .lte('appointment_date', endOfMonth.toISOString())

    const monthlyCount = monthlyError ? 0 : (monthlyAppointments || 0)

    return NextResponse.json({
      success: true,
      data: {
        doctors: doctorCount || 0,
        users: userCount || 0,
        admins: adminCount || 0,
        appointmentsToday: appointmentCount,
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
