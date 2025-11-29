'use client'

/**
 * Book Appointment - Step 4: Select Date and Time
 * User selects appointment date and time slot
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Check,
  MapPin,
  User,
  Stethoscope,
} from 'lucide-react'

export default function SelectDateTimePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookingDetails, setBookingDetails] = useState({
    branch: { th: '', en: '' },
    clinic: { th: '', en: '' },
    doctor: { th: '', en: '' },
  })

  useEffect(() => {
    // Load booking details from localStorage
    const branchName = localStorage.getItem('booking_branch_name')
    const clinicName = localStorage.getItem('booking_clinic_name')
    const doctorName = localStorage.getItem('booking_doctor_name')

    setBookingDetails({
      branch: branchName ? JSON.parse(branchName) : { th: '', en: '' },
      clinic: clinicName ? JSON.parse(clinicName) : { th: '', en: '' },
      doctor: doctorName ? JSON.parse(doctorName) : { th: '', en: '' },
    })
  }, [])

  // Mock available time slots
  // TODO: Fetch from Supabase based on doctor_id and selected date
  const timeSlots = {
    morning: [
      { time: '08:00', available: true },
      { time: '08:30', available: true },
      { time: '09:00', available: false },
      { time: '09:30', available: true },
      { time: '10:00', available: true },
      { time: '10:30', available: false },
      { time: '11:00', available: true },
      { time: '11:30', available: true },
    ],
    afternoon: [
      { time: '13:00', available: true },
      { time: '13:30', available: false },
      { time: '14:00', available: true },
      { time: '14:30', available: true },
      { time: '15:00', available: true },
      { time: '15:30', available: false },
      { time: '16:00', available: true },
      { time: '16:30', available: true },
    ],
    evening: [
      { time: '17:00', available: true },
      { time: '17:30', available: true },
      { time: '18:00', available: false },
      { time: '18:30', available: true },
      { time: '19:00', available: true },
      { time: '19:30', available: false },
      { time: '20:00', available: true },
    ],
  }

  // Generate calendar days
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const days = getDaysInMonth(currentMonth)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthNames = t('language') === 'th'
    ? ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const dayNames = t('language') === 'th'
    ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleSelectDate = (date) => {
    if (date && date >= today) {
      setSelectedDate(date)
      setSelectedTime(null) // Reset time selection
    }
  }

  const handleSelectTime = (time) => {
    if (time.available) {
      setSelectedTime(time.time)
    }
  }

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return

    try {
      // Get user ID from localStorage or session
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        alert('กรุณาเข้าสู่ระบบก่อนทำการจอง')
        router.push('/login')
        return
      }

      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0]

      // Prepare appointment data
      const appointmentData = {
        userId,
        doctorId: localStorage.getItem('booking_doctor_id'),
        branchId: localStorage.getItem('booking_branch_id'),
        departmentId: localStorage.getItem('booking_clinic_id'), // clinic_id is actually department_id
        primaryDate: formattedDate,
        primaryTime: selectedTime,
        secondaryDate: null, // Can be extended later for secondary slot
        secondaryTime: null,
        symptoms: localStorage.getItem('booking_symptoms') || null,
        notes: localStorage.getItem('booking_notes') || null
      }

      // Call API to create appointment and send notifications
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create appointment')
      }

      // Clear booking data from localStorage
      localStorage.removeItem('booking_branch_id')
      localStorage.removeItem('booking_branch_name')
      localStorage.removeItem('booking_clinic_id')
      localStorage.removeItem('booking_clinic_name')
      localStorage.removeItem('booking_doctor_id')
      localStorage.removeItem('booking_doctor_name')
      localStorage.removeItem('booking_symptoms')
      localStorage.removeItem('booking_notes')

      // Show success message
      alert(t('booking.confirmationMessage') || 'จองสำเร็จ! คุณจะได้รับอีเมลและ SMS ยืนยันการจอง')

      // Redirect to appointments page
      router.push('/dashboard/appointments')
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง: ' + error.message)
    }
  }

  const handleBack = () => {
    router.push('/dashboard/book-appointment/step-3')
  }

  const isDateSelected = (date) => {
    return selectedDate && date &&
      selectedDate.getDate() === date.getDate() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getFullYear() === date.getFullYear()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">
                  {t('booking.step1')}
                </span>
              </div>
              <div className="w-16 h-1 bg-green-600 mx-4"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">
                  {t('booking.step2')}
                </span>
              </div>
              <div className="w-16 h-1 bg-green-600 mx-4"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">
                  {t('booking.step3')}
                </span>
              </div>
              <div className="w-16 h-1 bg-blue-600 mx-4"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">
                  {t('booking.step4')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('booking.selectDateTime')}
          </h1>
          <p className="text-gray-600">{t('booking.selectDateTimeDescription')}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {monthNames[currentMonth.getMonth()]}{' '}
                  {currentMonth.getFullYear() + (t('language') === 'th' ? 543 : 0)}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handlePreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day, index) => (
                  <div
                    key={index}
                    className="text-center text-sm font-semibold text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((date, index) => {
                  const isPast = date && date < today
                  const isSelected = isDateSelected(date)
                  const isToday = date &&
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectDate(date)}
                      disabled={!date || isPast}
                      className={`
                        aspect-square p-2 rounded-lg text-center transition-all
                        ${!date ? 'invisible' : ''}
                        ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50'}
                        ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                        ${isToday && !isSelected ? 'bg-blue-100 text-blue-600 font-bold' : ''}
                        ${!isPast && !isSelected && !isToday ? 'text-gray-700' : ''}
                      `}
                    >
                      {date ? date.getDate() : ''}
                    </button>
                  )
                })}
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    {t('booking.availableTimeSlots')}
                  </h3>

                  {/* Morning */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      {t('booking.morning')} (08:00 - 12:00)
                    </p>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {timeSlots.morning.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectTime(slot)}
                          disabled={!slot.available}
                          className={`
                            py-2 px-3 rounded-lg text-sm font-medium transition-all
                            ${!slot.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                            ${slot.available && selectedTime === slot.time ? 'bg-blue-600 text-white' : ''}
                            ${slot.available && selectedTime !== slot.time ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : ''}
                          `}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      {t('booking.afternoon')} (13:00 - 17:00)
                    </p>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {timeSlots.afternoon.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectTime(slot)}
                          disabled={!slot.available}
                          className={`
                            py-2 px-3 rounded-lg text-sm font-medium transition-all
                            ${!slot.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                            ${slot.available && selectedTime === slot.time ? 'bg-blue-600 text-white' : ''}
                            ${slot.available && selectedTime !== slot.time ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : ''}
                          `}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Evening */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      {t('booking.evening')} (17:00 - 20:00)
                    </p>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {timeSlots.evening.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectTime(slot)}
                          disabled={!slot.available}
                          className={`
                            py-2 px-3 rounded-lg text-sm font-medium transition-all
                            ${!slot.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                            ${slot.available && selectedTime === slot.time ? 'bg-blue-600 text-white' : ''}
                            ${slot.available && selectedTime !== slot.time ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : ''}
                          `}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {t('booking.bookingSummary')}
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{t('booking.branch')}</p>
                    <p className="text-sm text-gray-600">
                      {t('language') === 'th' ? bookingDetails.branch.th : bookingDetails.branch.en}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Stethoscope className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{t('booking.clinic')}</p>
                    <p className="text-sm text-gray-600">
                      {t('language') === 'th' ? bookingDetails.clinic.th : bookingDetails.clinic.en}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{t('booking.doctor')}</p>
                    <p className="text-sm text-gray-600">
                      {t('language') === 'th' ? bookingDetails.doctor.th : bookingDetails.doctor.en}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{t('booking.date')}</p>
                    <p className="text-sm text-gray-600">
                      {selectedDate
                        ? selectedDate.toLocaleDateString(t('language') === 'th' ? 'th-TH' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : t('booking.notSelected')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{t('booking.time')}</p>
                    <p className="text-sm text-gray-600">
                      {selectedTime || t('booking.notSelected')}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={!selectedDate || !selectedTime}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  selectedDate && selectedTime
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-5 h-5" />
                {t('booking.confirmBooking')}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('booking.back')}
          </button>
        </div>
      </div>
    </div>
  )
}
