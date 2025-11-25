'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import { ArrowLeft, Calendar, MapPin, Stethoscope } from 'lucide-react'

export default function DoctorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { t } = useTranslation()
  const doctorId = params.id

  const [loading, setLoading] = useState(true)
  const [doctor, setDoctor] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      await loadDoctorDetail()
      setLoading(false)
    }
    checkAuth()
  }, [router, doctorId])

  const loadDoctorDetail = async () => {
    try {
      // Load doctor
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id, contact_name, contact_email, specialty, image_url, status, branch_id, department_id')
        .eq('id', doctorId)
        .single()

      if (doctorError) throw doctorError

      // Load branch
      const { data: branchData } = await supabase
        .from('branches')
        .select('id, name')
        .eq('id', doctorData.branch_id)
        .single()

      // Load department
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name')
        .eq('id', doctorData.department_id)
        .single()

      setDoctor({
        ...doctorData,
        branches: branchData,
        departments: deptData
      })
    } catch (error) {
      console.error('Error loading doctor:', error)
    }
  }

  // Get doctor image based on name prefix
  const getDoctorImage = (doctorName) => {
    if (!doctorName) return null

    // Male doctors (นพ., ทพ.)
    if (doctorName.startsWith('นพ.') || doctorName.startsWith('ทพ.')) {
      return '/images/doctors/doctor-male.jpg'
    }

    // Female doctors (พญ., ทพญ.)
    if (doctorName.startsWith('พญ.') || doctorName.startsWith('ทพญ.')) {
      return '/images/doctors/doctor-female.jpg'
    }

    // Default to male if no match
    return '/images/doctors/doctor-male.jpg'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">{t('doctorDetail.doctorNotFound')}</p>
            <button
              onClick={() => router.push('/dashboard/doctors')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              {t('doctorDetail.backToDoctorsList')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/doctors')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t('doctorDetail.backToDoctors')}</span>
        </button>

        {/* Doctor Detail Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: Doctor Image */}
            <div className="relative h-[500px] bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
              {doctor.image_url || getDoctorImage(doctor.contact_name) ? (
                <img
                  src={doctor.image_url || getDoctorImage(doctor.contact_name)}
                  alt={doctor.contact_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-16 h-16 text-blue-600" />
                </div>
              )}
            </div>

            {/* Right: Doctor Info */}
            <div className="p-8 flex flex-col justify-center">
              {/* Doctor Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {doctor.contact_name}
              </h1>

              {/* Department */}
              {doctor.departments && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('doctorDetail.centerAndClinic')}</p>
                    <p className="font-semibold text-gray-900">{doctor.departments.name}</p>
                  </div>
                </div>
              )}

              {/* Branch */}
              {doctor.branches && (
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('search.branch')}</p>
                    <p className="font-semibold text-gray-900">{doctor.branches.name}</p>
                  </div>
                </div>
              )}

              {/* Book Appointment Button */}
              <button
                onClick={() => router.push(`/dashboard/book-appointment/new?doctor=${doctor.id}&branch=${doctor.branch_id}&department=${doctor.department_id}`)}
                className="w-full bg-gray-900 text-white px-6 py-4 rounded-xl hover:bg-gray-800 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                {t('header.quickBook')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
