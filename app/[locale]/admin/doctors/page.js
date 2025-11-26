'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/Sidebar'
import { Search, Edit, Trash2, Plus, User, Calendar, DollarSign, Building } from 'lucide-react'

export default function AdminDoctorsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

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

  // Fetch all doctors
  useEffect(() => {
    if (!user) return

    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        setDoctors(data || [])
      } catch (error) {
        console.error('Error fetching doctors:', error)
      }
    }

    fetchDoctors()
  }, [user])

  const handleDeleteDoctor = async (doctorId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบแพทย์นี้?')) return

    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId)

      if (error) throw error

      setDoctors(doctors.filter((d) => d.id !== doctorId))
      alert('ลบแพทย์สำเร็จ')
    } catch (error) {
      console.error('Error deleting doctor:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    }
  }

  const filteredDoctors = searchQuery.trim() === ''
    ? doctors
    : doctors.filter(
        (d) =>
          d.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.name_th?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.specialty_th?.toLowerCase().includes(searchQuery.toLowerCase())
      )

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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">จัดการหมอ/ตารางหมอ</h1>
            <p className="text-gray-600">เพิ่ม แก้ไข หรือลบข้อมูลแพทย์และตารางงาน</p>
          </div>

          {/* Search & Add */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาแพทย์ (ชื่อ, ความเชี่ยวชาญ)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              <Plus className="w-5 h-5" />
              เพิ่มแพทย์
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-1">แพทย์ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-1">ว่างวันนี้</p>
              <p className="text-2xl font-bold text-gray-900">
                {doctors.filter((d) => d.available_days > 0).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-1">ความเชี่ยวชาญ</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(doctors.map((d) => d.specialization)).size}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-1">ผลการค้นหา</p>
              <p className="text-2xl font-bold text-gray-900">{filteredDoctors.length}</p>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                {/* Doctor Image */}
                <div className="flex items-center gap-4 mb-4">
                  {doctor.profile_image ? (
                    <img
                      src={doctor.profile_image}
                      alt={doctor.full_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-red-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{doctor.name_th || doctor.full_name}</h3>
                    <p className="text-sm text-gray-500">{doctor.name_en}</p>
                  </div>
                </div>

                {/* Specialty */}
                <div className="mb-4">
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {doctor.specialty_th || doctor.specialization}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="w-4 h-4" />
                    {doctor.hospital_branch || 'ไม่ระบุสาขา'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    ว่าง {doctor.available_days || 0} วัน/สัปดาห์
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    ค่าตรวจ {doctor.consultation_fee ? `${doctor.consultation_fee} บาท` : 'ไม่ระบุ'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                    <Edit className="w-4 h-4" />
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>ไม่พบแพทย์</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
