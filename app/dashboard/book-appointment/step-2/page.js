'use client'

/**
 * Book Appointment - Step 2: Select Clinic/Department
 * User selects which medical department/specialty they need
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import {
  Heart,
  Brain,
  Bone,
  Activity,
  Baby,
  Eye,
  Ear,
  Smile,
  Stethoscope,
  Syringe,
  Pill,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'

export default function SelectClinicPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [selectedClinic, setSelectedClinic] = useState(null)

  // Mock data - Replace with Supabase query
  // TODO: Fetch from Supabase: supabase.from('clinics').select('*').eq('branch_id', branchId)
  const clinics = [
    {
      id: 1,
      name_th: 'คลินิกโรคหัวใจ',
      name_en: 'Cardiology',
      description_th: 'ตรวจและรักษาโรคหัวใจและหลอดเลือด',
      description_en: 'Heart and cardiovascular disease diagnosis and treatment',
      icon: 'Heart',
      color: 'red',
      doctorCount: 8,
    },
    {
      id: 2,
      name_th: 'คลินิกโรคระบบประสาท',
      name_en: 'Neurology',
      description_th: 'ตรวจและรักษาโรคระบบประสาท สมอง',
      description_en: 'Neurological and brain disorder treatment',
      icon: 'Brain',
      color: 'purple',
      doctorCount: 6,
    },
    {
      id: 3,
      name_th: 'คลินิกกระดูกและข้อ',
      name_en: 'Orthopedics',
      description_th: 'ตรวจและรักษาโรคกระดูก ข้อ กล้ามเนื้อ',
      description_en: 'Bone, joint, and muscle treatment',
      icon: 'Bone',
      color: 'orange',
      doctorCount: 10,
    },
    {
      id: 4,
      name_th: 'คลินิกอายุรกรรม',
      name_en: 'Internal Medicine',
      description_th: 'ตรวจและรักษาโรคทั่วไป โรคเรื้อรัง',
      description_en: 'General and chronic disease treatment',
      icon: 'Activity',
      color: 'blue',
      doctorCount: 12,
    },
    {
      id: 5,
      name_th: 'คลินิกกุมารเวชกรรม',
      name_en: 'Pediatrics',
      description_th: 'ดูแลสุขภาพเด็กและวัยรุ่น',
      description_en: 'Children and adolescent healthcare',
      icon: 'Baby',
      color: 'pink',
      doctorCount: 7,
    },
    {
      id: 6,
      name_th: 'คลินิกจักษุ',
      name_en: 'Ophthalmology',
      description_th: 'ตรวจและรักษาโรคตา',
      description_en: 'Eye disease diagnosis and treatment',
      icon: 'Eye',
      color: 'teal',
      doctorCount: 5,
    },
    {
      id: 7,
      name_th: 'คลินิกหู คอ จมูก',
      name_en: 'ENT (Ear, Nose, Throat)',
      description_th: 'ตรวจและรักษาโรคหู คอ จมูก',
      description_en: 'Ear, nose, and throat treatment',
      icon: 'Ear',
      color: 'indigo',
      doctorCount: 4,
    },
    {
      id: 8,
      name_th: 'คลินิกทันตกรรม',
      name_en: 'Dentistry',
      description_th: 'รักษาและดูแลสุขภาพช่องปากและฟัน',
      description_en: 'Dental and oral healthcare',
      icon: 'Smile',
      color: 'green',
      doctorCount: 9,
    },
  ]

  const iconComponents = {
    Heart,
    Brain,
    Bone,
    Activity,
    Baby,
    Eye,
    Ear,
    Smile,
    Stethoscope,
    Syringe,
    Pill,
  }

  const colorClasses = {
    red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-500', ring: 'ring-red-500' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-500', ring: 'ring-purple-500' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-500', ring: 'ring-orange-500' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-500', ring: 'ring-blue-500' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-500', ring: 'ring-pink-500' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-500', ring: 'ring-teal-500' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-500', ring: 'ring-indigo-500' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-500', ring: 'ring-green-500' },
  }

  const handleSelectClinic = (clinic) => {
    setSelectedClinic(clinic.id)
    // Save to localStorage
    localStorage.setItem('booking_clinic_id', clinic.id.toString())
    localStorage.setItem('booking_clinic_name', JSON.stringify({
      th: clinic.name_th,
      en: clinic.name_en,
    }))
    // Navigate to step 3
    router.push('/dashboard/book-appointment/step-3')
  }

  const handleBack = () => {
    router.push('/dashboard/book-appointment/step-1')
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
              <div className="w-16 h-1 bg-blue-600 mx-4"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">
                  {t('booking.step2')}
                </span>
              </div>
              <div className="w-16 h-1 bg-gray-300 mx-4"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">
                  {t('booking.step3')}
                </span>
              </div>
              <div className="w-16 h-1 bg-gray-300 mx-4"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">
                  {t('booking.step4')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('booking.selectClinic')}
          </h1>
          <p className="text-gray-600">
            {t('booking.selectClinicDescription')}
          </p>
        </div>

        {/* Clinic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {clinics.map((clinic) => {
            const IconComponent = iconComponents[clinic.icon] || Activity
            const colors = colorClasses[clinic.color] || colorClasses.blue

            return (
              <div
                key={clinic.id}
                onClick={() => handleSelectClinic(clinic)}
                className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 ${
                  selectedClinic === clinic.id ? `ring-4 ${colors.ring}` : ''
                }`}
              >
                <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mb-4`}>
                  <IconComponent className={`w-8 h-8 ${colors.text}`} />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {t('language') === 'th' ? clinic.name_th : clinic.name_en}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {t('language') === 'th' ? clinic.description_th : clinic.description_en}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {clinic.doctorCount} {t('booking.doctors')}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            )
          })}
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
