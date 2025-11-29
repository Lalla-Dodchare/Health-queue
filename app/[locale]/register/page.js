'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { registerWithEmail } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'
import { UserPlus, ArrowLeft, Flag, Mail, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') // 'thai' or null (default)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    idCard: '', // For Thai users only
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // OTP state
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Request OTP
  const handleRequestOTP = async () => {
    setOtpError('')

    // Validate email
    if (!formData.email || !formData.email.includes('@')) {
      setOtpError('Please enter a valid email address')
      return
    }

    setOtpLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (!data.success) {
        setOtpError(data.error || 'Failed to send OTP')
        setOtpLoading(false)
        return
      }

      setOtpSent(true)
      setCountdown(600) // 10 minutes countdown
      setOtpLoading(false)
      alert('✅ OTP sent to your email! Please check your inbox.')
    } catch (error) {
      console.error('Error requesting OTP:', error)
      setOtpError('Failed to send OTP. Please try again.')
      setOtpLoading(false)
    }
  }

  // Verify OTP
  const handleVerifyOTP = async () => {
    setOtpError('')

    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP')
      return
    }

    setOtpLoading(true)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: otpCode })
      })

      const data = await response.json()

      if (!data.success) {
        setOtpError(data.error || 'Invalid OTP')
        setOtpLoading(false)
        return
      }

      setOtpVerified(true)
      setOtpLoading(false)
      alert('✅ Email verified successfully!')
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setOtpError('Failed to verify OTP. Please try again.')
      setOtpLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Check if email is verified
    if (!otpVerified) {
      setError('Please verify your email with OTP first')
      setLoading(false)
      return
    }

    // Validation
    if (formData.password.length < 6) {
      setError(t('register.errors.passwordTooShort'))
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.errors.passwordMismatch'))
      setLoading(false)
      return
    }

    if (!formData.fullName.trim()) {
      setError(t('register.errors.nameRequired'))
      setLoading(false)
      return
    }

    // Validate Thai-specific fields
    if (userType === 'thai') {
      if (!formData.phone.trim()) {
        setError(t('register.errors.phoneRequired'))
        setLoading(false)
        return
      }
      if (!formData.idCard.trim()) {
        setError(t('register.errors.idCardRequired'))
        setLoading(false)
        return
      }
      if (formData.idCard.length !== 13) {
        setError(t('register.errors.idCardInvalid'))
        setLoading(false)
        return
      }
    }

    try {
      console.log('🔵 Starting registration...')

      const result = await registerWithEmail(
        formData.email,
        formData.password,
        formData.fullName
      )

      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Update profile with Thai-specific data
      if (userType === 'thai' && result.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: formData.phone,
            id_card: formData.idCard,
            is_foreign: false,
            preferred_language: 'th',
            updated_at: new Date().toISOString(),
          })
          .eq('id', result.user.id)

        if (profileError) {
          console.error('Profile update error:', profileError)
        }
      }

      console.log('✅ Registration successful!')
      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      console.error('❌ Registration error:', err)
      setError(err.message || t('register.errors.registrationFailed'))
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('register.success.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('register.success.redirecting')}
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Back Button */}
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('register.backToLogin')}
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${userType === 'thai' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                {userType === 'thai' ? (
                  <Flag className="w-8 h-8 text-blue-600" />
                ) : (
                  <UserPlus className="w-8 h-8 text-purple-600" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {userType === 'thai' ? t('register.thaiTitle') : t('register.title')}
            </h1>
            <p className="text-gray-600">
              {userType === 'thai'
                ? t('register.thaiSubtitle')
                : t('register.subtitle')}
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('register.fullName')}
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder={t('register.fullNamePlaceholder')}
                disabled={loading}
              />
            </div>

            {/* Thai-specific fields */}
            {userType === 'thai' && (
              <>
                <div>
                  <label
                    htmlFor="idCard"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t('register.idCard')}
                  </label>
                  <input
                    id="idCard"
                    name="idCard"
                    type="text"
                    value={formData.idCard}
                    onChange={handleChange}
                    required
                    maxLength={13}
                    pattern="[0-9]{13}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder={t('register.idCardPlaceholder')}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t('register.phone')}
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder={t('register.phonePlaceholder')}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('register.email')}
              </label>
              <div className="flex gap-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={t('register.emailPlaceholder')}
                  disabled={loading || otpVerified}
                />
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={otpLoading || otpVerified || countdown > 0 || !formData.email}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition whitespace-nowrap font-medium"
                >
                  {otpVerified ? '✓ Verified' : otpLoading ? 'Sending...' : countdown > 0 ? `${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}` : 'Request OTP'}
                </button>
              </div>

              {/* OTP Input Field - Shows after OTP is sent */}
              {otpSent && !otpVerified && (
                <div className="mt-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-center text-lg font-mono tracking-widest"
                      disabled={otpLoading}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={otpLoading || otpCode.length !== 6}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                    >
                      {otpLoading ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    ⏱️ OTP expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')} minutes
                  </p>
                </div>
              )}

              {otpError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{otpError}</p>
                </div>
              )}

              {otpVerified && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">✅ Email verified successfully!</p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('register.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder={t('register.passwordPlaceholder')}
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('register.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder={t('register.passwordPlaceholder')}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('register.registering')}
                </span>
              ) : (
                t('register.submitButton')
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('register.hasAccount')}{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t('register.loginLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
