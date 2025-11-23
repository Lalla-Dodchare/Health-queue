'use client'

/**
 * TimePicker Component
 * Simple time picker with hour and minute selection
 */

import { useState, useRef, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function TimePicker({ value, onChange, label, required = false }) {
  const { language } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedHour, setSelectedHour] = useState('')
  const [selectedMinute, setSelectedMinute] = useState('')
  const dropdownRef = useRef(null)

  // Initialize from value
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':')
      setSelectedHour(hour)
      setSelectedMinute(minute)
    }
  }, [value])

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

  // Generate hours (9 AM - 5 PM for typical hospital hours)
  const hours = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 9 // 9-17 (9 AM - 5 PM)
    return hour.toString().padStart(2, '0')
  })

  // Generate minutes (00, 15, 30, 45)
  const minutes = ['00', '15', '30', '45']

  // Handle time selection
  const handleHourSelect = (hour) => {
    setSelectedHour(hour)
    if (selectedMinute) {
      onChange(`${hour}:${selectedMinute}`)
    }
  }

  const handleMinuteSelect = (minute) => {
    setSelectedMinute(minute)
    if (selectedHour) {
      onChange(`${selectedHour}:${minute}`)
      setIsOpen(false)
    }
  }

  // Format time for display
  const formatTime = (time) => {
    if (!time) return ''
    const [hour, minute] = time.split(':')
    const h = parseInt(hour)
    if (language === 'th') {
      return `${h}.${minute} น.`
    }
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${displayHour}:${minute} ${ampm}`
  }

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
        <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <span className={`flex-1 text-left ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value ? formatTime(value) : (language === 'th' ? 'เลือกเวลา' : 'Select Time')}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4 w-72">
          <div className="grid grid-cols-2 gap-4">
            {/* Hours */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 text-center">
                {language === 'th' ? 'ชั่วโมง' : 'Hour'}
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleHourSelect(hour)}
                    className={`
                      w-full py-2 px-3 rounded-lg text-sm transition-colors
                      ${selectedHour === hour
                        ? 'bg-blue-500 text-white font-semibold'
                        : 'hover:bg-blue-50 text-gray-700'
                      }
                    `}
                  >
                    {parseInt(hour)} {language === 'th' ? 'น.' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 text-center">
                {language === 'th' ? 'นาที' : 'Minute'}
              </h3>
              <div className="space-y-1">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleMinuteSelect(minute)}
                    disabled={!selectedHour}
                    className={`
                      w-full py-2 px-3 rounded-lg text-sm transition-colors
                      ${!selectedHour ? 'text-gray-300 cursor-not-allowed' : ''}
                      ${selectedMinute === minute
                        ? 'bg-blue-500 text-white font-semibold'
                        : 'hover:bg-blue-50 text-gray-700'
                      }
                    `}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Helper text */}
          {!selectedHour && (
            <p className="text-xs text-gray-500 text-center mt-3">
              {language === 'th' ? 'เลือกชั่วโมงก่อน' : 'Select hour first'}
            </p>
          )}

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={() => {
                setSelectedHour('')
                setSelectedMinute('')
                onChange('')
                setIsOpen(false)
              }}
              className="w-full mt-3 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              {language === 'th' ? 'ล้างค่า' : 'Clear'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
