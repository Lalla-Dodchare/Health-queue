'use client'

/**
 * New Booking Form (V2)
 * Supports 2-date booking system: Primary + Secondary dates
 * Features: Branch/Department/Doctor selection, flexible time slots, symptoms
 */

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  Upload,
  X,
  File,
} from 'lucide-react'

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, language } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1: Selection, 2: Dates, 3: Details, 4: Summary

  // Get query parameters
  const preselectedDoctorId = searchParams.get('doctor')
  const preselectedBranchId = searchParams.get('branch')
  const preselectedDepartmentId = searchParams.get('department')

  // Selection data
  const [branches, setBranches] = useState([])
  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [dataLoaded, setDataLoaded] = useState(false)

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

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadError, setUploadError] = useState('')
  const MAX_FILES = 10
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/heic': '.heic'
  }

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('bookingFormData')
    const savedStep = localStorage.getItem('bookingStep')
    const savedFileNames = localStorage.getItem('bookingFileNames')

    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData)
        setFormData(parsed)
        console.log('✅ Loaded saved form data:', parsed)
      } catch (e) {
        console.error('Error loading saved form data:', e)
      }
    } else {
      // Reset form if no saved data
      setFormData({
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
    }

    if (savedStep) {
      setStep(parseInt(savedStep))
    } else {
      setStep(1)
    }

    // Note: ไฟล์จริงๆเก็บไม่ได้ใน localStorage (เป็น File object)
    // เราเก็บเฉพาะชื่อไฟล์เพื่อแสดงให้เห็นว่าเคยเลือกอะไรไว้
    // แต่ผู้ใช้ต้องเลือกไฟล์ใหม่ถ้า refresh หน้า
    if (savedFileNames) {
      console.log('📎 คุณเคยเลือกไฟล์ไว้:', JSON.parse(savedFileNames))
      console.log('⚠️ กรุณาเลือกไฟล์ใหม่อีกครั้ง (ไฟล์จริงไม่สามารถเก็บใน localStorage ได้)')
    }
  }, [])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (formData.branchId || formData.symptoms || formData.notes) {
      localStorage.setItem('bookingFormData', JSON.stringify(formData))
    }
  }, [formData])

  // Save current step to localStorage
  useEffect(() => {
    localStorage.setItem('bookingStep', step.toString())
  }, [step])

  // Save file names to localStorage when files change
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      const fileMetadata = uploadedFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      }))
      localStorage.setItem('bookingFileNames', JSON.stringify(fileMetadata))
      console.log('💾 Saved file metadata to localStorage:', fileMetadata)
    } else {
      localStorage.removeItem('bookingFileNames')
    }
  }, [uploadedFiles])

  // Load user with profile data
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      // Fetch complete profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (!error && profile) {
        setUser({
          ...currentUser,
          ...profile
        })
      } else {
        setUser(currentUser)
      }

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
        setDataLoaded(true)
        console.log('✅ Loaded branches:', data.length)
      }
    }
    loadBranches()
  }, [])

  // Load departments when branch selected OR when data becomes available
  useEffect(() => {
    const loadDepartments = async () => {
      if (!formData.branchId || !dataLoaded) {
        if (!formData.branchId) setDepartments([])
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
  }, [formData.branchId, dataLoaded])

  // Load doctors when department selected
  useEffect(() => {
    const loadDoctors = async () => {
      if (!formData.departmentId) {
        setDoctors([])
        return
      }

      const { data, error } = await supabase
        .from('doctors')
        .select('id, contact_name, specialty, department_id, branch_id, status')
        .eq('department_id', formData.departmentId)
        .eq('branch_id', formData.branchId)
        .eq('status', 'active')
        .order('contact_name')

      if (!error && data) {
        setDoctors(data)
      } else if (error) {
        console.error('Error loading doctors:', error)
      }
    }
    loadDoctors()
  }, [formData.departmentId])

  // Handle preselected doctor from query parameters
  useEffect(() => {
    if (preselectedDoctorId && preselectedBranchId && preselectedDepartmentId && dataLoaded) {
      console.log('🎯 Preselected doctor detected:', {
        doctor: preselectedDoctorId,
        branch: preselectedBranchId,
        department: preselectedDepartmentId
      })

      // Set form data
      setFormData(prev => ({
        ...prev,
        doctorId: preselectedDoctorId,
        branchId: preselectedBranchId,
        departmentId: preselectedDepartmentId
      }))

      // Skip to Step 2 (Dates)
      setStep(2)

      // Clear localStorage saved step
      localStorage.setItem('bookingStep', '2')
    }
  }, [preselectedDoctorId, preselectedBranchId, preselectedDepartmentId, dataLoaded])

  // Handle form changes
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setUploadError('')

    // เช็คจำนวนไฟล์
    if (uploadedFiles.length + files.length > MAX_FILES) {
      setUploadError(language === 'th'
        ? `สามารถอัพโหลดได้สูงสุด ${MAX_FILES} ไฟล์`
        : `Maximum ${MAX_FILES} files allowed`)
      return
    }

    // เช็คแต่ละไฟล์
    const validFiles = []
    for (const file of files) {
      // เช็คประเภทไฟล์
      if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
        setUploadError(language === 'th'
          ? `ไฟล์ ${file.name} ไม่ได้รับอนุญาต (รองรับเฉพาะ PDF, DOC, DOCX, JPG, PNG, HEIC)`
          : `File ${file.name} not allowed (Only PDF, DOC, DOCX, JPG, PNG, HEIC)`)
        continue
      }

      // เช็คขนาดไฟล์
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(language === 'th'
          ? `ไฟล์ ${file.name} ใหญ่เกินไป (สูงสุด 10MB)`
          : `File ${file.name} too large (Max 10MB)`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length > 0) {
      setUploadedFiles([...uploadedFiles, ...validFiles])
    }

    // Reset input
    e.target.value = ''
  }

  // Remove file
  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
    setUploadError('')
  }

  // Get file icon
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return '🖼️'
    } else if (file.type.includes('pdf')) {
      return '📄'
    } else {
      return '📝'
    }
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

  // Upload files to Supabase Storage
  const uploadFilesToStorage = async (appointmentId) => {
    if (uploadedFiles.length === 0) return []

    const uploadedUrls = []

    for (const file of uploadedFiles) {
      try {
        // สร้างชื่อไฟล์แบบ unique
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(7)
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${appointmentId}/${timestamp}_${randomString}.${fileExt}`

        // อัพโหลดไปยัง Supabase Storage
        const { data, error } = await supabase.storage
          .from('medical-documents')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Error uploading file:', file.name, error)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('medical-documents')
          .getPublicUrl(fileName)

        uploadedUrls.push({
          file_name: file.name,
          file_path: fileName,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size
        })
      } catch (err) {
        console.error('Error uploading file:', file.name, err)
      }
    }

    return uploadedUrls
  }

  // Submit booking
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // 1. สร้าง appointment ก่อน
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
        .single()

      if (error) throw error

      // 2. อัพโหลดไฟล์ (ถ้ามี)
      if (uploadedFiles.length > 0) {
        const fileData = await uploadFilesToStorage(data.id)

        // 3. บันทึกข้อมูลไฟล์ลงฐานข้อมูล
        if (fileData.length > 0) {
          const { error: fileError } = await supabase
            .from('appointment_files')
            .insert(
              fileData.map(file => ({
                appointment_id: data.id,
                file_name: file.file_name,
                file_path: file.file_path,
                file_url: file.file_url,
                file_type: file.file_type,
                file_size: file.file_size,
              }))
            )

          if (fileError) {
            console.error('Error saving file data:', fileError)
          }
        }
      }

      // Clear localStorage after successful booking
      localStorage.removeItem('bookingFormData')
      localStorage.removeItem('bookingStep')
      localStorage.removeItem('bookingFileNames')
      console.log('🗑️ Cleared all localStorage data')

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

              {/* File Upload */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-5 h-5 text-blue-500" />
                  {language === 'th' ? 'แนบไฟล์เอกสารเพิ่มเติม (ถ้ามี)' : 'Attach Medical Documents (Optional)'}
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  {language === 'th'
                    ? `รองรับไฟล์: PDF, DOC, DOCX, JPG, PNG, HEIC (สูงสุด ${MAX_FILES} ไฟล์, ขนาดไม่เกิน 10MB ต่อไฟล์)`
                    : `Supported: PDF, DOC, DOCX, JPG, PNG, HEIC (Max ${MAX_FILES} files, 10MB per file)`}
                </p>

                {/* Upload Button */}
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={uploadedFiles.length >= MAX_FILES}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                    uploadedFiles.length >= MAX_FILES
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-400'
                      : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-600'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <span className="font-medium">
                    {language === 'th'
                      ? `เลือกไฟล์ (${uploadedFiles.length}/${MAX_FILES})`
                      : `Choose Files (${uploadedFiles.length}/${MAX_FILES})`}
                  </span>
                </label>

                {/* Error Message */}
                {uploadError && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* File List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {language === 'th' ? 'ไฟล์ที่เลือก:' : 'Selected Files:'}
                    </p>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0">{getFileIcon(file)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="flex-shrink-0 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={language === 'th' ? 'ลบไฟล์' : 'Remove file'}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                {/* Patient Info Summary */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    {language === 'th' ? 'ข้อมูลผู้จอง' : 'Patient Information'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700">{language === 'th' ? 'ชื่อ-นามสกุล:' : 'Full Name:'}</span>
                      <span className="font-medium text-blue-900">{user?.full_name}</span>
                    </p>
                    {user?.date_of_birth && (
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700">{language === 'th' ? 'วันเกิด:' : 'Date of Birth:'}</span>
                        <span className="font-medium text-blue-900">
                          {new Date(user.date_of_birth).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </p>
                    )}
                    {user?.phone && (
                      <p className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700">{language === 'th' ? 'เบอร์โทรศัพท์:' : 'Phone:'}</span>
                        <span className="font-medium text-blue-900">{user.phone}</span>
                      </p>
                    )}
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <p className="flex items-start gap-2">
                        <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${user?.allergies ? 'text-red-600' : 'text-gray-400'}`} />
                        <div className="flex-1">
                          <span className="text-blue-700">{language === 'th' ? 'ประวัติการแพ้:' : 'Allergies:'}</span>
                          <p className={`font-medium mt-1 ${user?.allergies ? 'text-red-700' : 'text-gray-500'}`}>
                            {user?.allergies || (language === 'th' ? 'ผู้ใช้ไม่ได้ระบุ' : 'Not specified')}
                          </p>
                        </div>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-700">
                      {language === 'th'
                        ? '⚠️ กรุณาตรวจสอบข้อมูลให้ถูกต้อง'
                        : '⚠️ Please verify your information'}
                    </p>
                  </div>
                </div>

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

                {/* Files Summary */}
                {uploadedFiles.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {language === 'th' ? 'ไฟล์ที่แนบ' : 'Attached Files'} ({uploadedFiles.length})
                    </h3>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded"
                        >
                          <span className="text-xl">{getFileIcon(file)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
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
