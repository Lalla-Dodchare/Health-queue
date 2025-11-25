import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    // 1. Get appointments by day (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('created_at, branch_id, department_id, status')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at')

    if (appointmentsError) throw appointmentsError

    // Calculate success and cancellation rates
    const totalAppointments = appointments.length
    const approvedAppointments = appointments.filter(apt => apt.status === 'approved').length
    const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length
    const rejectedAppointments = appointments.filter(apt => apt.status === 'rejected').length
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length

    const successRate = totalAppointments > 0 ? ((approvedAppointments / totalAppointments) * 100).toFixed(1) : 0
    const cancellationRate = totalAppointments > 0 ? (((cancelledAppointments + rejectedAppointments) / totalAppointments) * 100).toFixed(1) : 0

    // Group by day
    const appointmentsByDay = {}
    appointments.forEach(apt => {
      const date = new Date(apt.created_at).toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit'
      })
      appointmentsByDay[date] = (appointmentsByDay[date] || 0) + 1
    })

    const dailyData = Object.entries(appointmentsByDay).map(([date, count]) => ({
      date,
      count
    }))

    // 2. Get appointments by branch
    const { data: branches, error: branchesError } = await supabase
      .from('branches')
      .select('id, name')

    if (branchesError) throw branchesError

    const branchData = branches.map(branch => {
      const count = appointments.filter(apt => apt.branch_id === branch.id).length
      return {
        name: branch.name,
        value: count
      }
    })

    // 3. Get appointments by department
    const { data: departments, error: departmentsError } = await supabase
      .from('departments')
      .select('id, name')

    if (departmentsError) throw departmentsError

    const departmentData = departments.map(dept => {
      const count = appointments.filter(apt => apt.department_id === dept.id).length
      return {
        name: dept.name,
        count
      }
    })
    .filter(dept => dept.count > 0) // Only show departments with appointments
    .sort((a, b) => b.count - a.count) // Sort by count descending
    .slice(0, 10) // Limit to top 10 departments

    return NextResponse.json({
      success: true,
      data: {
        daily: dailyData,
        branches: branchData,
        departments: departmentData,
        successRate: {
          rate: parseFloat(successRate),
          approved: approvedAppointments,
          total: totalAppointments
        },
        cancellationRate: {
          rate: parseFloat(cancellationRate),
          cancelled: cancelledAppointments + rejectedAppointments,
          total: totalAppointments
        }
      }
    })
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
