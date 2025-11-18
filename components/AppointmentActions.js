'use client'

/**
 * Appointment Actions Component
 * Handles Cancel and Reschedule actions with modal dialogs
 */

import { useState } from 'react'
import { X, Calendar, Clock, AlertCircle } from 'lucide-react'

export default function AppointmentActions({
  appointment,
  language,
  onSuccess,
  onCancel,
  onReschedule
}) {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert(language === 'th' ? 'กรุณาระบุเหตุผล' : 'Please provide a reason')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel')
      }

      alert(language === 'th' ? 'ยกเลิกนัดหมายสำเร็จ' : 'Appointment cancelled successfully')
      setShowCancelModal(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Cancel error:', error)
      alert(error.message || (language === 'th' ? 'เกิดข้อผิดพลาด' : 'An error occurred'))
    } finally {
      setLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      alert(language === 'th' ? 'กรุณาเลือกวันและเวลาใหม่' : 'Please select new date and time')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDate: rescheduleDate,
          newTime: rescheduleTime,
          reason: rescheduleReason || 'Rescheduled appointment'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reschedule')
      }

      alert(language === 'th' ? 'เปลี่ยนนัดหมายสำเร็จ' : 'Appointment rescheduled successfully')
      setShowRescheduleModal(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Reschedule error:', error)
      alert(error.message || (language === 'th' ? 'เกิดข้อผิดพลาด' : 'An error occurred'))
    } finally {
      setLoading(false)
    }
  }

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ]

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowRescheduleModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          {language === 'th' ? 'เปลี่ยนนัด' : 'Reschedule'}
        </button>
        <button
          onClick={() => setShowCancelModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
        >
          {language === 'th' ? 'ยกเลิก' : 'Cancel'}
        </button>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'th' ? 'ยกเลิกนัดหมาย' : 'Cancel Appointment'}
                </h2>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              {language === 'th'
                ? 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกนัดหมายนี้?'
                : 'Are you sure you want to cancel this appointment?'}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'เหตุผลในการยกเลิก' : 'Cancellation Reason'}
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={language === 'th' ? 'ระบุเหตุผล...' : 'Enter reason...'}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {language === 'th' ? 'ย้อนกลับ' : 'Back'}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading
                  ? (language === 'th' ? 'กำลังยกเลิก...' : 'Cancelling...')
                  : (language === 'th' ? 'ยืนยันยกเลิก' : 'Confirm Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'th' ? 'เปลี่ยนนัดหมาย' : 'Reschedule Appointment'}
                </h2>
              </div>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-4">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {language === 'th' ? 'วันที่ใหม่' : 'New Date'}
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Time Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {language === 'th' ? 'เวลาใหม่' : 'New Time'}
                </label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{language === 'th' ? 'เลือกเวลา' : 'Select time'}</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'th' ? 'เหตุผล (ถ้ามี)' : 'Reason (Optional)'}
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder={language === 'th' ? 'ระบุเหตุผล...' : 'Enter reason...'}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {language === 'th' ? 'ย้อนกลับ' : 'Back'}
              </button>
              <button
                onClick={handleReschedule}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading
                  ? (language === 'th' ? 'กำลังเปลี่ยน...' : 'Rescheduling...')
                  : (language === 'th' ? 'ยืนยันเปลี่ยนนัด' : 'Confirm Reschedule')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
