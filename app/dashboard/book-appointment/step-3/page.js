'use client'

/**
 * Book Appointment - Step 3: Select Doctor
 * User selects which doctor they want to see
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import { Star, Award, Calendar, Clock, ChevronRight, ArrowLeft, User } from 'lucide-react'

export default function SelectDoctorPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [clinicName, setClinicName] = useState({ th: '', en: '' })

  useEffect(() => {
    // Get clinic name from localStorage
    const storedClinicName = localStorage.getItem('booking_clinic_name')
    if (storedClinicName) {
      setClinicName(JSON.parse(storedClinicName))
    }
  }, [])

  // Mock data - Replace with Supabase query
  // TODO: Fetch from Supabase: supabase.from('doctors').select('*').eq('clinic_id', clinicId)
  const doctors = [
    {
      id: 1,
      full_name: 'Dr. Somchai Prasert',
      name_th: 'นพ. สมชาย ประเสริฐ',
      name_en: 'Dr. Somchai Prasert',
      title_th: 'แพทย์เชี่ยวชาญด้านโรคหัวใจ',
      title_en: 'Cardiology Specialist',
      education_th: 'แพทยศาสตร์บัณฑิต จุฬาลงกรณ์มหาวิทยาลัย',
      education_en: 'M.D., Chulalongkorn University',
      specialization_th: 'โรคหัวใจและหลอดเลือด',
      specialization_en: 'Cardiology',
      experience_years: 15,
      rating: 4.9,
      reviews_count: 342,
      languages: ['Thai', 'English'],
      image: 'https://i.pravatar.cc/300?img=12',
      available_days_th: 'จันทร์, พุธ, ศุกร์',
      available_days_en: 'Mon, Wed, Fri',
    },
    {
      id: 2,
      full_name: 'Dr. Supattra Wongsawat',
      name_th: 'พญ. สุพัตรา วงษ์สวัสดิ์',
      name_en: 'Dr. Supattra Wongsawat',
      title_th: 'ผู้เชี่ยวชาญด้านโรคหัวใจอินเตอร์เวนชั่น',
      title_en: 'Interventional Cardiology Expert',
      education_th: 'แพทยศาสตร์บัณฑิต มหาวิทยาลัยมหิดล',
      education_en: 'M.D., Mahidol University',
      specialization_th: 'โรคหัวใจ, Interventional Cardiology',
      specialization_en: 'Cardiology, Interventional Procedures',
      experience_years: 12,
      rating: 4.8,
      reviews_count: 289,
      languages: ['Thai', 'English', 'Japanese'],
      image: 'https://i.pravatar.cc/300?img=47',
      available_days_th: 'อังคาร, พฤหัสบดี, เสาร์',
      available_days_en: 'Tue, Thu, Sat',
    },
    {
      id: 3,
      full_name: 'Dr. Prasit Thongthip',
      name_th: 'นพ. ประสิทธิ์ ทองทิพย์',
      name_en: 'Dr. Prasit Thongthip',
      title_th: 'แพทย์ผู้เชี่ยวชาญโรคหัวใจเด็ก',
      title_en: 'Pediatric Cardiology Specialist',
      education_th: 'แพทยศาสตร์บัณฑิต มหาวิทยาลัยศิริราช',
      education_en: 'M.D., Siriraj Hospital',
      specialization_th: 'โรคหัวใจในเด็ก',
      specialization_en: 'Pediatric Cardiology',
      experience_years: 10,
      rating: 4.7,
      reviews_count: 156,
      languages: ['Thai', 'English'],
      image: 'https://i.pravatar.cc/300?img=33',
      available_days_th: 'จันทร์-ศุกร์',
      available_days_en: 'Mon-Fri',
    },
    {
      id: 4,
      full_name: 'Dr. Nattaya Srisomboon',
      name_th: 'พญ. นัทยา ศรีสมบูรณ์',
      name_en: 'Dr. Nattaya Srisomboon',
      title_th: 'ผู้เชี่ยวชาญด้านหัวใจล้มเหลว',
      title_en: 'Heart Failure Specialist',
      education_th: 'แพทยศาสตร์บัณฑิต มหาวิทยาลัยเชียงใหม่',
      education_en: 'M.D., Chiang Mai University',
      specialization_th: 'โรคหัวใจล้มเหลว, โรคกล้ามเนื้อหัวใจ',
      specialization_en: 'Heart Failure, Cardiomyopathy',
      experience_years: 8,
      rating: 4.9,
      reviews_count: 201,
      languages: ['Thai', 'English', 'French'],
      image: 'https://i.pravatar.cc/300?img=44',
      available_days_th: 'จันทร์, พุธ, ศุกร์, เสาร์',
      available_days_en: 'Mon, Wed, Fri, Sat',
    },
  ]

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor.id)
    // Save to localStorage
    localStorage.setItem('booking_doctor_id', doctor.id.toString())
    localStorage.setItem('booking_doctor_name', JSON.stringify({
      th: doctor.name_th,
      en: doctor.name_en,
    }))
    // Navigate to step 4
    router.push('/dashboard/book-appointment/step-4')
  }

  const handleBack = () => {
    router.push('/dashboard/book-appointment/step-2')
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
              <div className="w-16 h-1 bg-blue-600 mx-4"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">
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
            {t('booking.selectDoctor')}
          </h1>
          <p className="text-gray-600">
            {t('booking.selectDoctorDescription')}
            {clinicName.th && (
              <span className="font-semibold text-blue-600">
                {' '}
                {t('language') === 'th' ? clinicName.th : clinicName.en}
              </span>
            )}
          </p>
        </div>

        {/* Doctor Cards */}
        <div className="space-y-6 mb-8">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              onClick={() => handleSelectDoctor(doctor)}
              className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl ${
                selectedDoctor === doctor.id ? 'ring-4 ring-blue-500' : ''
              }`}
            >
              <div className="p-6 md:flex gap-6">
                {/* Doctor Photo */}
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    {doctor.image ? (
                      <img
                        src={doctor.image}
                        alt={doctor.name_en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {t('language') === 'th' ? doctor.name_th : doctor.name_en}
                      </h3>
                      <p className="text-blue-600 font-medium">
                        {t('language') === 'th' ? doctor.title_th : doctor.title_en}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-gray-900">{doctor.rating}</span>
                      <span className="text-sm text-gray-600">({doctor.reviews_count})</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-start gap-2 mb-2">
                        <Award className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {t('booking.education')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t('language') === 'th' ? doctor.education_th : doctor.education_en}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 mb-2">
                        <Star className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {t('booking.specialization')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t('language') === 'th'
                              ? doctor.specialization_th
                              : doctor.specialization_en}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start gap-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {t('booking.experience')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {doctor.experience_years} {t('booking.years')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {t('booking.availableDays')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t('language') === 'th'
                              ? doctor.available_days_th
                              : doctor.available_days_en}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      {doctor.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                      {t('booking.selectThisDoctor')}
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
