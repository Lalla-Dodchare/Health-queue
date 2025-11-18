'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminSidebar from '@/components/admin/Sidebar'
import { BarChart3, Download, Calendar, TrendingUp } from 'lucide-react'

export default function AdminReportsPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">รายงานการใช้งาน</h1>
            <p className="text-gray-600">ดูรายงานและสถิติการใช้งานระบบ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">รายงานรายวัน</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">ดูข้อมูลการใช้งานรายวัน</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                ดาวน์โหลด
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">รายงานรายเดือน</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">ดูข้อมูลการใช้งานรายเดือน</p>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                ดาวน์โหลด
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900">รายงานรายปี</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">ดูข้อมูลการใช้งานรายปี</p>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                ดาวน์โหลด
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600" />
                <h3 className="font-semibold text-gray-900">รายงานกำหนดเอง</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">สร้างรายงานตามช่วงเวลาที่ต้องการ</p>
              <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                กำหนดเอง
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
