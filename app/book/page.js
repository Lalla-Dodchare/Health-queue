'use client'

/**
 * Appointment Booking Page
 * Multi-step booking flow: Branch → Clinic → Doctor → Date/Time
 *
 * TODO (for later): Add option to book for family members/others
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import { Calendar, Clock, MapPin, Stethoscope, User, ChevronRight, ChevronLeft, Building2, Search, Filter, Star, X } from 'lucide-react'
import FavoriteButton from '@/components/FavoriteButton'

export default function BookAppointmentPage() {
  const router = useRouter()
  const { t, language } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)

  // Booking data
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [notes, setNotes] = useState('')
  const [symptoms, setSymptoms] = useState('')

  // Data lists
  const [branches, setBranches] = useState([])
  const [clinics, setClinics] = useState([])
  const [doctors, setDoctors] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    minRating: 0,
    sortBy: 'name' // name, rating, experience
  })

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      await loadBranches()
      setLoading(false)
    }
    checkAuth()
  }, [router])

  // Load hospital branches
  const loadBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name_th', { ascending: true })

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error loading branches:', error)
    }
  }

  // Load clinics when branch is selected
  const loadClinics = async (branchId) => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('branch_id', branchId)
        .order('name_th', { ascending: true })

      if (error) throw error
      setClinics(data || [])
    } catch (error) {
      console.error('Error loading clinics:', error)
    }
  }

  // Load doctors when clinic is selected
  const loadDoctors = async (clinicId) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('name_th', { ascending: true })

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('Error loading doctors:', error)
    }
  }

  // Handle branch selection
  const handleSelectBranch = async (branch) => {
    setSelectedBranch(branch)
    setSelectedClinic(null)
    setSelectedDoctor(null)
    await loadClinics(branch.id)
    setCurrentStep(2)
  }

  // Handle clinic selection
  const handleSelectClinic = async (clinic) => {
    setSelectedClinic(clinic)
    setSelectedDoctor(null)
    await loadDoctors(clinic.id)
    setCurrentStep(3)
  }

  // Handle doctor selection
  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    setCurrentStep(4)
  }

  // Filter and sort doctors
  const getFilteredDoctors = () => {
    let filtered = [...doctors]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(doctor => {
        const name = (language === 'th' ? doctor.name_th : doctor.name_en) || doctor.full_name || ''
        const specialty = (language === 'th' ? doctor.specialty_th : doctor.specialty_en) || doctor.specialization || ''
        return name.toLowerCase().includes(query) || specialty.toLowerCase().includes(query)
      })
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(doctor => (doctor.average_rating || 0) >= filters.minRating)
    }

    // Sort
    filtered.sort((a, b) => {
      if (filters.sortBy === 'rating') {
        return (b.average_rating || 0) - (a.average_rating || 0)
      } else if (filters.sortBy === 'experience') {
        return (b.experience_years || 0) - (a.experience_years || 0)
      } else {
        // Sort by name
        const nameA = (language === 'th' ? a.name_th : a.name_en) || a.full_name || ''
        const nameB = (language === 'th' ? b.name_th : b.name_en) || b.full_name || ''
        return nameA.localeCompare(nameB)
      }
    })

    return filtered
  }

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert(t('booking.selectDateTimeFirst') || 'กรุณาเลือกวันและเวลา')
      return
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          doctor_id: selectedDoctor.id,
          branch_id: selectedBranch.id,
          clinic_id: selectedClinic.id,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          symptoms: symptoms.trim() || null,
          notes: notes.trim() || null,
          status: 'confirmed',
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      alert(t('booking.confirmationMessage') || 'จองนัดหมายสำเร็จ!')
      router.push('/dashboard/appointments')
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert(t('common.error') || 'เกิดข้อผิดพลาด')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            {t('booking.back') || 'ย้อนกลับ'}
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard.bookAppointment') || 'จองนัดหมาย'}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.bookAppointmentDesc') || 'จองคิวพบแพทย์ล่วงหน้า'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                  <span
                    className={`text-sm font-medium hidden md:block ${
                      currentStep >= step ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {t(`booking.step${step}`)}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Branch */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('booking.selectBranch') || 'เลือกสาขาโรงพยาบาล'}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('booking.selectBranchDescription') || 'กรุณาเลือกสาขาที่คุณต้องการเข้ารับบริการ'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleSelectBranch(branch)}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                      <Building2 className="w-6 h-6 text-blue-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {branch.name_th || branch.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {branch.address}
                      </p>
                      {branch.phone && (
                        <p className="text-sm text-gray-500">
                          โทร: {branch.phone}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                </button>
              ))}
            </div>

            {branches.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                ไม่มีข้อมูลสาขา กรุณาติดต่อผู้ดูแลระบบ
              </p>
            )}
          </div>
        )}

        {/* Step 2: Select Clinic */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('booking.selectClinic') || 'เลือกคลินิก/แผนก'}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('booking.selectClinicDescription') || 'กรุณาเลือกคลินิกหรือแผนกที่คุณต้องการพบแพทย์'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clinics.map((clinic) => (
                <button
                  key={clinic.id}
                  onClick={() => handleSelectClinic(clinic)}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors">
                      <Stethoscope className="w-6 h-6 text-green-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {clinic.name_th || clinic.name}
                      </h3>
                      {clinic.description && (
                        <p className="text-sm text-gray-600">
                          {clinic.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                  </div>
                </button>
              ))}
            </div>

            {clinics.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                ไม่มีข้อมูลคลินิก กรุณาติดต่อผู้ดูแลระบบ
              </p>
            )}

            <button
              onClick={() => setCurrentStep(1)}
              className="mt-6 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('booking.back') || 'ย้อนกลับ'}
            </button>
          </div>
        )}

        {/* Step 3: Select Doctor */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('booking.selectDoctor') || 'เลือกแพทย์'}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('booking.selectDoctorDescription') || 'กรุณาเลือกแพทย์ที่คุณต้องการพบ'}
            </p>

            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'th' ? 'ค้นหาชื่อแพทย์หรือแผนก...' : 'Search doctor name or department...'}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                    showFilters ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  {language === 'th' ? 'ตัวกรอง' : 'Filters'}
                </button>

                {/* Quick Filter Chips */}
                <div className="flex gap-2 flex-wrap items-center">
                  <button
                    onClick={() => setFilters({ ...filters, sortBy: 'rating' })}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      filters.sortBy === 'rating'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 inline mr-1" />
                    {language === 'th' ? 'คะแนนสูงสุด' : 'Top Rated'}
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, sortBy: 'experience' })}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      filters.sortBy === 'experience'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {language === 'th' ? 'ประสบการณ์มาก' : 'Most Experienced'}
                  </button>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {/* Minimum Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'th' ? 'คะแนนขั้นต่ำ' : 'Minimum Rating'}
                    </label>
                    <div className="flex gap-2">
                      {[0, 3, 4, 4.5, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setFilters({ ...filters, minRating: rating })}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filters.minRating === rating
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {rating === 0 ? (language === 'th' ? 'ทั้งหมด' : 'All') : `${rating}+ ⭐`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'th' ? 'เรียงตาม' : 'Sort By'}
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="name">{language === 'th' ? 'ชื่อ (ก-ฮ)' : 'Name (A-Z)'}</option>
                      <option value="rating">{language === 'th' ? 'คะแนนสูงสุด' : 'Highest Rating'}</option>
                      <option value="experience">{language === 'th' ? 'ประสบการณ์มากสุด' : 'Most Experience'}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              {language === 'th' ? 'พบ' : 'Found'} {getFilteredDoctors().length} {language === 'th' ? 'แพทย์' : 'doctor(s)'}
            </div>

            <div className="space-y-4">
              {getFilteredDoctors().map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => handleSelectDoctor(doctor)}
                  className="w-full border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition-all text-left group relative"
                >
                  {/* Favorite Button */}
                  <div className="absolute top-4 right-4 z-10">
                    <FavoriteButton doctorId={doctor.id} language={language} />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                      <User className="w-8 h-8 text-purple-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {doctor.name_th || doctor.full_name}
                        </h3>
                        {doctor.average_rating > 0 && (
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-gray-900">
                              {doctor.average_rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({doctor.review_count || 0})
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {doctor.specialty_th || doctor.specialization}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {doctor.education && (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            {doctor.education}
                          </span>
                        )}
                        {doctor.experience_years && (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            {doctor.experience_years} {language === 'th' ? 'ปีประสบการณ์' : 'years exp.'}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                  </div>
                </button>
              ))}
            </div>

            {doctors.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {language === 'th' ? 'ไม่มีแพทย์ในคลินิกนี้ กรุณาเลือกคลินิกอื่น' : 'No doctors in this clinic'}
              </p>
            ) : getFilteredDoctors().length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium mb-2">
                  {language === 'th' ? 'ไม่พบแพทย์ที่ค้นหา' : 'No doctors found'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {language === 'th' ? 'ลองค้นหาด้วยคำอื่น หรือปรับตัวกรอง' : 'Try different keywords or adjust filters'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilters({ minRating: 0, sortBy: 'name' })
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {language === 'th' ? 'ล้างการค้นหา' : 'Clear Search'}
                </button>
              </div>
            ) : null}

            <button
              onClick={() => setCurrentStep(2)}
              className="mt-6 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('booking.back') || 'ย้อนกลับ'}
            </button>
          </div>
        )}

        {/* Step 4: Select Date & Time */}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('booking.selectDateTime') || 'เลือกวันและเวลา'}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('booking.selectDateTimeDescription') || 'กรุณาเลือกวันและเวลาที่คุณต้องการนัดหมาย'}
            </p>

            {/* Booking Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                {t('booking.bookingSummary') || 'สรุปการจอง'}
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">สาขา:</span> {selectedBranch?.name_th}</p>
                <p><span className="font-medium">คลินิก:</span> {selectedClinic?.name_th}</p>
                <p><span className="font-medium">แพทย์:</span> {selectedDoctor?.name_th}</p>
              </div>
            </div>

            {/* Date Picker (Simple version - you can enhance this) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('booking.date') || 'วันที่'}
              </label>
              <input
                type="date"
                value={selectedDate || ''}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Time Picker */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('booking.time') || 'เวลา'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedTime === time
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms/Chief Complaint */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'th' ? 'อาการเบื้องต้น' : 'Symptoms'}
                <span className="text-gray-500 font-normal ml-1">
                  ({language === 'th' ? 'ถ้ามี' : 'Optional'})
                </span>
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder={language === 'th' ? 'เช่น ปวดศีรษะ, ปวดท้อง, ไข้...' : 'e.g. Headache, stomach pain, fever...'}
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {symptoms.length}/200 {language === 'th' ? 'ตัวอักษร' : 'characters'}
              </p>
            </div>

            {/* Additional Notes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'th' ? 'หมายเหตุเพิ่มเติม' : 'Additional Notes'}
                <span className="text-gray-500 font-normal ml-1">
                  ({language === 'th' ? 'ถ้ามี' : 'Optional'})
                </span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'th' ? 'เช่น แพ้ยา, ประวัติโรคประจำตัว, ข้อควรระวัง...' : 'e.g. Drug allergies, medical history, precautions...'}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {notes.length}/500 {language === 'th' ? 'ตัวอักษร' : 'characters'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('booking.back') || 'ย้อนกลับ'}
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t('booking.confirmBooking') || 'ยืนยันการจอง'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
