'use client'

/**
 * My Appointments Page
 * View all appointments (upcoming, past, cancelled)
 * Filter by status, cancel/reschedule appointments
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Stethoscope,
  X,
  RefreshCw,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react'

export default function MyAppointmentsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('upcoming') // upcoming, past, cancelled
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredAppointments, setFilteredAppointments] = useState([])

  // Mock data - Replace with Supabase query
  // TODO: Fetch from Supabase: supabase.from('appointments').select('*, doctors(*), clinics(*), branches(*)').eq('user_id', userId)
  const appointments = [
    {
      id: 1,
      date: '2025-11-20',
      time: '09:00',
      status: 'confirmed',
      branch_name_th: 'สาขาสีลม',
      branch_name_en: 'Silom Branch',
      clinic_name_th: 'คลินิกโรคหัวใจ',
      clinic_name_en: 'Cardiology',
      doctor_name_th: 'นพ. สมชาย ประเสริฐ',
      doctor_name_en: 'Dr. Somchai Prasert',
      doctor_title_th: 'แพทย์เชี่ยวชาญด้านโรคหัวใจ',
      doctor_title_en: 'Cardiology Specialist',
      notes: 'Annual checkup',
    },
    {
      id: 2,
      date: '2025-11-25',
      time: '14:00',
      status: 'pending',
      branch_name_th: 'สาขาสุขุมวิท',
      branch_name_en: 'Sukhumvit Branch',
      clinic_name_th: 'คลินิกกระดูกและข้อ',
      clinic_name_en: 'Orthopedics',
      doctor_name_th: 'นพ. วิชัย ธรรมรงค์',
      doctor_name_en: 'Dr. Wichai Thamrong',
      doctor_title_th: 'ผู้เชี่ยวชาญด้านกระดูกและข้อ',
      doctor_title_en: 'Orthopedics Specialist',
      notes: 'Follow-up knee pain',
    },
    {
      id: 3,
      date: '2025-12-01',
      time: '10:30',
      status: 'confirmed',
      branch_name_th: 'สาขาสีลม',
      branch_name_en: 'Silom Branch',
      clinic_name_th: 'คลินิกจักษุ',
      clinic_name_en: 'Ophthalmology',
      doctor_name_th: 'พญ. สุดารัตน์ วงศ์ใหญ่',
      doctor_name_en: 'Dr. Sudarat Wongyai',
      doctor_title_th: 'จักษุแพทย์',
      doctor_title_en: 'Ophthalmologist',
      notes: 'Eye exam',
    },
    {
      id: 4,
      date: '2025-11-10',
      time: '15:00',
      status: 'completed',
      branch_name_th: 'สาขาเชียงใหม่',
      branch_name_en: 'Chiang Mai Branch',
      clinic_name_th: 'คลินิกอายุรกรรม',
      clinic_name_en: 'Internal Medicine',
      doctor_name_th: 'นพ. ประสิทธิ์ ทองทิพย์',
      doctor_name_en: 'Dr. Prasit Thongthip',
      doctor_title_th: 'อายุรแพทย์',
      doctor_title_en: 'Internal Medicine Doctor',
      notes: 'Blood pressure checkup',
    },
    {
      id: 5,
      date: '2025-11-05',
      time: '11:00',
      status: 'cancelled',
      branch_name_th: 'สาขาสีลม',
      branch_name_en: 'Silom Branch',
      clinic_name_th: 'คลินิกทันตกรรม',
      clinic_name_en: 'Dentistry',
      doctor_name_th: 'ทพ. สมศักดิ์ รุ่งเรือง',
      doctor_name_en: 'Dr. Somsak Rungruang',
      doctor_title_th: 'ทันตแพทย์',
      doctor_title_en: 'Dentist',
      notes: 'Teeth cleaning',
    },
  ]

  // Filter appointments based on tab and search query
  useEffect(() => {
    let filtered = appointments

    // Filter by status tab
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(
        (apt) => apt.status === 'confirmed' || apt.status === 'pending'
      )
    } else if (activeTab === 'past') {
      filtered = filtered.filter((apt) => apt.status === 'completed')
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter((apt) => apt.status === 'cancelled')
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (apt) =>
          apt.doctor_name_th.toLowerCase().includes(query) ||
          apt.doctor_name_en.toLowerCase().includes(query) ||
          apt.clinic_name_th.toLowerCase().includes(query) ||
          apt.clinic_name_en.toLowerCase().includes(query) ||
          apt.branch_name_th.toLowerCase().includes(query) ||
          apt.branch_name_en.toLowerCase().includes(query)
      )
    }

    setFilteredAppointments(filtered)
  }, [activeTab, searchQuery])

  const handleCancelAppointment = (appointmentId) => {
    // TODO: Update in Supabase
    // await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointmentId)
    if (confirm(t('appointments.confirmCancel'))) {
      alert(t('appointments.cancelled'))
      // Refresh appointments list
    }
  }

  const handleRescheduleAppointment = (appointmentId) => {
    // Navigate to booking flow with pre-filled data
    router.push(`/dashboard/book-appointment/step-4?reschedule=${appointmentId}`)
  }

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label_th: 'ยืนยันแล้ว',
        label_en: 'Confirmed',
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label_th: 'รอยืนยัน',
        label_en: 'Pending',
      },
      completed: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label_th: 'เสร็จสิ้น',
        label_en: 'Completed',
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label_th: 'ยกเลิก',
        label_en: 'Cancelled',
      },
    }

    const badge = badges[status] || badges.pending

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {t('language') === 'th' ? badge.label_th : badge.label_en}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('appointments.title')}
          </h1>
          <p className="text-gray-600">{t('appointments.description')}</p>
        </div>

        {/* Tabs and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('appointments.upcoming')}
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'past'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('appointments.past')}
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'cancelled'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('appointments.cancelled')}
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('appointments.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80"
              />
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">{t('appointments.noAppointments')}</p>
                <button
                  onClick={() => router.push('/dashboard/book-appointment/step-1')}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {t('appointments.bookNew')}
                </button>
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Appointment Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {t('language') === 'th'
                              ? appointment.doctor_name_th
                              : appointment.doctor_name_en}
                          </h3>
                          <p className="text-sm text-blue-600 font-medium">
                            {t('language') === 'th'
                              ? appointment.doctor_title_th
                              : appointment.doctor_title_en}
                          </p>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Stethoscope className="w-4 h-4 text-blue-600" />
                          <span>
                            {t('language') === 'th'
                              ? appointment.clinic_name_th
                              : appointment.clinic_name_en}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>
                            {t('language') === 'th'
                              ? appointment.branch_name_th
                              : appointment.branch_name_en}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>
                            {new Date(appointment.date).toLocaleDateString(
                              t('language') === 'th' ? 'th-TH' : 'en-US',
                              { year: 'numeric', month: 'long', day: 'numeric' }
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>

                      {appointment.notes && (
                        <p className="mt-3 text-sm text-gray-600 italic">
                          {t('appointments.notes')}: {appointment.notes}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <button
                          onClick={() => handleRescheduleAppointment(appointment.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          {t('appointments.reschedule')}
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          {t('appointments.cancel')}
                        </button>
                      </div>
                    )}

                    {appointment.status === 'completed' && (
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <button
                          onClick={() => router.push(`/dashboard/medical-history/${appointment.id}`)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors"
                        >
                          {t('appointments.viewDetails')}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Book Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard/book-appointment/step-1')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            {t('appointments.bookNew')}
          </button>
        </div>
      </div>
    </div>
  )
}
