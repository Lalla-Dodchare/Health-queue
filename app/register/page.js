'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { registerWithEmail } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { UserPlus, ArrowLeft, Flag } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      setLoading(false)
      return
    }

    if (!formData.fullName.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล')
      setLoading(false)
      return
    }

    // Validate Thai-specific fields
    if (userType === 'thai') {
      if (!formData.phone.trim()) {
        setError('กรุณากรอกเบอร์โทรศัพท์')
        setLoading(false)
        return
      }
      if (!formData.idCard.trim()) {
        setError('กรุณากรอกเลขบัตรประชาชน')
        setLoading(false)
        return
      }
      if (formData.idCard.length !== 13) {
        setError('เลขบัตรประชาชนต้องเป็น 13 หลัก')
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
      setError(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
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
              สมัครสมาชิกสำเร็จ!
            </h2>
            <p className="text-gray-600 mb-6">
              กำลังนำคุณไปหน้าเข้าสู่ระบบ...
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
            กลับไปหน้าเข้าสู่ระบบ
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
              {userType === 'thai' ? 'ลงทะเบียนคนไทย' : 'สมัครสมาชิก'}
            </h1>
            <p className="text-gray-600">
              {userType === 'thai'
                ? 'สำหรับพลเมืองไทย - ใช้เลขบัตรประชาชน'
                : 'สร้างบัญชีเพื่อใช้งาน Health Queue'}
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ชื่อ-นามสกุล *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="นายสมชาย ใจดี"
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
                    เลขบัตรประชาชน * (13 หลัก)
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
                    placeholder="1234567890123"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    เบอร์โทรศัพท์ *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="08x-xxx-xxxx"
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
                อีเมล *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                รหัสผ่าน * (อย่างน้อย 6 ตัวอักษร)
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
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ยืนยันรหัสผ่าน *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
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
                  กำลังสมัครสมาชิก...
                </span>
              ) : (
                'สมัครสมาชิก'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              มีบัญชีอยู่แล้ว?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              ℹ️ บัญชีที่สร้างจะเป็นบัญชีผู้ใช้ทั่วไป สามารถจองนัดหมายแพทย์ได้ทันที
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
