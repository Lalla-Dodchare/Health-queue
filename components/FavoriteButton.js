'use client'

/**
 * Favorite Button Component
 * Heart button to add/remove doctors from favorites
 */

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

export default function FavoriteButton({ doctorId, language = 'th', size = 'default' }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkFavoriteStatus()
  }, [doctorId])

  const checkFavoriteStatus = async () => {
    try {
      const res = await fetch(`/api/favorites/${doctorId}`)
      const data = await res.json()

      if (data.success) {
        setIsFavorite(data.is_favorite)
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const toggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    setLoading(true)
    try {
      const res = await fetch(`/api/favorites/${doctorId}`, {
        method: 'POST'
      })

      const data = await res.json()

      if (data.success) {
        setIsFavorite(data.is_favorite)

        // Optional: Show toast notification
        const message = data.action === 'added'
          ? (language === 'th' ? 'เพิ่มในรายการโปรดแล้ว' : 'Added to favorites')
          : (language === 'th' ? 'ลบออกจากรายการโปรดแล้ว' : 'Removed from favorites')

        // You can replace this with a toast library
        console.log(message)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  const iconSize = size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-7 h-7' : 'w-5 h-5'
  const buttonSize = size === 'small' ? 'w-8 h-8' : size === 'large' ? 'w-12 h-12' : 'w-10 h-10'

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`${buttonSize} rounded-full flex items-center justify-center transition-all ${
        isFavorite
          ? 'bg-red-50 hover:bg-red-100'
          : 'bg-gray-100 hover:bg-gray-200'
      } disabled:opacity-50`}
      title={isFavorite
        ? (language === 'th' ? 'ลบออกจากรายการโปรด' : 'Remove from favorites')
        : (language === 'th' ? 'เพิ่มในรายการโปรด' : 'Add to favorites')
      }
      aria-label={isFavorite
        ? (language === 'th' ? 'ลบออกจากรายการโปรด' : 'Remove from favorites')
        : (language === 'th' ? 'เพิ่มในรายการโปรด' : 'Add to favorites')
      }
    >
      <Heart
        className={`${iconSize} transition-all ${
          isFavorite
            ? 'fill-red-500 text-red-500'
            : 'text-gray-500'
        } ${loading ? 'animate-pulse' : ''}`}
      />
    </button>
  )
}
