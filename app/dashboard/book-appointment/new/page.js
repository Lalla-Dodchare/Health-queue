'use client'

/**
 * New Booking Form (V2)
 * Supports 2-date booking system: Primary + Secondary dates
 * Features: Branch/Department/Doctor selection, flexible time slots, symptoms
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import DatePicker from '@/components/DatePicker'
import TimePicker from '@/components/TimePicker'
import {
  Calendar,
  Clock,
  FileText,
  ChevronRight,
  CheckCircle,
  Building2,
  Stethoscope,
  User,
  AlertCircle,
} from 'lucide-react'

export default function NewBookingPage() {
  const router = useRouter()
  const { t, language } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1: Selection, 2: Dates, 3: Details, 4: Summary

  // Selection data
  const [branches, setBranches] = useState([])
  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])

  // Form state
  const [formData, setFormData] = useState({
    branchId: '',
    departmentId: '',
    doctorId: '',
    primaryDate: '',
    primaryTime: '',
    primaryFlexible: false,
    secondaryDate: '',
    secondaryTime: '',
    secondaryFlexible: false,
    symptoms: '',
    notes: '',
  })

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      setLoading(false)
    }
    loadUser()
  }, [router])

  // Load branches
  useEffect(() => {
    const loadBranches = async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (!error && data) {
        setBranches(data)
      }
    }
    loadBranches()
  }, [])

  // Load departments when branch selected
  useEffect(() => {
    const loadDepartments = async () => {
      if (!formData.branchId) {
        setDepartments([])
        return
      }

      // Query through branch_departments junction table
      const { data, error } = await supabase
        .from('branch_departments')
        .select(`
          department_id,
          departments (
            id,
            name
          )
        `)
        .eq('branch_id', formData.branchId)
        .order('departments(name)', { ascending: true })

      if (!error && data) {
        const departments = data.map(bd => bd.departments).filter(Boolean)
        setDepartments(departments)
        console.log(`✅ Loaded ${departments.length} departments for branch ${formData.branchId}`)
      } else {
        console.error('Error loading departments:', error)
        setDepartments([])
      }
    }
    loadDepartments()
  }, [formData.branchId])

  // Load doctors when department selected
  useEffect(() => {
    const loadDoctors = async () => {
      if (!formData.departmentId) {
        setDoctors([])
        return
      }

      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('department_id', formData.departmentId)
        .eq('branch_id', formData.branchId)
        .eq('status', 'active')
        .order('contact_name')

      if (!error && data) {
        setDoctors(data)
      }
    }
    loadDoctors()
  }, [formData.departmentId])

  // Handle form changes
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Validate step
  const validateStep = () => {
    if (step === 1) {
      return formData.branchId && formData.departmentId && formData.doctorId
    }
    if (step === 2) {
      return (
        formData.primaryDate &&
        formData.primaryTime &&
        formData.secondaryDate &&
        formData.secondaryTime
      )
    }
    if (step === 3) {
      return formData.symptoms.trim().length > 0
    }
    return true
  }

  // Submit booking
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const { data, error} = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          doctor_id: formData.doctorId,
          department_id: formData.departmentId,
          branch_id: formData.branchId,
          primary_date: formData.primaryDate,
          primary_time: formData.primaryTime,
          primary_flexible: formData.primaryFlexible,
          secondary_date: formData.secondaryDate,
          secondary_time: formData.secondaryTime,
          secondary_flexible: formData.secondaryFlexible,
          symptoms: formData.symptoms,
          notes: formData.notes,
          status: 'pending',
          // Removed service_type temporarily to debug constraint issue
        })
        .select()

      if (error) throw error

      // Success - redirect to appointments
      router.push('/dashboard/appointments?success=true')
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert(language === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'Error creating appointment. Please try again.')
    } finally {
      setSubmitting(false)
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'th' ? 'จองนัดหมายแพทย์' : 'Book Appointment'}
          </h1>
          <p className="text-gray-600">
            {language === 'th'
              ? 'เลือกสาขา แผนก และแพทย์ที่ต้องการ จากนั้นเลือก 2 วันที่สะดวก'
              : 'Select branch, department, and doctor. Then choose 2 convenient dates.'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s, index) => (
              <div key={s} className="flex items-center" style={{ width: index < 3 ? '100%' : 'auto' }}>
                {/* Step Circle */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-500 transform ${
                      s === step
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-110 shadow-blue-300 ring-4 ring-blue-100'
                        : s < step
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white scale-100 shadow-green-200'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 scale-90'
                    }`}
                  >
                    {s < step ? (
                      <CheckCircle className="w-7 h-7 animate-in zoom-in duration-300" />
                    ) : (
                      <span className="transition-all duration-300">{s}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`mt-3 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      s === step
                        ? 'text-blue-600 scale-105 font-semibold'
                        : s < step
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {s === 1 && (language === 'th' ? 'เลือก' : 'Selection')}
                    {s === 2 && (language === 'th' ? 'วันที่' : 'Dates')}
                    {s === 3 && (language === 'th' ? 'รายละเอียด' : 'Details')}
                    {s === 4 && (language === 'th' ? 'สรุป' : 'Summary')}
                  </span>
                </div>

                {/* Connecting Line */}
                {s < 4 && (
                  <div className="flex-1 h-2 mx-6 relative min-w-[80px]">
                    {/* Background Line */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>

                    {/* Progress Line */}
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-700 ease-in-out ${
                        s < step
                          ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-200 w-full'
                          : 'w-0'
                      }`}
                      style={{
                        transformOrigin: 'left',
                      }}
                    ></div>

                    {/* Animated Shine Effect on Active Line */}
                    {s < step && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 rounded-full animate-pulse"></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Step 1: Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'th' ? 'เลือกสาขา แผนก และแพทย์' : 'Select Branch, Department & Doctor'}
              </h2>

              {/* Branch Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  {language === 'th' ? 'สาขา' : 'Branch'}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) => {
                    updateFormData('branchId', e.target.value)
                    updateFormData('departmentId', '')
                    updateFormData('doctorId', '')
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                >
                  <option value="">
                    {language === 'th' ? '-- เลือกสาขา --' : '-- Select Branch --'}
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Stethoscope className="w-5 h-5 text-blue-500" />
                  {language === 'th' ? 'แผนก' : 'Department'}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => {
                    updateFormData('departmentId', e.target.value)
                    updateFormData('doctorId', '')
                  }}
                  disabled={!formData.branchId}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {language === 'th' ? '-- เลือกแผนก --' : '-- Select Department --'}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-5 h-5 text-blue-500" />
                  {language === 'th' ? 'แพทย์' : 'Doctor'}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => updateFormData('doctorId', e.target.value)}
                  disabled={!formData.departmentId}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {language === 'th' ? '-- เลือกแพทย์ --' : '-- Select Doctor --'}
                  </option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.contact_name} {doctor.specialty && `(${doctor.specialty})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Dates */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'th' ? 'เลือกวันและเวลา (2 ตัวเลือก)' : 'Select Date & Time (2 Options)'}
              </h2>

              {/* Primary Date */}
              <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  {language === 'th' ? 'วันที่หลัก (ตัวเลือกที่ 1)' : 'Primary Date (Option 1)'}
                  <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <DatePicker
                    value={formData.primaryDate}
                    onChange={(date) => updateFormData('primaryDate', date)}
                    minDate={new Date().toISOString().split('T')[0]}
                    label={language === 'th' ? 'วันที่' : 'Date'}
                    required
                  />
                  <TimePicker
                    value={formData.primaryTime}
                    onChange={(time) => updateFormData('primaryTime', time)}
                    label={language === 'th' ? 'เวลา' : 'Time'}
                    required
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.primaryFlexible}
                    onChange={(e) => updateFormData('primaryFlexible', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  {language === 'th'
                    ? 'ยืดหยุ่นเวลา (ยอมรับเวลาใกล้เคียง ±1 ชั่วโมง)'
                    : 'Flexible time (Accept nearby time ±1 hour)'}
                </label>
              </div>

              {/* Secondary Date */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  {language === 'th' ? 'วันที่รอง (ตัวเลือกที่ 2)' : 'Secondary Date (Option 2)'}
                  <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <DatePicker
                    value={formData.secondaryDate}
                    onChange={(date) => updateFormData('secondaryDate', date)}
                    minDate={new Date().toISOString().split('T')[0]}
                    label={language === 'th' ? 'วันที่' : 'Date'}
                    required
                  />
                  <TimePicker
                    value={formData.secondaryTime}
                    onChange={(time) => updateFormData('secondaryTime', time)}
                    label={language === 'th' ? 'เวลา' : 'Time'}
                    required
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.secondaryFlexible}
                    onChange={(e) => updateFormData('secondaryFlexible', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  {language === 'th'
                    ? 'ยืดหยุ่นเวลา (ยอมรับเวลาใกล้เคียง ±1 ชั่วโมง)'
                    : 'Flexible time (Accept nearby time ±1 hour)'}
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  {language === 'th'
                    ? 'แอดมินจะติดต่อแพทย์เพื่อเช็คความพร้อม และจะอนุมัติวันที่ที่แพทย์สะดวก (วันหลัก หรือ วันรอง)'
                    : 'Admin will contact the doctor to check availability and approve the date that works (primary or secondary).'}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'th' ? 'อาการและหมายเหตุ' : 'Symptoms & Notes'}
              </h2>

              {/* Symptoms */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  {language === 'th' ? 'อาการหรือเหตุผลในการพบแพทย์' : 'Symptoms or Reason for Visit'}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => updateFormData('symptoms', e.target.value)}
                  rows={6}
                  placeholder={
                    language === 'th'
                      ? 'กรุณาอธิบายอาการหรือเหตุผลที่ต้องการพบแพทย์...'
                      : 'Please describe your symptoms or reason for the visit...'
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  {language === 'th' ? 'หมายเหตุเพิ่มเติม (ถ้ามี)' : 'Additional Notes (Optional)'}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  rows={4}
                  placeholder={
                    language === 'th'
                      ? 'ข้อมูลเพิ่มเติมที่ต้องการให้แพทย์ทราบ...'
                      : 'Additional information for the doctor...'
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'th' ? 'สรุปการจองนัดหมาย' : 'Booking Summary'}
              </h2>

              <div className="space-y-4">
                {/* Selection Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {language === 'th' ? 'สาขาและแพทย์' : 'Branch & Doctor'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{language === 'th' ? 'สาขา:' : 'Branch:'}</span>
                      <span className="font-medium">
                        {branches.find(b => b.id === formData.branchId)?.name}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{language === 'th' ? 'แผนก:' : 'Department:'}</span>
                      <span className="font-medium">
                        {departments.find(d => d.id === formData.departmentId)?.name}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{language === 'th' ? 'แพทย์:' : 'Doctor:'}</span>
                      <span className="font-medium">
                        {doctors.find(d => d.id === formData.doctorId)?.contact_name}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Dates Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {language === 'th' ? 'วันและเวลา' : 'Date & Time'}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-blue-900 font-medium mb-1">
                        {language === 'th' ? 'ตัวเลือกที่ 1 (วันหลัก)' : 'Option 1 (Primary)'}
                      </p>
                      <p className="text-gray-700">
                        📅 {new Date(formData.primaryDate).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
                        {' '} | ⏰ {formData.primaryTime}
                        {formData.primaryFlexible && (
                          <span className="ml-2 text-blue-600">
                            ({language === 'th' ? 'ยืดหยุ่นเวลา' : 'Flexible'})
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium mb-1">
                        {language === 'th' ? 'ตัวเลือกที่ 2 (วันรอง)' : 'Option 2 (Secondary)'}
                      </p>
                      <p className="text-gray-700">
                        📅 {new Date(formData.secondaryDate).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
                        {' '} | ⏰ {formData.secondaryTime}
                        {formData.secondaryFlexible && (
                          <span className="ml-2 text-blue-600">
                            ({language === 'th' ? 'ยืดหยุ่นเวลา' : 'Flexible'})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Symptoms Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {language === 'th' ? 'อาการ' : 'Symptoms'}
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.symptoms}</p>
                </div>

                {formData.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {language === 'th' ? 'หมายเหตุ' : 'Notes'}
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.notes}</p>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="font-medium mb-1">
                    {language === 'th' ? 'ขั้นตอนต่อไป' : 'Next Steps'}
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>{language === 'th' ? 'แอดมินจะติดต่อแพทย์ทางอีเมล' : 'Admin will contact the doctor by email'}</li>
                    <li>{language === 'th' ? 'แพทย์จะเลือกวันที่ที่สะดวก' : 'Doctor will choose a suitable date'}</li>
                    <li>{language === 'th' ? 'คุณจะได้รับการแจ้งเตือนผลการอนุมัติ' : 'You will receive approval notification'}</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                {language === 'th' ? 'ย้อนกลับ' : 'Back'}
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!validateStep()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {language === 'th' ? 'ถัดไป' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    {language === 'th' ? 'กำลังส่ง...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {language === 'th' ? 'ยืนยันการจอง' : 'Confirm Booking'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
