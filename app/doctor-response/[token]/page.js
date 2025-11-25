'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, Calendar, Clock } from 'lucide-react'

export default function DoctorResponsePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const token = params.token
  const action = searchParams.get('action')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [appointment, setAppointment] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadAppointment()
  }, [token])

  const loadAppointment = async () => {
    try {
      console.log('🔍 Raw token from URL:', token)

      // Decode URL encoding ก่อน (แปลง %3D กลับเป็น =)
      const decodedToken = decodeURIComponent(token)
      console.log('🔓 After URL decode:', decodedToken)

      // Decode token เพื่อดึง appointment ID (ใช้ atob สำหรับ browser)
      let decoded
      try {
        decoded = atob(decodedToken)
        console.log('✅ Decoded token:', decoded)
      } catch (e) {
        console.error('❌ atob failed:', e)
        setError('Token ไม่ถูกต้อง (รูปแบบ base64 ผิด)')
        setLoading(false)
        return
      }

      const [appointmentId, secret] = decoded.split(':')

      // ตรวจสอบ secret
      const expectedSecret = process.env.NEXT_PUBLIC_DOCTOR_RESPONSE_SECRET || 'secret'
      if (secret !== expectedSecret) {
        setError('Invalid token')
        setLoading(false)
        return
      }

      // ดึงข้อมูล appointment
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          user:profiles!appointments_user_id_fkey (
            full_name,
            phone
          ),
          branch:branches!appointments_branch_id_fkey (
            name
          ),
          department:departments!appointments_department_id_fkey (
            name
          )
        `)
        .eq('id', appointmentId)
        .single()

      if (fetchError || !data) {
        setError('ไม่พบข้อมูลการนัดหมาย')
        setLoading(false)
        return
      }

      setAppointment(data)
      setLoading(false)

      // ถ้ามี action ใน URL ให้ submit ทันที (ส่ง appointmentId ไปด้วย)
      if (action && !success) {
        handleSubmit(action, appointmentId)
      }
    } catch (err) {
      console.error('Error loading appointment:', err)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      setLoading(false)
    }
  }

  const handleSubmit = async (selectedAction, apptId = null) => {
    if (submitting) return
    setSubmitting(true)

    try {
      let updateData = {}

      if (selectedAction === 'approve_primary') {
        updateData = {
          status: 'approved',
          approved_option: 'primary'
        }
      } else if (selectedAction === 'approve_secondary') {
        updateData = {
          status: 'approved',
          approved_option: 'secondary'
        }
      } else if (selectedAction === 'reject') {
        updateData = {
          status: 'rejected'
        }
      }

      // ใช้ apptId ที่ส่งมา หรือ appointment.id ถ้ามี appointment object
      const appointmentId = apptId || appointment?.id
      if (!appointmentId) {
        throw new Error('ไม่พบ appointment ID')
      }

      const { error: updateError } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)

      if (updateError) {
        throw updateError
      }

      setSuccess(true)
    } catch (err) {
      console.error('Error updating appointment:', err)
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">บันทึกสำเร็จ!</h1>
          <p className="text-gray-600 text-lg mb-6">
            ขอบคุณสำหรับคำตอบ Admin จะเห็นคำตอบของคุณทันที
          </p>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              คุณได้{' '}
              {action === 'approve_primary' && 'อนุมัติวันหลัก'}
              {action === 'approve_secondary' && 'อนุมัติวันรอง'}
              {action === 'reject' && 'ปฏิเสธการนัดหมาย'}
              {' '}เรียบร้อยแล้ว
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">🏥 คำขอนัดหมายผู้ป่วย</h1>
            <p className="text-indigo-100">กรุณาตรวจสอบข้อมูลและเลือกตัวเลือก</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Patient Info */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4">ข้อมูลผู้ป่วย</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-blue-700 font-medium w-24">ชื่อ-นามสกุล:</span>
                  <span className="text-gray-900 font-semibold">{appointment.user?.full_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-700 font-medium w-24">เบอร์โทร:</span>
                  <span className="text-gray-900">{appointment.user?.phone}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">สถานที่</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">สาขา:</span> {appointment.branch?.name}</p>
                <p><span className="font-medium">แผนก:</span> {appointment.department?.name}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-purple-900 mb-4">วันและเวลาที่ขอนัด</h2>

              <div className="mb-4 pb-4 border-b border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">ตัวเลือกที่ 1 (วันหลัก)</span>
                </div>
                <p className="text-gray-700 ml-7">
                  {new Date(appointment.primary_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {' '}เวลา {appointment.primary_time}
                  {appointment.primary_flexible && <span className="text-purple-600"> (ยืดหยุ่นเวลาได้)</span>}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">ตัวเลือกที่ 2 (วันรอง)</span>
                </div>
                <p className="text-gray-700 ml-7">
                  {new Date(appointment.secondary_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {' '}เวลา {appointment.secondary_time}
                  {appointment.secondary_flexible && <span className="text-blue-600"> (ยืดหยุ่นเวลาได้)</span>}
                </p>
              </div>
            </div>

            {/* Symptoms */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-yellow-900 mb-3">อาการ</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{appointment.symptoms}</p>
              {appointment.notes && (
                <>
                  <h3 className="font-semibold text-yellow-900 mt-4 mb-2">หมายเหตุ</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{appointment.notes}</p>
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="text-center text-lg font-semibold text-gray-900 mb-4">กรุณาเลือกตัวเลือก</h3>

              <button
                onClick={() => handleSubmit('approve_primary')}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
              >
                <CheckCircle className="w-6 h-6" />
                ✅ อนุมัติวันหลัก
              </button>

              <button
                onClick={() => handleSubmit('approve_secondary')}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
              >
                <Calendar className="w-6 h-6" />
                📅 อนุมัติวันรอง
              </button>

              <button
                onClick={() => handleSubmit('reject')}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
              >
                <XCircle className="w-6 h-6" />
                ❌ ปฏิเสธการนัดหมาย
              </button>
            </div>

            <p className="text-center text-gray-500 text-sm mt-8">
              เมื่อกดปุ่มแล้ว Admin จะเห็นคำตอบของคุณทันที
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
