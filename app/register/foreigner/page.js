'use client'

/**
 * Foreigner Registration Form (3 Steps)
 * Step 1: Personal Info
 * Step 2: Contact & Passport
 * Step 3: Language & Service Preference
 */

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { supabase } from '@/lib/supabase'
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Calendar,
  Flag,
} from 'lucide-react'

export default function ForeignerRegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceType = searchParams.get('service') || 'self'
  const { t, language, setLanguage } = useTranslation()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: '',
    dateOfBirth: '',
    gender: '',

    // Step 2: Contact & Passport
    email: '',
    phone: '',
    passportNumber: '',
    nationality: '',

    // Step 3: Language & Service
    preferredLanguage: language,
    servicePreference: serviceType,
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})

  // Update service preference from URL
  useEffect(() => {
    setFormData(prev => ({ ...prev, servicePreference: serviceType }))
  }, [serviceType])

  // Handle form changes
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Validate step
  const validateStep = () => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = language === 'th' ? 'กรุณากรอกชื่อ-นามสกุล' : 'Full name is required'
      if (!formData.dateOfBirth) newErrors.dateOfBirth = language === 'th' ? 'กรุณาเลือกวันเกิด' : 'Date of birth is required'
      if (!formData.gender) newErrors.gender = language === 'th' ? 'กรุณาเลือกเพศ' : 'Gender is required'
    }

    if (step === 2) {
      if (!formData.email.trim()) {
        newErrors.email = language === 'th' ? 'กรุณากรอกอีเมล' : 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = language === 'th' ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format'
      }
      if (!formData.phone.trim()) newErrors.phone = language === 'th' ? 'กรุณากรอกเบอร์โทรศัพท์' : 'Phone is required'
      if (!formData.passportNumber.trim()) newErrors.passportNumber = language === 'th' ? 'กรุณากรอกหมายเลขพาสปอร์ต' : 'Passport number is required'
      if (!formData.nationality.trim()) newErrors.nationality = language === 'th' ? 'กรุณากรอกสัญชาติ' : 'Nationality is required'
    }

    if (step === 3) {
      if (!formData.password) {
        newErrors.password = language === 'th' ? 'กรุณากรอกรหัสผ่าน' : 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = language === 'th' ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : 'Password must be at least 6 characters'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = language === 'th' ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  // Handle registration
  const handleRegister = async () => {
    if (!validateStep()) return

    setLoading(true)
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      })

      if (authError) throw authError

      // 2. Create/update profile with foreigner info
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          is_foreign: true,
          passport_number: formData.passportNumber,
          nationality: formData.nationality,
          preferred_language: formData.preferredLanguage,
          service_preference: formData.servicePreference,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      // Success - redirect to dashboard
      router.push('/dashboard?welcome=true')
    } catch (error) {
      console.error('Registration error:', error)
      alert(
        language === 'th'
          ? `เกิดข้อผิดพลาด: ${error.message}`
          : `Error: ${error.message}`
      )
    } finally {
      setLoading(false)
    }
  }

  const languages = [
    { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'th' ? 'ลงทะเบียนชาวต่างชาติ' : 'Foreigner Registration'}
          </h1>
          <p className="text-gray-600">
            {language === 'th'
              ? `ประเภทบริการ: ${serviceType === 'self' ? 'จัดการเอง' : 'ต้องการความช่วยเหลือ'}`
              : `Service Type: ${serviceType === 'self' ? 'Self-Service' : 'Need Assistance'}`}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    s === step
                      ? 'bg-purple-500 text-white'
                      : s < step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? <CheckCircle className="w-6 h-6" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      s < step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className={step === 1 ? 'text-purple-600 font-medium' : 'text-gray-500'}>
              {language === 'th' ? 'ข้อมูลส่วนตัว' : 'Personal Info'}
            </span>
            <span className={step === 2 ? 'text-purple-600 font-medium' : 'text-gray-500'}>
              {language === 'th' ? 'ติดต่อ & พาสปอร์ต' : 'Contact & Passport'}
            </span>
            <span className={step === 3 ? 'text-purple-600 font-medium' : 'text-gray-500'}>
              {language === 'th' ? 'ภาษา & บริการ' : 'Language & Service'}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {language === 'th' ? 'ข้อมูลส่วนตัว' : 'Personal Information'}
              </h2>

              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {language === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateFormData('fullName', e.target.value)}
                  placeholder={language === 'th' ? 'John Smith' : 'Enter your full name'}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500/20 transition-colors ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {language === 'th' ? 'วันเกิด' : 'Date of Birth'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500/20 transition-colors ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  {language === 'th' ? 'เพศ' : 'Gender'}
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['male', 'female', 'other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updateFormData('gender', g)}
                      className={`py-3 px-4 border-2 rounded-lg font-medium transition-colors ${
                        formData.gender === g
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      {g === 'male' && (language === 'th' ? 'ชาย' : 'Male')}
                      {g === 'female' && (language === 'th' ? 'หญิง' : 'Female')}
                      {g === 'other' && (language === 'th' ? 'อื่นๆ' : 'Other')}
                    </button>
                  ))}
                </div>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Contact & Passport */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {language === 'th' ? 'ข้อมูลติดต่อและพาสปอร์ต' : 'Contact & Passport Information'}
              </h2>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {language === 'th' ? 'อีเมล' : 'Email'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="example@email.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500/20 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {language === 'th' ? 'เบอร์โทรศัพท์' : 'Phone Number'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+66 12 345 6789"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500/20 transition-colors ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* Passport Number */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  {language === 'th' ? 'หมายเลขพาสปอร์ต' : 'Passport Number'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => updateFormData('passportNumber', e.target.value.toUpperCase())}
                  placeholder="AB1234567"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500/20 transition-colors ${
                    errors.passportNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.passportNumber && <p className="text-red-500 text-sm mt-1">{errors.passportNumber}</p>}
              </div>

              {/* Nationality */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Flag className="w-4 h-4 text-gray-400" />
                  {language === 'th' ? 'สัญชาติ' : 'Nationality'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => updateFormData('nationality', e.target.value)}
                  placeholder={language === 'th' ? 'เช่น American, Chinese, Japanese' : 'e.g. American, Chinese, Japanese'}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500/20 transition-colors ${
                    errors.nationality ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Language & Password */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {language === 'th' ? 'ภาษาและรหัสผ่าน' : 'Language & Password'}
              </h2>

              {/* Preferred Language */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  {language === 'th' ? 'ภาษาที่ต้องการใช้' : 'Preferred Language'}
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        updateFormData('preferredLanguage', lang.code)
                        setLanguage(lang.code)
                      }}
                      className={`py-3 px-4 border-2 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center ${
                        formData.preferredLanguage === lang.code
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  {language === 'th' ? 'รหัสผ่าน' : 'Password'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  placeholder={language === 'th' ? 'อย่างน้อย 6 ตัวอักษร' : 'At least 6 characters'}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500/20 transition-colors ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  {language === 'th' ? 'ยืนยันรหัสผ่าน' : 'Confirm Password'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  placeholder={language === 'th' ? 'พิมพ์รหัสผ่านอีกครั้ง' : 'Re-enter password'}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500/20 transition-colors ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Service Type Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {language === 'th' ? 'ประเภทบริการที่เลือก:' : 'Selected Service Type:'}
                </h3>
                <p className="text-sm text-gray-700">
                  {formData.servicePreference === 'self'
                    ? (language === 'th' ? '✅ จัดการเอง (Self-Service)' : '✅ Self-Service')
                    : (language === 'th' ? '✅ ต้องการความช่วยเหลือ (Agency-Assisted)' : '✅ Need Assistance')}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {language === 'th' ? 'ย้อนกลับ' : 'Back'}
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                {language === 'th' ? 'ถัดไป' : 'Next'}
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    {language === 'th' ? 'กำลังลงทะเบียน...' : 'Registering...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {language === 'th' ? 'ลงทะเบียน' : 'Register'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/login')}
            className="text-gray-600 hover:text-gray-900 text-sm underline"
          >
            {language === 'th' ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
