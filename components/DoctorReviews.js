'use client'

/**
 * Doctor Reviews Display Component
 * Shows doctor reviews with statistics and rating breakdown
 */

import { useState, useEffect } from 'react'
import { Star, User, ThumbsUp } from 'lucide-react'

export default function DoctorReviews({ doctorId, language = 'th' }) {
  const [reviews, setReviews] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (doctorId) {
      fetchReviews()
    }
  }, [doctorId])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/doctors/${doctorId}/reviews?limit=10`)
      const data = await res.json()

      if (data.success) {
        setReviews(data.reviews || [])
        setStatistics(data.statistics)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating, size = 'w-5 h-5') => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getRatingPercentage = (count) => {
    if (!statistics || statistics.totalReviews === 0) return 0
    return Math.round((count / statistics.totalReviews) * 100)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-gray-600 mt-4">
          {language === 'th' ? 'กำลังโหลด...' : 'Loading...'}
        </p>
      </div>
    )
  }

  if (!statistics || statistics.totalReviews === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">
          {language === 'th' ? 'ยังไม่มีรีวิว' : 'No reviews yet'}
        </p>
        <p className="text-sm mt-2">
          {language === 'th'
            ? 'เป็นคนแรกที่รีวิวแพทย์ท่านนี้'
            : 'Be the first to review this doctor'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {statistics.averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(statistics.averageRating), 'w-6 h-6')}
            <p className="text-gray-600 mt-3">
              {statistics.totalReviews}{' '}
              {language === 'th' ? 'รีวิว' : 'review'}
              {statistics.totalReviews > 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">{star}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all duration-500"
                    style={{
                      width: `${getRatingPercentage(
                        statistics.ratingBreakdown[star]
                      )}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {statistics.ratingBreakdown[star]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {language === 'th' ? 'รีวิวล่าสุด' : 'Recent Reviews'}
        </h3>

        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.users?.name?.[0]?.toUpperCase() ||
                      review.users?.full_name?.[0]?.toUpperCase() ||
                      'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.users?.name || review.users?.full_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating, 'w-4 h-4')}
              </div>

              {/* Review Comment */}
              {review.comment && (
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>

        {reviews.length >= 10 && (
          <div className="text-center mt-6">
            <button className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium">
              {language === 'th' ? 'ดูรีวิวทั้งหมด' : 'View All Reviews'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
