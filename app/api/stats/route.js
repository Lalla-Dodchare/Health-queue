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

    // Get today's appointments count (approved appointments where approved date = today)
    // Use Thailand timezone (UTC+7) to get the correct local date
    const today = new Date()
    const todayStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }) // en-CA gives YYYY-MM-DD format

    // Query all approved appointments
    const { data: approvedAppointments, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, status, approved_option, primary_date, secondary_date')
      .eq('status', 'approved')

    // Filter appointments where the approved date matches today
    let appointmentCount = 0
    if (!appointmentError && approvedAppointments) {
      appointmentCount = approvedAppointments.filter(apt => {
        if (apt.approved_option === 'primary') {
          return apt.primary_date === todayStr
        } else if (apt.approved_option === 'secondary') {
          return apt.secondary_date === todayStr
        }
        return false
      }).length
    }

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
