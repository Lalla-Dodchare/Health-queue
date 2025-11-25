'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminSidebar from '@/components/admin/Sidebar'
import { Users, Calendar, Stethoscope, Settings, BarChart as BarChartIcon } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    appointmentsToday: 0,
    appointmentsThisMonth: 0,
  })
  const [chartData, setChartData] = useState({
    daily: [],
    branches: [],
    departments: [],
    successRate: { rate: 0, approved: 0, total: 0 },
    cancellationRate: { rate: 0, cancelled: 0, total: 0 }
  })

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        router.push('/login')
        return
      }

      if (currentUser.role !== 'admin') {
        router.push('/login')
        return
      }

      setUser(currentUser)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const result = await response.json()

        if (result.success) {
          setStats({
            users: result.data.users,
            doctors: result.data.doctors,
            appointmentsToday: result.data.appointmentsToday,
            appointmentsThisMonth: result.data.appointmentsThisMonth,
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  // Fetch chart data from API
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/chart-data')
        const result = await response.json()

        if (result.success) {
          setChartData(result.data)
        }
      } catch (error) {
        console.error('Error fetching chart data:', error)
      }
    }

    if (user) {
      fetchChartData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <AdminSidebar user={user} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">ผู้ใช้งานทั้งหมด</h3>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">แพทย์ทั้งหมด</h3>
              <Stethoscope className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.doctors}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">นัดหมายวันนี้</h3>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.appointmentsToday}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">สถิติเดือนนี้</h3>
              <BarChartIcon className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.appointmentsThisMonth}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          {/* Daily Appointments Bar Chart with Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Bar Chart - Takes 2 columns */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">จำนวนนัดหมายตามวัน (30 วันล่าสุด)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.daily} barSize={40} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="จำนวนนัดหมาย" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution Pie Chart - Takes 1 column */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">สถานะการนัดหมาย</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'จอง: ' + chartData.successRate.rate + '%', value: chartData.successRate.approved },
                      { name: 'หยกเลิก: ' + chartData.cancellationRate.rate + '%', value: chartData.cancellationRate.cancelled }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid for Pie Chart and Department Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Branch Pie Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">จำนวนนัดหมายตามสาขา</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.branches}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.branches.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981'][index % 2]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Department Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">จำนวนนัดหมายตามแผนก (Top 10)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.departments} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" name="จำนวนนัดหมาย" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  )
}
