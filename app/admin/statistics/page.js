'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminSidebar from '@/components/admin/Sidebar'
import { TrendingUp, Users, Eye, Clock, Calendar } from 'lucide-react'

export default function AdminStatisticsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()

      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/login')
        return
      }

      setUser(currentUser)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  // Mock statistics data
  const stats = {
    todayVisits: 245,
    weekVisits: 1850,
    monthVisits: 7420,
    averageTime: '5:32',
    popularPages: [
      { page: 'หน้าค้นหาแพทย์', visits: 3200 },
      { page: 'จองนัดหมาย', visits: 2800 },
      { page: 'ประวัติการรักษา', visits: 1950 },
    ],
    peakHours: [
      { hour: '09:00-10:00', visits: 450 },
      { hour: '14:00-15:00', visits: 380 },
      { hour: '16:00-17:00', visits: 320 },
    ],
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0">
        <AdminSidebar user={user} />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">สถิติการเข้าถึง</h1>
            <p className="text-gray-600">ดูสถิติการใช้งานและพฤติกรรมผู้ใช้</p>
          </div>

          {/* Visit Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">วันนี้</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayVisits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">สัปดาห์นี้</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.weekVisits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">เดือนนี้</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.monthVisits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">เวลาเฉลี่ย</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageTime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Popular Pages */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                หน้ายอดนิยม
              </h3>
              <div className="space-y-3">
                {stats.popularPages.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{item.page}</span>
                    </div>
                    <span className="text-gray-900 font-semibold">{item.visits}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Hours */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                ช่วงเวลาที่คนเยอะ
              </h3>
              <div className="space-y-3">
                {stats.peakHours.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{item.hour}</span>
                    </div>
                    <span className="text-gray-900 font-semibold">{item.visits}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">กราฟการเข้าถึง 30 วันล่าสุด</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">กราฟจะแสดงที่นี่</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
