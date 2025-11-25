'use client'

/**
 * NotificationDropdown Component
 * Displays user notifications with real-time updates
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { Bell, Check, Calendar, FileText, MessageSquare, X, CreditCard, CheckCircle, AlertCircle, Info } from 'lucide-react'

export default function NotificationDropdown({ userId }) {
  const router = useRouter()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isMarkingRead, setIsMarkingRead] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return

    setLoading(true)
    try {
      // Get auth token from Supabase
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        console.error('No session found')
        return
      }

      const res = await fetch(`/api/notifications?limit=20&_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Cache-Control': 'no-cache'
        }
      })

      const data = await res.json()

      if (data.success) {
        console.log(`📬 Fetched ${data.notifications?.length || 0} notifications, ${data.unreadCount || 0} unread`)
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load notifications on mount and when dropdown opens
  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId])

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications()
    }
  }, [isOpen])

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    // Prevent marking while already in progress
    if (isMarkingRead) {
      console.log('Already marking notifications, please wait')
      return
    }

    setIsMarkingRead(true)
    try {
      // Get auth token from Supabase
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        console.error('No session found')
        return
      }

      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      if (data.success) {
        console.log('Notification marked as read successfully')
        // Update local state immediately
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      } else {
        console.error('Failed to mark notification as read:', data.error)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      alert(t('notif.markReadError') || 'Failed to mark notification as read')
    } finally {
      setIsMarkingRead(false)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    // Prevent multiple simultaneous requests
    if (isMarkingRead) {
      console.log('Already marking notifications, please wait')
      return
    }

    // Don't proceed if there are no unread notifications
    if (unreadCount === 0) {
      console.log('No unread notifications to mark')
      return
    }

    setIsMarkingRead(true)
    try {
      // Get auth token from Supabase
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        console.error('No session found')
        return
      }

      console.log('Marking all notifications as read...')
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      if (data.success) {
        console.log('All notifications marked as read successfully')
        // Update local state immediately - mark all as read
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
      } else {
        console.error('Failed to mark all as read:', data.error)
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
      alert(t('notif.markAllReadError') || 'Failed to mark all notifications as read')
    } finally {
      setIsMarkingRead(false)
    }
  }

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read if unread (don't wait)
    if (!notification.is_read) {
      markAsRead(notification.id)
    }

    // Always navigate immediately
    setIsOpen(false)

    // Navigate to action URL if provided
    if (notification.action_url) {
      router.push(notification.action_url)
      return
    }

    // Fallback: Navigate based on notification type
    if (notification.type === 'appointment' || notification.related_appointment_id) {
      router.push('/dashboard/appointments')
    } else if (notification.type === 'payment' && notification.related_payment_id) {
      router.push('/dashboard/appointments')
    }
  }

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-500" />
      case 'payment':
        return <CreditCard className="w-5 h-5 text-green-500" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'message':
        return <MessageSquare className="w-5 h-5 text-purple-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('common.justNow') || 'Just now'
    if (diffMins < 60) return `${diffMins} ${t('common.minutesAgo') || 'mins ago'}`
    if (diffHours < 24) return `${diffHours} ${t('common.hoursAgo') || 'hours ago'}`
    if (diffDays < 7) return `${diffDays} ${t('common.daysAgo') || 'days ago'}`
    return date.toLocaleDateString()
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
            <h3 className="font-semibold text-gray-900">
              {t('header.notifications')}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={isMarkingRead}
                className={`text-sm font-medium flex items-center gap-1 transition-colors ${
                  isMarkingRead
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {isMarkingRead ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    {t('notif.marking') || 'Marking...'}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {t('notif.markAllRead')}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 relative">
            {/* Overlay when marking as read */}
            {isMarkingRead && (
              <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-sm text-gray-700">{t('notif.updating') || 'Updating...'}</span>
                </div>
              </div>
            )}

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{t('notif.noNotifications')}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-blue-50/50' : ''
                  } ${isMarkingRead ? 'pointer-events-none' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm mb-1 ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  router.push('/dashboard/notifications')
                  setIsOpen(false)
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('notif.viewAll')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
