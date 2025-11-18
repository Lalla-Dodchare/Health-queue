'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminSidebar from '@/components/admin/Sidebar'
import { Bell, Plus, Edit, Trash2, Send, Clock } from 'lucide-react'

export default function AdminNotificationsPage() {
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

  // Mock notification templates
  const [notifications] = useState([
    {
      id: 1,
      title: 'แจ้งเตือนนัดหมาย',
      message: 'คุณมีนัดหมายกับแพทย์ในวันพรุ่งนี้',
      type: 'appointment',
      isActive: true,
      triggerTime: '1 วันก่อนนัดหมาย',
    },
    {
      id: 2,
      title: 'แจ้งผลตรวจเสร็จ',
      message: 'ผลตรวจของคุณพร้อมแล้ว',
      type: 'result',
      isActive: true,
      triggerTime: 'ทันทีที่มีผล',
    },
  ])

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ระบบแจ้งเตือนอัตโนมัติ</h1>
            <p className="text-gray-600">จัดการการแจ้งเตือนและข้อความอัตโนมัติ</p>
          </div>

          <div className="mb-6 flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              <Plus className="w-5 h-5" />
              สร้างการแจ้งเตือนใหม่
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Send className="w-5 h-5" />
              ส่งข้อความทันที
            </button>
          </div>

          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-gray-900">{notif.title}</h3>
                      {notif.isActive ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          ใช้งาน
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          ปิด
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-2">{notif.message}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      ส่งเมื่อ: {notif.triggerTime}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">ยังไม่มีการแจ้งเตือน</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
