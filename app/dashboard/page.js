'use client'

/**
 * User Dashboard Page
 * Main dashboard for patients/users
 * Features: Modern header, quick actions, upcoming appointments, medical chatbot
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import UnifiedChatbot from '@/components/UnifiedChatbot'
import { Calendar, Clock, FileText, User, TrendingUp, Heart, Activity } from 'lucide-react'

export default function UserDashboard() {
  const router = useRouter()
  const { t } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upcomingAppointments, setUpcomingAppointments] = useState([])

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        router.push('/login')
        return
      }

      if (currentUser.role !== 'user') {
        // ถ้า role ไม่ใช่ user ให้ redirect ไปหน้าที่ถูกต้อง
        router.push(`/${currentUser.role === 'admin' ? 'admin' : 'doctor'}/dashboard`)
        return
      }

      setUser(currentUser)
      await loadUpcomingAppointments(currentUser.id)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  // Load upcoming appointments
  const loadUpcomingAppointments = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          doctors (
            full_name,
            name_th,
            specialization,
            specialty_th
          )
        `)
        .eq('user_id', userId)
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .limit(5)

      if (error) throw error

      setUpcomingAppointments(data || [])
    } catch (error) {
      console.error('Error loading appointments:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* New Header Component */}
      <UserHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {t('common.welcome') || 'ยินดีต้อนรับ'}, {user.name}!
              </h2>
              <p className="text-blue-100 text-lg">
                {t('dashboard.subtitle') || 'ระบบจองนัดหมายแพทย์ออนไลน์'}
              </p>
            </div>
            <div className="hidden md:block">
              <Activity className="w-24 h-24 opacity-30" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {t('dashboard.upcomingAppointments') || 'นัดหมายถัดไป'}
              </h3>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{upcomingAppointments.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {t('dashboard.totalVisits') || 'การเข้ารับบริการ'}
              </h3>
              <Heart className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">24</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {t('dashboard.loyaltyPoints') || 'คะแนนสะสม'}
              </h3>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{user.points || 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('common.quickActions') || 'เมนูหลัก'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => router.push('/dashboard/book-appointment')}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:scale-105 text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('dashboard.bookAppointment') || 'จองนัดหมาย'}
              </h3>
              <p className="text-sm text-gray-600">
                {t('dashboard.bookAppointmentDesc') || 'จองคิวพบแพทย์ล่วงหน้า'}
              </p>
            </button>

            <button
              onClick={() => router.push('/dashboard/appointments')}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:scale-105 text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-10 h-10 text-green-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('dashboard.appointmentHistory') || 'นัดหมายของฉัน'}
              </h3>
              <p className="text-sm text-gray-600">
                {t('dashboard.appointmentHistoryDesc') || 'ดูประวัตินัดหมายทั้งหมด'}
              </p>
            </button>

            <button
              onClick={() => router.push('/dashboard/medical-history')}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:scale-105 text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-10 h-10 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('dashboard.medicalHistory') || 'ประวัติการรักษา'}
              </h3>
              <p className="text-sm text-gray-600">
                {t('dashboard.medicalHistoryDesc') || 'ดูประวัติการรักษาของคุณ'}
              </p>
            </button>

            <button
              onClick={() => router.push('/dashboard/profile')}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:scale-105 text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <User className="w-10 h-10 text-orange-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('dashboard.profile') || 'โปรไฟล์'}
              </h3>
              <p className="text-sm text-gray-600">
                {t('dashboard.profileDesc') || 'จัดการข้อมูลส่วนตัว'}
              </p>
            </button>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('appointment.upcoming') || 'นัดหมายที่กำลังจะมาถึง'}
            </h2>
            {upcomingAppointments.length > 0 && (
              <button
                onClick={() => router.push('/dashboard/appointments')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {t('notif.viewAll') || 'ดูทั้งหมด'}
              </button>
            )}
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">
                {t('appointment.noUpcoming') || 'ไม่มีนัดหมายในขณะนี้'}
              </p>
              <button
                onClick={() => router.push('/dashboard/book-appointment')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t('dashboard.bookNew') || 'จองนัดหมายใหม่'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/dashboard/appointments/${appointment.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {appointment.doctors?.name_th || appointment.doctors?.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.doctors?.specialty_th || appointment.doctors?.specialization}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(appointment.appointment_date).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })} • {appointment.appointment_time}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {appointment.status || 'Confirmed'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Unified Chatbot - AI + Admin in one interface */}
      <UnifiedChatbot userId={user?.id} userRole="user" />
    </div>
  )
}
