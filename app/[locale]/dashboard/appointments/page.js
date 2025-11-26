'use client'

/**
 * My Appointments Page
 * View all appointments (upcoming, past, cancelled)
 * Filter by status, cancel/reschedule appointments
 * Connected to Supabase for real data
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import {
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  Stethoscope,
  X,
  RefreshCw,
  ChevronRight,
  Filter,
  Search,
  FileText,
  Download,
} from 'lucide-react'
import { getDisplayDateTime, formatAppointmentDateTime } from '@/utils/appointmentHelpers'

export default function MyAppointmentsPage() {
  const router = useRouter()
  const { t, language } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [activeTab, setActiveTab] = useState('upcoming') // upcoming, past, cancelled
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredAppointments, setFilteredAppointments] = useState([])

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      await loadAppointments(currentUser.id)
      setLoading(false)

      // Subscribe to real-time updates
      const subscription = supabase
        .channel('user_appointments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `user_id=eq.${currentUser.id}`
          },
          (payload) => {
            console.log('🔔 Appointment updated:', payload)
            loadAppointments(currentUser.id)
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
    checkAuth()
  }, [router])

  const loadAppointments = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          primary_date,
          primary_time,
          secondary_date,
          secondary_time,
          approved_option,
          primary_flexible,
          secondary_flexible,
          status,
          notes,
          created_at,
          treatment_note,
          treatment_file_url,
          treatment_completed_at,
          doctors!appointments_doctor_id_fkey (
            id,
            contact_name,
            contact_email,
            specialty
          ),
          branches!appointments_branch_id_fkey (
            id,
            name
          ),
          departments!appointments_department_id_fkey (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .order('primary_date', { ascending: false })
        .order('primary_time', { ascending: false })

      if (error) throw error

      // Removed verbose console.log to keep console clean
      setAppointments(data || [])
    } catch (error) {
      console.error('❌ Error loading appointments:', error)
      setAppointments([])
    }
  }

  useEffect(() => {
    filterAppointments()
  }, [activeTab, searchQuery, appointments])

  const filterAppointments = () => {
    let filtered = appointments

    // Filter by tab (V2: use display date from approved slot or primary)
    const today = new Date().toISOString().split('T')[0]
    if (activeTab === 'upcoming') {
      filtered = filtered.filter((apt) => {
        const displayDateTime = getDisplayDateTime(apt)
        return displayDateTime && displayDateTime.date >= today && apt.status !== 'cancelled' && apt.status !== 'rejected' && apt.status !== 'completed'
      })
    } else if (activeTab === 'past') {
      filtered = filtered.filter((apt) => {
        const displayDateTime = getDisplayDateTime(apt)
        return (displayDateTime && displayDateTime.date < today && apt.status !== 'cancelled' && apt.status !== 'rejected') || apt.status === 'completed'
      })
    } else if (activeTab === 'cancelled') {
      // Include both cancelled (by user) and rejected (by admin)
      filtered = filtered.filter((apt) => apt.status === 'cancelled' || apt.status === 'rejected')
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((apt) => {
        const doctorName = apt.doctors?.contact_name || ''
        const branchName = apt.branches?.name || ''

        return (
          doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          branchName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
    }

    setFilteredAppointments(filtered)
  }

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: t('appointments.status.confirmed') },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: t('appointments.status.approved') },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: t('appointments.status.pending') },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: t('appointments.status.completed') },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: t('appointments.status.cancelled') },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: t('appointments.status.rejected') },
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm(t('appointments.confirmCancel'))) {
      return
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)

      if (error) throw error

      alert(t('appointments.cancelSuccess'))
      await loadAppointments(user.id)
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert(t('common.error'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <UserHeader />
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <UserHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('appointments.title')}
          </h1>
          <p className="text-gray-600">
            {t('appointments.subtitle')}
          </p>
        </div>

        {/* Search & Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('appointments.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('appointments.upcoming')}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'past'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('appointments.past')}
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'cancelled'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('appointments.cancelled')}
            </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">
                {t('appointments.noAppointments')}
              </p>
              <button
                onClick={() => router.push('/dashboard/book-appointment')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t('appointments.bookNew')}
              </button>
            </div>
          ) : (
            filteredAppointments.map((appointment) => {
              const displayDateTime = getDisplayDateTime(appointment)
              const formatted = displayDateTime
                ? formatAppointmentDateTime(displayDateTime.date, displayDateTime.time, language === 'th' ? 'th-TH' : 'en-US')
                : { date: 'N/A', time: 'N/A' }

              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {appointment.doctors?.contact_name || t('appointments.noDoctorSpecified')}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {appointment.doctors?.specialty || t('appointments.generalSpecialty')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatted.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatted.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{appointment.branches?.name || t('appointments.noBranchSpecified')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Stethoscope className="w-4 h-4" />
                          <span>{appointment.departments?.name || t('appointments.noDepartmentSpecified')}</span>
                        </div>
                      </div>

                      {/* Show alternative date if pending */}
                      {appointment.status === 'pending' && displayDateTime?.hasAlternative && (
                        <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs text-purple-700">
                            {t('appointments.hasAlternative')}{' '}
                            {formatAppointmentDateTime(
                              displayDateTime.alternativeDate,
                              displayDateTime.alternativeTime,
                              language === 'th' ? 'th-TH' : 'en-US'
                            ).date} • {displayDateTime.alternativeTime}
                          </p>
                        </div>
                      )}

                      {appointment.notes && (
                        <p className="text-sm text-gray-500 mt-3">
                          {t('appointments.notes')}: {appointment.notes}
                        </p>
                      )}

                      {/* Treatment Results */}
                      {appointment.status === 'completed' && appointment.treatment_note && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {t('appointments.treatmentResults')}
                          </h4>
                          <p className="text-sm text-green-800 whitespace-pre-wrap mb-3">{appointment.treatment_note}</p>
                          {appointment.treatment_file_url && (() => {
                            try {
                              const fileUrls = JSON.parse(appointment.treatment_file_url)
                              return Array.isArray(fileUrls) ? (
                                <div className="space-y-2">
                                  <p className="text-xs text-green-700 font-semibold">{t('appointments.treatmentFiles')} ({fileUrls.length}):</p>
                                  {fileUrls.map((url, index) => (
                                    <a
                                      key={index}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 hover:underline"
                                    >
                                      <Download className="w-4 h-4" />
                                      {t('appointments.downloadFile')} {index + 1}
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <a
                                  href={appointment.treatment_file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 hover:underline"
                                >
                                  <Download className="w-4 h-4" />
                                  {t('appointments.downloadTreatmentFile')}
                                </a>
                              )
                            } catch {
                              return (
                                <a
                                  href={appointment.treatment_file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 hover:underline"
                                >
                                  <Download className="w-4 h-4" />
                                  {t('appointments.downloadTreatmentFile')}
                                </a>
                              )
                            }
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {getStatusBadge(appointment.status)}

                      {activeTab === 'upcoming' && appointment.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          {t('appointments.cancel')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
