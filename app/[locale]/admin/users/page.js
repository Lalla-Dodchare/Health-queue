'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/Sidebar'
import { Search, Edit, Trash2, Plus, User, Mail, Phone, Calendar, X } from 'lucide-react'

export default function AdminUsersPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    id_type: 'id_card', // 'id_card' or 'passport'
    id_card: '',
    passport_id: '',
    allergies: ''
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

  // Fetch all users
  useEffect(() => {
    if (!user) return

    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        setUsers(data || [])
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [user])

  // Open modal for adding new user
  const openAddModal = () => {
    setModalMode('add')
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      gender: '',
      date_of_birth: '',
      id_type: 'id_card',
      id_card: '',
      passport_id: '',
      allergies: ''
    })
    setShowModal(true)
  }

  // Open modal for editing user
  const openEditModal = (userData) => {
    setModalMode('edit')
    setSelectedUser(userData)
    // Determine which ID type is being used
    const idType = userData.passport_number ? 'passport' : 'id_card'
    setFormData({
      full_name: userData.full_name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      gender: userData.gender || '',
      date_of_birth: userData.date_of_birth || '',
      id_type: idType,
      id_card: userData.id_card || '',
      passport_id: userData.passport_number || '',
      allergies: userData.allergies || ''
    })
    setShowModal(true)
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
    setSelectedUser(null)
    setSaving(false)
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (modalMode === 'add') {
        // Create new user via API
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create user')
        }

        alert('เพิ่มผู้ใช้สำเร็จ!')

        // Reload users
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error) {
          setUsers(data || [])
        }
      } else {
        // Update existing user via API
        const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update user')
        }

        alert('อัปเดตข้อมูลผู้ใช้สำเร็จ!')

        // Reload users
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error) {
          setUsers(data || [])
        }
      }

      closeModal()
    } catch (error) {
      console.error('Error saving user:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) return

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      setUsers(users.filter((u) => u.id !== userId))
      alert('ลบผู้ใช้สำเร็จ')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery)
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">จัดการผู้ใช้งาน</h1>
            <p className="text-gray-600">เพิ่ม แก้ไข หรือลบข้อมูลผู้ใช้งาน</p>
          </div>

          {/* Search & Add */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาผู้ใช้งาน (ชื่อ, อีเมล, เบอร์โทร)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Plus className="w-5 h-5" />
              เพิ่มผู้ใช้
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-1">ผู้ใช้ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-1">ผู้ใช้ใหม่เดือนนี้</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => {
                  const created = new Date(u.created_at)
                  const now = new Date()
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-1">ผลการค้นหา</p>
              <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผู้ใช้
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ติดต่อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เลขประจำตัว
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่สมัคร
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {u.full_name || 'ไม่ระบุชื่อ'}
                          </div>
                          <div className="text-sm text-gray-500">{u.gender || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {u.email || '-'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {u.phone || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {u.id_card ? (
                          <span className="flex items-center gap-1">
                            🇹🇭 {u.id_card}
                          </span>
                        ) : u.passport_number ? (
                          <span className="flex items-center gap-1">
                            🌏 {u.passport_number}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(u.created_at).toLocaleDateString('th-TH')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(u)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>ไม่พบผู้ใช้งาน</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'เพิ่มผู้ใช้ใหม่' : 'แก้ไขข้อมูลผู้ใช้'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="กรุณากรอกชื่อ-นามสกุล"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="example@email.com"
                  disabled={modalMode === 'edit'}
                />
                {modalMode === 'edit' && (
                  <p className="text-xs text-gray-500 mt-1">ไม่สามารถแก้ไขอีเมลได้</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0812345678"
                />
              </div>

              {/* Gender & Date of Birth */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เพศ
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">เลือกเพศ</option>
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันเกิด
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* ID Type Selection & Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทบัตรประจำตัว {modalMode === 'add' && <span className="text-red-500">*</span>}
                  {modalMode === 'edit' && <span className="text-xs text-gray-500">(เว้นว่างหากไม่ต้องการแก้ไข)</span>}
                </label>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.id_type === 'id_card'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="id_type"
                      value="id_card"
                      checked={formData.id_type === 'id_card'}
                      onChange={(e) => setFormData({
                        ...formData,
                        id_type: e.target.value,
                        passport_id: '' // Clear passport when switching
                      })}
                      className="sr-only"
                    />
                    <span className="font-medium">🇹🇭 บัตรประชาชน</span>
                  </label>

                  <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.id_type === 'passport'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="id_type"
                      value="passport"
                      checked={formData.id_type === 'passport'}
                      onChange={(e) => setFormData({
                        ...formData,
                        id_type: e.target.value,
                        id_card: '' // Clear ID card when switching
                      })}
                      className="sr-only"
                    />
                    <span className="font-medium">🌏 พาสปอร์ต</span>
                  </label>
                </div>

                {formData.id_type === 'id_card' ? (
                  <input
                    type="text"
                    required={modalMode === 'add'}
                    value={formData.id_card}
                    onChange={(e) => setFormData({ ...formData, id_card: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={modalMode === 'add'
                      ? "เลขบัตรประชาชน 13 หลัก (เช่น 1234567890123)"
                      : "เลขบัตรประชาชน (เว้นว่างหากไม่ต้องการแก้ไข)"}
                    maxLength={13}
                  />
                ) : (
                  <input
                    type="text"
                    required={modalMode === 'add'}
                    value={formData.passport_id}
                    onChange={(e) => setFormData({ ...formData, passport_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={modalMode === 'add'
                      ? "เลขพาสปอร์ต (เช่น AB1234567)"
                      : "เลขพาสปอร์ต (เว้นว่างหากไม่ต้องการแก้ไข)"}
                  />
                )}
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประวัติการแพ้ยา/อาหาร
                </label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="ระบุประวัติการแพ้ (ถ้ามี)"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {saving ? 'กำลังบันทึก...' : modalMode === 'add' ? 'เพิ่มผู้ใช้' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
