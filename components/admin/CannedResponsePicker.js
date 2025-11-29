'use client'

import { useState, useEffect } from 'react'
import { X, Search, MessageSquare } from 'lucide-react'

const CATEGORIES = [
  { id: 'all', name: 'ทั้งหมด', icon: '📝' },
  { id: 'greeting', name: 'การทักทาย', icon: '👋' },
  { id: 'inquiry', name: 'การถามข้อมูล', icon: '❓' },
  { id: 'confirmation', name: 'การยืนยัน', icon: '✅' },
  { id: 'document_request', name: 'การขอเอกสาร', icon: '📄' },
  { id: 'general', name: 'ข้อมูลทั่วไป', icon: 'ℹ️' },
  { id: 'other', name: 'อื่นๆ', icon: '📋' },
]

export default function CannedResponsePicker({ onSelect, onClose }) {
  const [responses, setResponses] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await fetch('/api/admin/canned-responses')
        const data = await response.json()

        if (response.ok) {
          setResponses(data.responses || [])
        }
      } catch (error) {
        console.error('Error fetching canned responses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResponses()
  }, [])

  const handleSelectResponse = async (response) => {
    // Increment usage count
    try {
      await fetch(`/api/admin/canned-responses/${response.id}`, {
        method: 'PATCH'
      })
    } catch (error) {
      console.error('Error incrementing usage count:', error)
    }

    // Call parent callback with the message
    onSelect(response.message)
  }

  const filteredResponses = responses.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.shortcut?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (categoryId) => {
    const cat = CATEGORIES.find(c => c.id === categoryId)
    return cat ? cat.icon : '📝'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">เลือกข้อความสำเร็จรูป</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาข้อความหรือ shortcut..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200 px-6 overflow-x-auto">
          <div className="flex gap-2 py-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Responses List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">กำลังโหลด...</div>
          ) : filteredResponses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredResponses.map(response => (
                <button
                  key={response.id}
                  onClick={() => handleSelectResponse(response)}
                  className="p-4 rounded-lg border-2 border-gray-200 text-left transition hover:border-red-500 hover:bg-red-50 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <span>{getCategoryIcon(response.category)}</span>
                      {response.title}
                    </h3>
                    {response.shortcut && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded font-mono text-gray-600 group-hover:bg-red-100 group-hover:text-red-700">
                        {response.shortcut}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{response.message}</p>
                  <div className="mt-2 text-xs text-gray-400">
                    ใช้ไป {response.usage_count || 0} ครั้ง
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>ไม่พบข้อความสำเร็จรูป</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
          <p>💡 Tip: พิมพ์ shortcut ในช่องแชทเพื่อใช้ข้อความอย่างรวดเร็ว</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}
