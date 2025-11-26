'use client'

/**
 * User Type Selection Page
 * Choose between Thai citizen or Foreigner
 * First step in registration flow
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { Flag, Globe, ArrowRight, Check } from 'lucide-react'

export default function UserTypePage() {
  const router = useRouter()
  const { t, language } = useTranslation()
  const [selectedType, setSelectedType] = useState(null)

  const handleContinue = () => {
    if (!selectedType) return

    if (selectedType === 'thai') {
      // Thai user - go to normal registration
      router.push('/register?type=thai')
    } else {
      // Foreigner - go to service type selection
      router.push('/register/service-type')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'th' ? 'ยินดีต้อนรับสู่ Health Queue' : 'Welcome to Health Queue'}
          </h1>
          <p className="text-xl text-gray-600">
            {language === 'th'
              ? 'กรุณาเลือกประเภทผู้ใช้งาน'
              : 'Please select your user type'}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Thai User */}
          <button
            onClick={() => setSelectedType('thai')}
            className={`
              relative p-8 rounded-2xl border-2 transition-all duration-300 text-left
              ${selectedType === 'thai'
                ? 'border-blue-500 bg-blue-50 shadow-xl scale-105'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
              }
            `}
          >
            {selectedType === 'thai' && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Flag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'th' ? 'คนไทย' : 'Thai Citizen'}
                </h2>
                <p className="text-sm text-gray-500">
                  {language === 'th' ? 'สำหรับพลเมืองไทย' : 'For Thai citizens'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'ใช้เลขบัตรประชาชนในการลงทะเบียน'
                    : 'Register with Thai National ID'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'จองนัดหมายแพทย์ได้ทันที'
                    : 'Book appointments immediately'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'รองรับระบบประกันสุขภาพไทย'
                    : 'Thai health insurance supported'}
                </span>
              </p>
            </div>
          </button>

          {/* Foreigner */}
          <button
            onClick={() => setSelectedType('foreigner')}
            className={`
              relative p-8 rounded-2xl border-2 transition-all duration-300 text-left
              ${selectedType === 'foreigner'
                ? 'border-purple-500 bg-purple-50 shadow-xl scale-105'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg'
              }
            `}
          >
            {selectedType === 'foreigner' && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'th' ? 'ชาวต่างชาติ' : 'Foreigner'}
                </h2>
                <p className="text-sm text-gray-500">
                  {language === 'th' ? 'สำหรับชาวต่างชาติ' : 'For international visitors'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'ใช้หมายเลขพาสปอร์ตในการลงทะเบียน'
                    : 'Register with passport number'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'รองรับ 5 ภาษา (TH, EN, ZH, JA, KO)'
                    : 'Support 5 languages (TH, EN, ZH, JA, KO)'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'มีบริการช่วยเหลือพิเศษ (แปลภาษา, ประสานงาน)'
                    : 'Special assistance available (translation, coordination)'}
                </span>
              </p>
            </div>
          </button>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedType}
            className={`
              inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all
              ${selectedType
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {language === 'th' ? 'ดำเนินการต่อ' : 'Continue'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-8">
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
