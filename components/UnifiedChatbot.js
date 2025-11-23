'use client'

/**
 * UnifiedChatbot Component
 * Combines AI health assistant + Admin messaging in one interface
 * - AI responds first for health questions
 * - Can switch to admin mode when needed
 * - Stores all messages in Supabase (60-day retention)
 * - Includes conversation history for better AI context
 */

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import { MessageSquare, Send, X, Minimize2, Maximize2, Bot, User as UserIcon, Shield } from 'lucide-react'

export default function UnifiedChatbot({ userId, userRole = 'user' }) {
  const { t, language } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('ai') // 'ai' or 'admin'
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

  // Mark all messages as read when chat opens
  useEffect(() => {
    if (isOpen && userId) {
      // Reset unread count immediately when opening chat
      setUnreadCount(0)

      // Mark all unread messages as read in database
      const markAllAsRead = async () => {
        try {
          const { error } = await supabase
            .from('admin_messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('recipient_id', userId)
            .eq('is_read', false)

          if (error) {
            console.error('Error marking messages as read:', error)
          }
        } catch (error) {
          console.error('Error marking messages as read:', error)
        }
      }

      markAllAsRead()
    }
  }, [isOpen, userId])

  // Load messages on mount
  useEffect(() => {
    if (userId) {
      loadMessages()
      // Only load unread count if chat is closed
      if (!isOpen) {
        loadUnreadCount()
      }
    } else {
      // If no userId (not logged in), show welcome message
      setMessages([
        {
          id: 'welcome',
          sender_role: 'ai',
          message: language === 'th'
            ? 'สวัสดีค่ะ! ยินดีต้อนรับสู่ Health Queue\n\nฉันคือผู้ช่วยด้านสุขภาพอัจฉริยะ พร้อมให้คำแนะนำเบื้องต้นเกี่ยวกับ:\n• อาการเบื้องต้น\n• โภชนาการและการออกกำลังกาย\n• การดูแลสุขภาพทั่วไป\n• แนะนำแผนกแพทย์ที่เหมาะสม\n\nมีอะไรให้ช่วยไหมคะ? 😊'
            : 'Hello! Welcome to Health Queue\n\nI am an intelligent health assistant ready to provide preliminary advice on:\n• Basic symptoms\n• Nutrition and exercise\n• General health care\n• Recommend appropriate medical departments\n\nHow can I help you? 😊',
          created_at: new Date().toISOString(),
        },
      ])
    }
  }, [userId, language, isOpen])

  // Real-time subscription for admin messages
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('unified_chat_messages')
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
          // Only increment unreadCount if chat is closed
          if (!isOpen) {
            setUnreadCount((prev) => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, isOpen])

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

      // Add welcome message if no messages exist
      if (!data || data.length === 0) {
        setMessages([
          {
            id: 'welcome',
            sender_role: 'ai',
            message: language === 'th'
              ? 'สวัสดีค่ะ! ยินดีต้อนรับสู่ Health Queue\n\nฉันคือผู้ช่วยด้านสุขภาพอัจฉริยะ พร้อมให้คำแนะนำเบื้องต้นเกี่ยวกับ:\n• อาการเบื้องต้น\n• โภชนาการและการออกกำลังกาย\n• การดูแลสุขภาพทั่วไป\n• แนะนำแผนกแพทย์ที่เหมาะสม\n\nหากต้องการคุยกับเจ้าหน้าที่จริงๆ บอก "คุยกับคน" ได้เลยนะคะ 😊'
              : 'Hello! Welcome to Health Queue\n\nI am an intelligent health assistant ready to provide preliminary advice on:\n• Basic symptoms\n• Nutrition and exercise\n• General health care\n• Recommend appropriate medical departments\n\nIf you need to talk to a real person, just say "talk to admin" 😊',
            created_at: new Date().toISOString(),
          },
        ])
      } else {
        setMessages(data)
        // Mark all received messages as read
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
      const ids = messagesToMark.map(m => m.id).filter(id => id !== 'welcome')
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

  // No longer needed - AI will detect intent via Function Calling
  // Keeping for backward compatibility but it won't be used

  // Send message (AI or Admin)
  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // AI Mode: Send to OpenAI
    if (mode === 'ai') {
      // Add user message to UI
      const userMsg = {
        id: Date.now().toString(),
        sender_id: userId,
        sender_role: 'user',
        message: userMessage,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])

      try {
        // Build conversation history (last 10 messages)
        const conversationHistory = messages
          .slice(-10)
          .filter(m => m.sender_role === 'user' || m.sender_role === 'ai')
          .map(m => ({
            role: m.sender_role === 'user' ? 'user' : 'assistant',
            content: m.message
          }))

        // Call AI API
        const response = await fetch('/api/health-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            language: language,
            conversationHistory: conversationHistory,
            currentMode: mode, // บอก AI ว่าตอนนี้อยู่โหมดไหน
          }),
        })

        if (!response.ok) throw new Error('AI API failed')

        const data = await response.json()

        // Check if AI detected intent to switch mode
        if (data.intent === 'switch_to_admin') {
          console.log('🔄 AI detected: User wants to talk to admin. Reason:', data.reason)

          // Switch to admin mode
          setMode('admin')

          // Add system message about switching
          const systemMsg = {
            id: (Date.now() + 1).toString(),
            sender_role: 'system',
            message: language === 'th'
              ? `🔄 เข้าใจแล้วค่ะ กำลังเชื่อมต่อกับเจ้าหน้าที่...\n\n${data.reason}\n\nเจ้าหน้าที่จะตอบกลับโดยเร็วที่สุดค่ะ`
              : `🔄 Understood. Connecting to admin...\n\n${data.reason}\n\nOur staff will respond as soon as possible.`,
            created_at: new Date().toISOString(),
          }

          setMessages((prev) => [...prev, systemMsg])

          // Save both messages to database if userId exists
          if (userId) {
            await supabase.from('admin_messages').insert([
              {
                user_id: userId,
                sender_id: userId,
                sender_role: 'user',
                message: userMessage,
                message_type: 'text',
              },
              {
                user_id: userId,
                sender_id: null,
                sender_role: 'system',
                recipient_id: userId,
                message: systemMsg.message,
                message_type: 'system',
              }
            ])
          }

          setLoading(false)
          return
        }

        // Check if AI detected intent to switch back to AI
        if (data.intent === 'switch_to_ai') {
          console.log('🔄 AI detected: User wants to talk to AI. Reason:', data.reason)

          // Switch to AI mode
          setMode('ai')

          const systemMsg = {
            id: (Date.now() + 1).toString(),
            sender_role: 'system',
            message: language === 'th'
              ? `🤖 เปลี่ยนเป็นโหมด AI แล้วค่ะ\n\n${data.reason}\n\nยินดีให้คำปรึกษาต่อนะคะ!`
              : `🤖 Switched to AI mode\n\n${data.reason}\n\nHappy to help you!`,
            created_at: new Date().toISOString(),
          }

          setMessages((prev) => [...prev, systemMsg])

          if (userId) {
            await supabase.from('admin_messages').insert([{
              user_id: userId,
              sender_id: null,
              sender_role: 'system',
              recipient_id: userId,
              message: systemMsg.message,
              message_type: 'system',
            }])
          }

          setLoading(false)
          return
        }

        // Normal AI response
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender_role: 'ai',
          message: data.reply || data.error,
          created_at: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, aiMsg])

        // Save both messages to database if userId exists
        if (userId) {
          await supabase.from('admin_messages').insert([
            {
              user_id: userId,
              sender_id: userId,
              sender_role: 'user',
              message: userMessage,
              message_type: 'text',
            },
            {
              user_id: userId,
              sender_id: null, // AI messages don't have sender_id
              sender_role: 'ai',
              recipient_id: userId,
              message: aiMsg.message,
              message_type: 'text',
            }
          ])
        }

      } catch (error) {
        console.error('Error with AI:', error)
        const errorMsg = {
          id: (Date.now() + 1).toString(),
          sender_role: 'ai',
          message: language === 'th'
            ? 'ขออภัยค่ะ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง หรือพิมพ์ "คุยกับคน" เพื่อติดต่อเจ้าหน้าที่'
            : 'Sorry, an error occurred. Please try again or type "talk to admin" to contact our staff',
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMsg])
      }
    }
    // Admin Mode: Send to admin (save to database)
    else {
      const newMessage = {
        user_id: userId,
        sender_id: userId,
        sender_role: userRole,
        recipient_id: null, // Will be picked up by admin
        message: userMessage,
        message_type: 'text',
      }

      try {
        const { data, error } = await supabase
          .from('admin_messages')
          .insert([newMessage])
          .select()
          .single()

        if (error) throw error

        setMessages((prev) => [...prev, data])
      } catch (error) {
        console.error('Error sending to admin:', error)
        alert(language === 'th' ? 'ส่งข้อความไม่สำเร็จ' : 'Failed to send message')
      }
    }

    setLoading(false)
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
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center group"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {language === 'th' ? 'ผู้ช่วยสุขภาพ AI + แอดมิน' : 'AI Health Assistant + Admin'}
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
          <div className={`flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r ${
            mode === 'ai' ? 'from-blue-500 to-purple-600' : 'from-purple-500 to-purple-700'
          } text-white rounded-t-2xl`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {mode === 'ai' ? <Bot className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-semibold">
                  {mode === 'ai'
                    ? (language === 'th' ? 'AI ผู้ช่วยสุขภาพ' : 'AI Health Assistant')
                    : (language === 'th' ? 'แอดมิน' : 'Admin')}
                </h3>
                <p className="text-xs opacity-90">
                  {loading ? (language === 'th' ? 'กำลังตอบ...' : 'Typing...') : 'Online'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mode Indicator */}
          {!isMinimized && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${mode === 'ai' ? 'bg-blue-500' : 'bg-purple-500'} animate-pulse`}></div>
                <span className="text-gray-600">
                  {mode === 'ai'
                    ? (language === 'th' ? '🤖 โหมด AI (พิมพ์ "คุยกับคน" เพื่อเปลี่ยน)' : '🤖 AI Mode (type "talk to admin" to switch)')
                    : (language === 'th' ? '👨‍⚕️ โหมดแอดมิน (พิมพ์ "คุยกับ AI" เพื่อเปลี่ยน)' : '👨‍⚕️ Admin Mode (type "talk to AI" to switch)')}
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loading && messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : Object.keys(groupedMessages).length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 text-sm">
                      {language === 'th' ? 'เริ่มแชทเลย!' : 'Start chatting!'}
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
                        const isOwn = message.sender_id === userId && message.sender_role === 'user'
                        const isAI = message.sender_role === 'ai'
                        const isAdmin = message.sender_role === 'admin'
                        const isSystem = message.sender_role === 'system'

                        if (isSystem) {
                          return (
                            <div key={message.id} className="flex justify-center mb-3">
                              <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-gray-700 max-w-[80%] text-center">
                                {message.message}
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div
                            key={message.id}
                            className={`flex gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                          >
                            {/* Avatar */}
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                isOwn
                                  ? 'bg-blue-500 text-white'
                                  : isAI
                                  ? 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                                  : 'bg-purple-500 text-white'
                              }`}
                            >
                              {isOwn ? (
                                <UserIcon className="w-4 h-4" />
                              ) : isAI ? (
                                <Bot className="w-4 h-4" />
                              ) : (
                                <Shield className="w-4 h-4" />
                              )}
                            </div>

                            {/* Message Bubble */}
                            <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : ''}`}>
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  isOwn
                                    ? 'bg-blue-500 text-white'
                                    : isAI
                                    ? 'bg-white border border-blue-200 text-gray-900'
                                    : 'bg-white border border-purple-200 text-gray-900'
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

                {/* Loading indicator */}
                {loading && messages.length > 0 && (
                  <div className="flex gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      mode === 'ai' ? 'bg-gradient-to-br from-blue-400 to-purple-500' : 'bg-purple-500'
                    } text-white`}>
                      {mode === 'ai' ? <Bot className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
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
                        ? (mode === 'ai' ? 'ถามเกี่ยวกับสุขภาพ...' : 'พิมพ์ข้อความ...')
                        : (mode === 'ai' ? 'Ask about health...' : 'Type a message...')
                    }
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className={`px-4 py-2 ${
                      mode === 'ai' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'
                    } text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors`}
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
