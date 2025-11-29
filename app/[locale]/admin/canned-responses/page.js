'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminSidebar from '@/components/admin/Sidebar'
import { Search, Edit, Trash2, Plus, MessageSquare, X } from 'lucide-react'

const CATEGORIES = [
  { id: 'greeting', name: 'การทักทาย', icon: '👋', color: 'bg-blue-100 text-blue-700' },
  { id: 'inquiry', name: 'การถามข้อมูล', icon: '❓', color: 'bg-purple-100 text-purple-700' },
  { id: 'confirmation', name: 'การยืนยัน', icon: '✅', color: 'bg-green-100 text-green-700' },
  { id: 'document_request', name: 'การขอเอกสาร', icon: '📄', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'general', name: 'ข้อมูลทั่วไป', icon: 'ℹ️', color: 'bg-gray-100 text-gray-700' },
  { id: 'other', name: 'อื่นๆ', icon: '📝', color: 'bg-red-100 text-red-700' },
]

export default function CannedResponsesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedResponse, setSelectedResponse] = useState(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'general',
    shortcut: ''
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

  // Fetch all canned responses
  useEffect(() => {
    if (!user) return

    const fetchResponses = async () => {
      try {
        const response = await fetch('/api/admin/canned-responses')
        const data = await response.json()

        if (response.ok) {
          setResponses(data.responses || [])
        }
      } catch (error) {
        console.error('Error fetching canned responses:', error)
      }
    }

    fetchResponses()
  }, [user])

  const openAddModal = () => {
    setModalMode('add')
    setFormData({
      title: '',
      message: '',
      category: 'general',
      shortcut: ''
    })
    setShowModal(true)
  }

  const openEditModal = (response) => {
    setModalMode('edit')
    setSelectedResponse(response)
    setFormData({
      title: response.title || '',
      message: response.message || '',
      category: response.category || 'general',
      shortcut: response.shortcut || ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedResponse(null)
    setSaving(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (modalMode === 'add') {
        const response = await fetch('/api/admin/canned-responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create response')
        }

        setResponses([...responses, result.response])
        alert('เพิ่มข้อความสำเร็จรูปสำเร็จ!')
      } else {
        const response = await fetch(`/api/admin/canned-responses/${selectedResponse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update response')
        }

        setResponses(responses.map(r => r.id === selectedResponse.id ? result.response : r))
        alert('อัปเดตข้อความสำเร็จรูปสำเร็จ!')
      }

      closeModal()
    } catch (error) {
      console.error('Error saving response:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (responseId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบข้อความนี้?')) return

    try {
      const response = await fetch(`/api/admin/canned-responses/${responseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setResponses(responses.filter(r => r.id !== responseId))
        alert('ลบข้อความสำเร็จรูปสำเร็จ')
      } else {
        throw new Error('Failed to delete response')
      }
    } catch (error) {
      console.error('Error deleting response:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    }
  }

  const filteredResponses = responses.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.shortcut?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryInfo = (categoryId) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1]
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
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <AdminSidebar user={user} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ข้อความสำเร็จรูป</h1>
            <p className="text-gray-600">จัดการข้อความตอบกลับที่ใช้บ่อยๆ</p>
          </div>

          {/* Category Filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              ทั้งหมด ({responses.length})
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white'
                    : `${cat.color} hover:opacity-80`
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name} ({responses.filter(r => r.category === cat.id).length})
              </button>
            ))}
          </div>

          {/* Search & Add */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาข้อความ..."
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
              เพิ่มข้อความ
            </button>
          </div>

          {/* Responses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResponses.map(response => {
              const category = getCategoryInfo(response.category)
              return (
                <div
                  key={response.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
                        {category.icon} {category.name}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(response)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(response.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2">{response.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{response.message}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {response.shortcut && (
                      <span className="px-2 py-1 bg-gray-100 rounded font-mono">
                        {response.shortcut}
                      </span>
                    )}
                    <span>ใช้ไป {response.usage_count || 0} ครั้ง</span>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredResponses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>ไม่พบข้อความสำเร็จรูป</p>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'เพิ่มข้อความสำเร็จรูป' : 'แก้ไขข้อความสำเร็จรูป'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อข้อความ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="เช่น สวัสดีครับ"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ข้อความ <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="พิมพ์ข้อความที่ต้องการใช้..."
                  rows={4}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shortcut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shortcut (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={formData.shortcut}
                  onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="เช่น /hello"
                />
                <p className="text-xs text-gray-500 mt-1">
                  พิมพ์ shortcut ในช่องแชทเพื่อใช้ข้อความนี้อย่างรวดเร็ว
                </p>
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
                  {saving ? 'กำลังบันทึก...' : modalMode === 'add' ? 'เพิ่มข้อความ' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
