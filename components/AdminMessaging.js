'use client'

/**
 * AdminMessaging Component
 * Chat system between users and admins
 * Messages are stored for 60 days then auto-deleted
 */

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import { MessageSquare, Send, X, Minimize2, Maximize2, User as UserIcon, Shield } from 'lucide-react'

export default function AdminMessaging({ userId, userRole = 'user' }) {
  const { t, language } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  // Load messages
  useEffect(() => {
    if (userId) {
      loadMessages()
      loadUnreadCount()
    }
  }, [userId])

  // Real-time subscription
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('admin_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
          setUnreadCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Load messages from database
  const loadMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('admin_messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error

      setMessages(data || [])

      // Mark all received messages as read
      if (data && data.length > 0) {
        await markMessagesAsRead(data.filter(m => m.recipient_id === userId && !m.is_read))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('admin_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false)

      if (error) throw error

      setUnreadCount(count || 0)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  // Mark messages as read
  const markMessagesAsRead = async (messagesToMark) => {
    try {
      const ids = messagesToMark.map(m => m.id)
      if (ids.length === 0) return

      const { error } = await supabase
        .from('admin_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', ids)

      if (error) throw error

      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const newMessage = {
      sender_id: userId,
      sender_role: userRole,
      recipient_id: userRole === 'user' ? null : null, // Admin sends to specific user
      message: input.trim(),
      message_type: 'text',
      created_at: new Date().toISOString(),
    }

    setInput('')
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('admin_messages')
        .insert([newMessage])
        .select()
        .single()

      if (error) throw error

      setMessages((prev) => [...prev, data])
    } catch (error) {
      console.error('Error sending message:', error)
      alert(language === 'th' ? 'ส่งข้อความไม่สำเร็จ' : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return language === 'th' ? 'วันนี้' : 'Today'
    if (diffDays === 1) return language === 'th' ? 'เมื่อวาน' : 'Yesterday'
    return date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center group"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {language === 'th' ? 'ติดต่อเจ้าหน้าที่' : 'Contact Admin'}
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col transition-all ${
            isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {language === 'th' ? 'แอดมิน' : 'Admin'}
                </h3>
                <p className="text-xs opacity-90">
                  {language === 'th' ? 'ข้อความจะถูกลบหลัง 60 วัน' : 'Messages deleted after 60 days'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="w-5 h-5" />
                ) : (
                  <Minimize2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loading && messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                  </div>
                ) : Object.keys(groupedMessages).length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 text-sm">
                      {language === 'th'
                        ? 'ยังไม่มีข้อความ เริ่มแชทเลย!'
                        : 'No messages yet. Start chatting!'}
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      {/* Date Divider */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                          {formatDate(msgs[0].created_at)}
                        </div>
                      </div>

                      {/* Messages */}
                      {msgs.map((message) => {
                        const isOwn = message.sender_id === userId
                        return (
                          <div
                            key={message.id}
                            className={`flex gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                          >
                            {/* Avatar */}
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                isOwn
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}
                            >
                              {isOwn ? (
                                <UserIcon className="w-4 h-4" />
                              ) : (
                                <Shield className="w-4 h-4" />
                              )}
                            </div>

                            {/* Message Bubble */}
                            <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  isOwn
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white border border-gray-200 text-gray-900'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.message}
                                </p>
                              </div>
                              <p className="text-xs text-gray-400 mt-1 px-1">
                                {formatTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      language === 'th'
                        ? 'พิมพ์ข้อความ...'
                        : 'Type a message...'
                    }
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:border-purple-500 focus:outline-none disabled:bg-gray-100"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
