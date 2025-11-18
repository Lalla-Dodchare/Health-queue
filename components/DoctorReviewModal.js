'use client'

/**
 * Doctor Review Modal Component
 * Allows users to rate and review doctors after appointments
 */

import { useState } from 'react'
import { X, Star, Send } from 'lucide-react'

export default function DoctorReviewModal({
  doctor,
  appointmentId,
  language = 'th',
  onClose,
  onSuccess
}) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert(language === 'th' ? 'กรุณาให้คะแนน' : 'Please provide a rating')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/doctors/${doctor.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
          appointmentId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      alert(language === 'th' ? 'ขอบคุณสำหรับรีวิว!' : 'Thank you for your review!')
      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      console.error('Submit review error:', error)
      alert(error.message || (language === 'th' ? 'เกิดข้อผิดพลาด' : 'An error occurred'))
    } finally {
      setLoading(false)
    }
  }

  const doctorName = language === 'th'
    ? doctor.name_th || doctor.full_name
    : doctor.name_en || doctor.full_name

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {language === 'th' ? 'ให้คะแนนแพทย์' : 'Rate Doctor'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">
            {language === 'th' ? 'แพทย์' : 'Doctor'}
          </p>
          <p className="font-semibold text-gray-900">{doctorName}</p>
          <p className="text-sm text-gray-600 mt-1">
            {language === 'th'
              ? doctor.specialization_th || doctor.specialization
              : doctor.specialization_en || doctor.specialization}
          </p>
        </div>

        {/* Star Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {language === 'th' ? 'ให้คะแนน' : 'Your Rating'} *
          </label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {language === 'th'
                ? `คุณให้ ${rating} ดาว`
                : `You rated ${rating} star${rating > 1 ? 's' : ''}`}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'th' ? 'ความคิดเห็น (ถ้ามี)' : 'Comment (Optional)'}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              language === 'th'
                ? 'แบ่งปันประสบการณ์ของคุณ...'
                : 'Share your experience...'
            }
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 {language === 'th' ? 'ตัวอักษร' : 'characters'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            {language === 'th' ? 'ยกเลิก' : 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {language === 'th' ? 'กำลังส่ง...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {language === 'th' ? 'ส่งรีวิว' : 'Submit Review'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
