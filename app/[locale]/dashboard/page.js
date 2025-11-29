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
import Footer from '@/components/Footer'
import UnifiedChatbot from '@/components/UnifiedChatbot'
import { Calendar, Heart, User, Zap, Baby, Stethoscope, Activity, Eye, Smile, X, Bone, Camera, Brain, Wind, Droplet, Syringe, Pill, FileText, Ear, Sparkles, Microscope, ChevronLeft, ChevronRight } from 'lucide-react'

export default function UserDashboard() {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [medicalCenters, setMedicalCenters] = useState([])

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000) // Auto-change slide every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Carousel controls
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3)
  }

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3)
  }

  // Icon mapping for medical centers
  const iconMap = {
    'User': User,
    'Baby': Baby,
    'Heart': Heart,
    'Ear': Ear,
    'Sparkles': Sparkles,
    'Syringe': Syringe,
    'Activity': Activity,
    'Bone': Bone,
    'Camera': Camera,
    'Brain': Brain,
    'Eye': Eye,
    'Smile': Smile,
    'Pill': Pill,
    'Stethoscope': Stethoscope,
    'FileText': FileText,
    'Droplet': Droplet,
    'Wind': Wind,
    'Zap': Zap
  }

  // Fetch medical centers from database
  useEffect(() => {
    const fetchMedicalCenters = async () => {
      try {
        const { data, error } = await supabase
          .from('department_translations')
          .select('*')
          .eq('locale', locale || 'th')
          .order('department_id', { ascending: true })

        if (error) {
          console.error('Error fetching medical centers:', error)
          return
        }

        if (data) {
          // Transform database data to match the expected format
          const transformed = data.map(center => ({
            id: center.department_id,
            departmentId: center.department_id,
            name: center.name,
            nameEn: center.name_en,
            icon: iconMap[center.icon] || User,
            color: center.color,
            hasBranches: center.has_branches,
            branches: center.branches,
            description: center.description,
            services: center.services
          }))

          setMedicalCenters(transformed)
        }
      } catch (err) {
        console.error('Failed to fetch medical centers:', err)
      }
    }

    if (locale) {
      fetchMedicalCenters()
    }
  }, [locale])

  // Authentication useEffect
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        router.push('/login')
        return
      }

      if (currentUser.role !== 'user') {
        // If role is not user, redirect to correct page
        router.push(`/${currentUser.role === 'admin' ? 'admin' : 'doctor'}/dashboard`)
        return
      }

      setUser(currentUser)
      setLoading(false)
    }

    checkAuth()
  }, [router])

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Component */}
      <UserHeader />

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-12">
        {/* Hero Carousel */}
        <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
          {/* Slides */}
          <div className="relative w-full h-full">
            {[1, 2, 3].map((slide, index) => (
              <div
                key={slide}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  currentSlide === index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Background gradient instead of image */}
                <div className={`w-full h-full ${
                  slide === 1 ? 'bg-gradient-to-br from-blue-600 to-blue-400' :
                  slide === 2 ? 'bg-gradient-to-br from-purple-600 to-purple-400' :
                  'bg-gradient-to-br from-green-600 to-green-400'
                }`}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent">
                  <div className="h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      {t(`carousel.slide${slide}Title`)}
                    </h2>
                    <p className="text-lg md:text-xl text-white/90 mb-6">
                      {t(`carousel.slide${slide}Description`)}
                    </p>
                    <button
                      onClick={() => router.push('/dashboard/book-appointment/new')}
                      className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors w-fit"
                    >
                      {t('header.quickBook')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={previousSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Packages and Promotions */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {t('dashboard.packagesAndPromotions')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Package 1: Annual Health Check */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">{t('dashboard.package1')}</h3>
                  <Heart className="w-8 h-8" />
                </div>
                <p className="text-blue-100">{t('dashboard.suitableForAllAges')}</p>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  {t('dashboard.annualHealthCheckPackage')}
                </h4>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span className="text-gray-700">{t('dashboard.comprehensiveHealthCheck')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span className="text-gray-700">{t('dashboard.specializedEquipment')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span className="text-gray-700">{t('dashboard.yearRoundConsultation')}</span>
                  </li>
                </ul>
                <div className="mb-6">
                  <span className="text-gray-600">{t('dashboard.startingFrom')} </span>
                  <span className="text-3xl font-bold text-blue-600">3,500</span>
                  <span className="text-gray-600"> {t('dashboard.baht')}</span>
                </div>
                <button
                  onClick={() => router.push('/dashboard/book-appointment')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {t('dashboard.bookNow')}
                </button>
              </div>
            </div>

            {/* Package 2: Women's Health */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">{t('dashboard.package2')}</h3>
                  <Activity className="w-8 h-8" />
                </div>
                <p className="text-pink-100">{t('dashboard.specializedForWomen')}</p>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  {t('dashboard.womensHealthPackage')}
                </h4>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">✓</span>
                    <span className="text-gray-700">{t('dashboard.comprehensiveHealthCheck')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">✓</span>
                    <span className="text-gray-700">{t('dashboard.specializedEquipment')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 mt-1">✓</span>
                    <span className="text-gray-700">{t('dashboard.yearRoundConsultation')}</span>
                  </li>
                </ul>
                <div className="mb-6">
                  <span className="text-gray-600">{t('dashboard.startingFrom')} </span>
                  <span className="text-3xl font-bold text-pink-600">4,500</span>
                  <span className="text-gray-600"> {t('dashboard.baht')}</span>
                </div>
                <button
                  onClick={() => router.push('/dashboard/book-appointment')}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {t('dashboard.bookNow')}
                </button>
              </div>
            </div>

            {/* Package 3: Elderly Health */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">{t('dashboard.package3')}</h3>
                  <Stethoscope className="w-8 h-8" />
                </div>
                <p className="text-green-100">{t('dashboard.comprehensiveForElderly')}</p>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  {t('dashboard.elderlyHealthPackage')}
                </h4>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">{t('dashboard.comprehensiveHealthCheck')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">{t('dashboard.specializedEquipment')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">{t('dashboard.yearRoundConsultation')}</span>
                  </li>
                </ul>
                <div className="mb-6">
                  <span className="text-gray-600">{t('dashboard.startingFrom')} </span>
                  <span className="text-3xl font-bold text-green-600">5,000</span>
                  <span className="text-gray-600"> {t('dashboard.baht')}</span>
                </div>
                <button
                  onClick={() => router.push('/dashboard/book-appointment')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {t('dashboard.bookNow')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Centers Grid */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {t('dashboard.medicalCenters')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('dashboard.medicalCentersDescription')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {medicalCenters.map((center, index) => {
              const IconComponent = center.icon
              return (
                <div
                  key={center.id}
                  onClick={() => setSelectedCenter(center)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer text-center"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-${center.color}-100 to-${center.color}-200 rounded-full flex items-center justify-center`}>
                    <IconComponent className={`w-8 h-8 text-${center.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{center.name}</h3>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Unified Chatbot */}
      <UnifiedChatbot userId={user?.id} userRole="user" />

      {/* Medical Center Modal */}
      {selectedCenter && !selectedCenter.hasBranches && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCenter(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header with Icon */}
            <div className="relative bg-gradient-to-br from-gray-50 to-white p-8 border-b border-gray-200">
              <button
                onClick={() => setSelectedCenter(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>

              <div className="flex items-center gap-6">
                {(() => {
                  const IconComponent = selectedCenter.icon
                  return (
                    <div className={`w-20 h-20 bg-gradient-to-br from-${selectedCenter.color}-100 to-${selectedCenter.color}-200 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className={`w-10 h-10 text-${selectedCenter.color}-600`} />
                    </div>
                  )
                })()}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">{selectedCenter.name}</h2>
                  {selectedCenter.nameEn && (
                    <p className="text-gray-600">{selectedCenter.nameEn}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.aboutCenter')}</h3>
                <p className="text-gray-700 leading-relaxed">{selectedCenter.description}</p>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.treatmentServices')}</h3>
                <ul className="space-y-2">
                  {selectedCenter.services.map((service, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Book Appointment Button */}
              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => {
                    setSelectedCenter(null)
                    router.push('/dashboard/book-appointment')
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-blue-200 hover:shadow-xl"
                >
                  {t('dashboard.bookDoctorAppointment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branch Selection Modal for departments with multiple branches */}
      {selectedCenter && selectedCenter.hasBranches && !selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCenter(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('dashboard.selectBranch')}</h2>
              <p className="text-gray-600 mb-6">{t('dashboard.selectBranchToBook')}</p>

              <div className="space-y-3">
                {selectedCenter.branches.map((branch, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedBranch(branch)}
                    className="w-full p-4 border-2 border-gray-200 hover:border-blue-500 rounded-xl transition-all hover:shadow-md text-left"
                  >
                    <div className="font-semibold text-gray-900 text-lg">{t('dashboard.branchPrefix')}{branch}</div>
                    <div className="text-gray-500 text-sm mt-1">{selectedCenter.name}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedCenter(null)}
                className="w-full mt-4 py-3 text-gray-600 hover:text-gray-800 font-medium"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Detail Modal (after branch selection) */}
      {selectedCenter && selectedCenter.hasBranches && selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedCenter(null); setSelectedBranch(null); }}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header with Icon */}
            <div className="relative bg-gradient-to-br from-gray-50 to-white p-8 border-b border-gray-200">
              <button
                onClick={() => { setSelectedCenter(null); setSelectedBranch(null); }}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>

              <div className="flex items-center gap-6">
                {(() => {
                  const IconComponent = selectedCenter.icon
                  return (
                    <div className={`w-20 h-20 bg-gradient-to-br from-${selectedCenter.color}-100 to-${selectedCenter.color}-200 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className={`w-10 h-10 text-${selectedCenter.color}-600`} />
                    </div>
                  )
                })()}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">{selectedCenter.name}</h2>
                  <p className="text-blue-600 font-medium">{t('dashboard.branchPrefix')}{selectedBranch}</p>
                  {selectedCenter.nameEn && (
                    <p className="text-gray-600">{selectedCenter.nameEn}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.aboutCenter')}</h3>
                <p className="text-gray-700 leading-relaxed">{selectedCenter.description}</p>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.treatmentServices')}</h3>
                <ul className="space-y-2">
                  {selectedCenter.services.map((service, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Book Appointment Button */}
              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => { setSelectedBranch(null); }}
                  className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-colors"
                >
                  {t('dashboard.changeBranch')}
                </button>
                <button
                  onClick={() => {
                    setSelectedCenter(null)
                    setSelectedBranch(null)
                    router.push('/dashboard/book-appointment')
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-blue-200 hover:shadow-xl"
                >
                  {t('dashboard.bookDoctorAppointment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
