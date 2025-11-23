'use client'

/**
 * DatePicker Component
 * Simple date picker with Thai/English calendar support
 */

import { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function DatePicker({ value, onChange, minDate, label, required = false }) {
  const { t, language } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date())
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

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days = []
    // Add empty slots for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  // Format date for display
  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (language === 'th') {
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Check if date is disabled
  const isDateDisabled = (date) => {
    if (!date) return false
    if (minDate) {
      const min = new Date(minDate)
      min.setHours(0, 0, 0, 0)
      const check = new Date(date)
      check.setHours(0, 0, 0, 0)
      return check < min
    }
    return false
  }

  // Check if date is selected
  const isDateSelected = (date) => {
    if (!date || !value) return false
    const selected = new Date(value)
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    )
  }

  // Handle date selection
  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return
    onChange(date.toISOString().split('T')[0])
    setIsOpen(false)
  }

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const days = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })

  const weekDays = language === 'th'
    ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors bg-white"
      >
        <CalendarIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <span className={`flex-1 text-left ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value ? formatDate(value) : (language === 'th' ? 'เลือกวันที่' : 'Select Date')}
        </span>
      </button>

      {/* Dropdown Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4 w-80">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="font-semibold text-gray-900">{monthName}</h3>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <button
                key={index}
                type="button"
                onClick={() => date && handleDateSelect(date)}
                disabled={!date || isDateDisabled(date)}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-sm transition-colors
                  ${!date ? 'invisible' : ''}
                  ${isDateDisabled(date) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50'}
                  ${isDateSelected(date) ? 'bg-blue-500 text-white font-semibold hover:bg-blue-600' : 'text-gray-700'}
                `}
              >
                {date && date.getDate()}
              </button>
            ))}
          </div>

          {/* Today Button */}
          <button
            type="button"
            onClick={() => {
              const today = new Date()
              if (!isDateDisabled(today)) {
                handleDateSelect(today)
              }
            }}
            className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {language === 'th' ? 'วันนี้' : 'Today'}
          </button>
        </div>
      )}
    </div>
  )
}
