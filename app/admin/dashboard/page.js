'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/auth'
import { Users, Calendar, Stethoscope, Settings, LogOut, BarChart } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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

  const handleLogout = async () => {
    await logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-red-600">Admin</span> Panel
              </h1>
              <p className="text-sm text-gray-600">
                สวัสดี, {user?.name || 'ผู้ดูแลระบบ'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">ผู้ใช้งานทั้งหมด</h3>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">แพทย์ทั้งหมด</h3>
              <Stethoscope className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">60</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">นัดหมายวันนี้</h3>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">สถิติเดือนนี้</h3>
              <BarChart className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">จัดการผู้ใช้งาน</h3>
            </div>
            <p className="text-sm text-gray-600">
              เพิ่ม แก้ไข หรือลบข้อมูลผู้ใช้งาน
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Stethoscope className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">จัดการแพทย์</h3>
            </div>
            <p className="text-sm text-gray-600">
              เพิ่ม แก้ไข หรือลบข้อมูลแพทย์
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">จัดการนัดหมาย</h3>
            </div>
            <p className="text-sm text-gray-600">
              ดูและจัดการนัดหมายทั้งหมด
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">จัดการแผนก/สาขา</h3>
            </div>
            <p className="text-sm text-gray-600">
              จัดการแผนกและสาขาโรงพยาบาล
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <BarChart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">รายงานและสถิติ</h3>
            </div>
            <p className="text-sm text-gray-600">
              ดูรายงานและสถิติการใช้งาน
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Settings className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900">ตั้งค่าระบบ</h3>
            </div>
            <p className="text-sm text-gray-600">
              ตั้งค่าและกำหนดสิทธิ์การใช้งาน
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
