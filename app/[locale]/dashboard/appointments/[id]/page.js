'use client'

/**
 * Appointment Detail Page
 * View details of a specific appointment with V2 fields support
 * Shows: Primary/Secondary dates, Confirmed date, Flexible flags, Admin notes
 */

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  UserDoctor,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock3,
  ArrowLeft,
  MessageSquare,
  Building2,
} from 'lucide-react'

export default function AppointmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id
  const { t, language } = useTranslation()

  const [user, setUser] = useState(null)
  const [appointment, setAppointment] = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [department, setDepartment] = useState(null)
  const [branch, setBranch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
    }
    loadUser()
  }, [router])

  // Load appointment details
  useEffect(() => {
    const loadAppointment = async () => {
      if (!appointmentId) return

      try {
        // Get appointment
        const { data: apptData, error: apptError } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .single()

        if (apptError) throw apptError
        setAppointment(apptData)

        // Get doctor
        if (apptData.doctor_id) {
          const { data: docData } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', apptData.doctor_id)
            .single()
          setDoctor(docData)
        }

        // Get department
        if (apptData.department_id) {
          const { data: deptData } = await supabase
            .from('departments')
            .select('*')
            .eq('id', apptData.department_id)
            .single()
          setDepartment(deptData)
        }

        // Get branch
        if (apptData.branch_id) {
          const { data: branchData } = await supabase
            .from('branches')
            .select('*')
            .eq('id', apptData.branch_id)
            .single()
          setBranch(branchData)
        }
      } catch (error) {
        console.error('Error loading appointment:', error)
        alert(language === 'th' ? 'ไม่พบข้อมูลนัดหมาย' : 'Appointment not found')
        router.push('/dashboard/appointments')
      } finally {
        setLoading(false)
      }
    }

    loadAppointment()
  }, [appointmentId, language, router])

  // Cancel appointment
  const handleCancel = async () => {
    if (!confirm(language === 'th' ? 'ยืนยันการยกเลิกนัดหมาย?' : 'Confirm cancellation?')) {
      return
    }

    setCancelling(true)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)

      if (error) throw error

      alert(language === 'th' ? 'ยกเลิกนัดหมายสำเร็จ' : 'Appointment cancelled successfully')
      router.push('/dashboard/appointments')
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert(language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error cancelling appointment')
    } finally {
      setCancelling(false)
    }
  }

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Format time
  const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    const [hour, minute] = timeStr.split(':')
    const h = parseInt(hour)
    if (language === 'th') {
      return `${h}.${minute} น.`
    }
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${displayHour}:${minute} ${ampm}`
  }

  // Get status config
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock3 className="w-6 h-6" />,
          color: 'yellow',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-800',
          label: language === 'th' ? 'รอการอนุมัติ' : 'Pending',
        }
      case 'confirmed':
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          color: 'green',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300',
          textColor: 'text-green-800',
          label: language === 'th' ? 'อนุมัติแล้ว' : 'Confirmed',
        }
      case 'rejected':
        return {
          icon: <XCircle className="w-6 h-6" />,
          color: 'red',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          textColor: 'text-red-800',
          label: language === 'th' ? 'ปฏิเสธ' : 'Rejected',
        }
      case 'cancelled':
        return {
          icon: <XCircle className="w-6 h-6" />,
          color: 'gray',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-800',
          label: language === 'th' ? 'ยกเลิกแล้ว' : 'Cancelled',
        }
      default:
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          color: 'gray',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-800',
          label: status,
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{language === 'th' ? 'ไม่พบข้อมูลนัดหมาย' : 'Appointment not found'}</p>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(appointment.status)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {language === 'th' ? 'กลับ' : 'Back'}
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'th' ? 'รายละเอียดนัดหมาย' : 'Appointment Details'}
              </h1>
              <p className="text-gray-600">
                {language === 'th' ? 'รหัสนัดหมาย:' : 'Appointment ID:'} {appointment.id.slice(0, 8)}
              </p>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
              <div className={statusConfig.textColor}>{statusConfig.icon}</div>
              <span className={`font-semibold ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctor & Location Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'th' ? 'ข้อมูลแพทย์และสถานที่' : 'Doctor & Location'}
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">{language === 'th' ? 'สาขา' : 'Branch'}</p>
                    <p className="font-semibold text-gray-900">{branch?.name || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Stethoscope className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">{language === 'th' ? 'แผนก' : 'Department'}</p>
                    <p className="font-semibold text-gray-900">{department?.name || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserDoctor className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">{language === 'th' ? 'แพทย์' : 'Doctor'}</p>
                    <p className="font-semibold text-gray-900">{doctor?.name || '-'}</p>
                    {doctor?.specialization && (
                      <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'th' ? 'วันและเวลานัดหมาย' : 'Appointment Schedule'}
              </h2>

              {/* Confirmed Date (if approved) */}
              {appointment.status === 'confirmed' && appointment.confirmed_date && (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">
                      {language === 'th' ? 'วันที่อนุมัติ' : 'Confirmed Date'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-green-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-bold text-lg">{formatDate(appointment.confirmed_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-bold text-lg">{formatTime(appointment.confirmed_time)}</span>
                    </div>
                  </div>
                  {appointment.approved_option && (
                    <p className="text-sm text-green-700 mt-2">
                      {language === 'th' ? 'เลือกจาก: ' : 'Selected: '}
                      {appointment.approved_option === 'primary'
                        ? (language === 'th' ? 'วันหลัก' : 'Primary Date')
                        : (language === 'th' ? 'วันรอง' : 'Secondary Date')}
                    </p>
                  )}
                </div>
              )}

              {/* Primary Date */}
              <div className="border-2 border-blue-200 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">1</span>
                  {language === 'th' ? 'วันที่หลัก (ตัวเลือกที่ 1)' : 'Primary Date (Option 1)'}
                </h3>
                <div className="flex items-center gap-4 text-gray-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{formatDate(appointment.primary_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{formatTime(appointment.primary_time)}</span>
                  </div>
                </div>
                {appointment.primary_flexible && (
                  <p className="text-sm text-blue-600 mt-2">
                    ✓ {language === 'th' ? 'ยืดหยุ่นเวลา (±1 ชั่วโมง)' : 'Flexible time (±1 hour)'}
                  </p>
                )}
              </div>

              {/* Secondary Date */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">2</span>
                  {language === 'th' ? 'วันที่รอง (ตัวเลือกที่ 2)' : 'Secondary Date (Option 2)'}
                </h3>
                <div className="flex items-center gap-4 text-gray-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{formatDate(appointment.secondary_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{formatTime(appointment.secondary_time)}</span>
                  </div>
                </div>
                {appointment.secondary_flexible && (
                  <p className="text-sm text-gray-600 mt-2">
                    ✓ {language === 'th' ? 'ยืดหยุ่นเวลา (±1 ชั่วโมง)' : 'Flexible time (±1 hour)'}
                  </p>
                )}
              </div>
            </div>

            {/* Symptoms & Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                {language === 'th' ? 'อาการและหมายเหตุ' : 'Symptoms & Notes'}
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {language === 'th' ? 'อาการ' : 'Symptoms'}
                  </h3>
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {appointment.symptoms || '-'}
                  </p>
                </div>

                {appointment.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      {language === 'th' ? 'หมายเหตุจากคุณ' : 'Your Notes'}
                    </h3>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {appointment.notes}
                    </p>
                  </div>
                )}

                {appointment.admin_notes && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      {language === 'th' ? 'หมายเหตุจากแอดมิน' : 'Admin Notes'}
                    </h3>
                    <p className="text-gray-900 whitespace-pre-wrap bg-blue-50 p-4 rounded-lg border border-blue-200">
                      {appointment.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Service Type */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                {language === 'th' ? 'ประเภทบริการ' : 'Service Type'}
              </h3>
              <p className="text-sm text-gray-700">
                {appointment.service_type === 'agency_assisted'
                  ? (language === 'th' ? '✨ มีเจ้าหน้าที่ช่วยเหลือ' : '✨ Agency Assisted')
                  : (language === 'th' ? '📝 จัดการเอง' : '📝 Self-Service')}
              </p>
            </div>

            {/* Actions */}
            {appointment.status === 'pending' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {language === 'th' ? 'การจัดการ' : 'Actions'}
                </h3>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {cancelling ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      {language === 'th' ? 'กำลังยกเลิก...' : 'Cancelling...'}
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      {language === 'th' ? 'ยกเลิกนัดหมาย' : 'Cancel Appointment'}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {language === 'th' ? 'ข้อมูลเพิ่มเติม' : 'Additional Info'}
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                {appointment.status === 'pending' && (
                  <p>• {language === 'th' ? 'แอดมินกำลังประสานงานกับแพทย์' : 'Admin is coordinating with doctor'}</p>
                )}
                {appointment.status === 'confirmed' && (
                  <p>• {language === 'th' ? 'กรุณามาตามวันเวลาที่อนุมัติ' : 'Please arrive at confirmed date/time'}</p>
                )}
                <p>• {language === 'th' ? 'คุณจะได้รับการแจ้งเตือนทางอีเมล' : 'You will receive email notifications'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
