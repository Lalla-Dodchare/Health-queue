'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminSidebar from '@/components/admin/Sidebar'
import { Star, Plus, Edit, Trash2, Pin } from 'lucide-react'

export default function AdminHotServicePage() {
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

  // Mock data for featured services
  const [featuredServices] = useState([
    {
      id: 1,
      title: 'ตรวจสุขภาพประจำปี',
      description: 'แพ็กเกจตรวจสุขภาพครบวงจร พร้อมคำปรึกษาจากแพทย์',
      isPinned: true,
      views: 1250,
    },
    {
      id: 2,
      title: 'วัคซีนป้องกันโรค',
      description: 'บริการฉีดวัคซีนครบทุกชนิด',
      isPinned: true,
      views: 980,
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ปักหมุดแนะนำ</h1>
            <p className="text-gray-600">จัดการบริการแนะนำและ Hot Service</p>
          </div>

          <div className="mb-6">
            <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              <Plus className="w-5 h-5" />
              เพิ่มบริการแนะนำ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    {service.isPinned && (
                      <Pin className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{service.views} views</span>
                </div>

                <h3 className="font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                    <Edit className="w-4 h-4" />
                    แก้ไข
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
