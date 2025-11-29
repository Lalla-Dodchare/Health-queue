'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { TAG_TEMPLATES } from '@/lib/tag-templates'
import TagBadge from './TagBadge'

export default function TagSelectorModal({ userId, existingTags = [], onClose, onTagAdded }) {
  const [selectedCategory, setSelectedCategory] = useState('status')
  const [adding, setAdding] = useState(false)

  const categories = [
    { id: 'status', name: 'สถานะการนัด', icon: '📋' },
    { id: 'special_need', name: 'ความต้องการพิเศษ', icon: '⚠️' },
    { id: 'customer_type', name: 'ประเภทลูกค้า', icon: '👥' },
  ]

  const handleAddTag = async (tag) => {
    // Check if tag already exists
    if (existingTags.some(t => t.tag_name === tag.name)) {
      alert('Tag นี้มีอยู่แล้ว')
      return
    }

    setAdding(true)

    try {
      const response = await fetch('/api/admin/chat/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          tag_name: tag.name,
          tag_color: tag.color,
          tag_category: selectedCategory,
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add tag')
      }

      // Call callback with new tag (including emoji from template)
      if (onTagAdded) {
        onTagAdded({
          ...result.tag,
          emoji: tag.emoji
        })
      }

    } catch (error) {
      console.error('Error adding tag:', error)
      alert('ไม่สามารถเพิ่ม tag ได้: ' + error.message)
    } finally {
      setAdding(false)
    }
  }

  const availableTags = TAG_TEMPLATES[selectedCategory] || []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">เพิ่ม Tag</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-3 font-medium transition border-b-2 ${
                  selectedCategory === cat.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tag List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3">
            {availableTags.map((tag, index) => {
              const isExisting = existingTags.some(t => t.tag_name === tag.name)

              return (
                <button
                  key={index}
                  onClick={() => handleAddTag(tag)}
                  disabled={adding || isExisting}
                  className={`p-3 rounded-lg border-2 text-left transition ${
                    isExisting
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-red-500 hover:bg-red-50'
                  }`}
                  style={!isExisting ? {
                    borderColor: `${tag.color}40`,
                  } : {}}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tag.emoji}</span>
                    <div className="flex-1">
                      <div
                        className="font-medium"
                        style={{ color: tag.color }}
                      >
                        {tag.name}
                      </div>
                      {isExisting && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          มีอยู่แล้ว
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {availableTags.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              ไม่มี tags ในหมวดนี้
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}
