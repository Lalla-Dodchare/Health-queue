'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/auth'
import { Calendar, Clock, FileText, User, LogOut } from 'lucide-react'

export default function UserDashboard() {
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

      if (currentUser.role !== 'user') {
        // ถ้า role ไม่ใช่ user ให้ redirect ไปหน้าที่ถูกต้อง
        router.push(`/${currentUser.role === 'admin' ? 'admin' : 'doctor'}/dashboard`)
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Health Queue
              </h1>
              <p className="text-sm text-gray-600">
                สวัสดี, {user.name}
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
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">ยินดีต้อนรับสู่ระบบจองคิวออนไลน์</h2>
          <p className="text-blue-100">เลือกบริการด้านล่างเพื่อเริ่มต้นใช้งาน</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">จองนัดหมาย</h3>
            <p className="text-sm text-gray-600">จองคิวพบแพทย์ล่วงหน้า</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">ประวัตินัดหมาย</h3>
            <p className="text-sm text-gray-600">ดูประวัตินัดหมายทั้งหมด</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">เอกสารการแพทย์</h3>
            <p className="text-sm text-gray-600">อัปโหลดและจัดการเอกสาร</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">ข้อมูลส่วนตัว</h3>
            <p className="text-sm text-gray-600">แก้ไขโปรไฟล์ของคุณ</p>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            นัดหมายที่กำลังจะมาถึง
          </h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-center py-8">
              ไม่มีนัดหมายในขณะนี้
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
