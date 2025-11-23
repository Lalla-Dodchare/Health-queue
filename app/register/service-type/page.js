'use client'

/**
 * Service Type Selection Page (For Foreigners)
 * Choose between Self-Service or Agency-Assisted
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { UserCheck, Users, ArrowRight, Check, ArrowLeft, MessageSquare, Globe as GlobeIcon } from 'lucide-react'

export default function ServiceTypePage() {
  const router = useRouter()
  const { t, language } = useTranslation()
  const [selectedService, setSelectedService] = useState(null)

  const handleContinue = () => {
    if (!selectedService) return

    // Store service preference and continue to registration
    router.push(`/register/foreigner?service=${selectedService}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <GlobeIcon className="w-4 h-4" />
            {language === 'th' ? 'สำหรับชาวต่างชาติ' : 'For International Visitors'}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'th'
              ? 'เลือกประเภทการบริการ'
              : 'Choose Service Type'}
          </h1>
          <p className="text-xl text-gray-600">
            {language === 'th'
              ? 'คุณต้องการจัดการนัดหมายเอง หรือต้องการความช่วยเหลือ?'
              : 'Do you want to manage appointments yourself, or need assistance?'}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Self-Service */}
          <button
            onClick={() => setSelectedService('self')}
            className={`
              relative p-8 rounded-2xl border-2 transition-all duration-300 text-left
              ${selectedService === 'self'
                ? 'border-green-500 bg-green-50 shadow-xl scale-105'
                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-lg'
              }
            `}
          >
            {selectedService === 'self' && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'th' ? 'จัดการเอง' : 'Self-Service'}
                </h2>
                <p className="text-sm text-gray-500">
                  {language === 'th' ? 'ฉันจะจัดการเอง' : 'I can manage myself'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'จองนัดหมายผ่านระบบออนไลน์'
                    : 'Book appointments online'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'ดูประวัติการรักษาด้วยตนเอง'
                    : 'View medical records yourself'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'รับการแจ้งเตือนทางอีเมล'
                    : 'Receive email notifications'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'ใช้งานได้ทันที ไม่ต้องรอ'
                    : 'Immediate access, no waiting'}
                </span>
              </p>
            </div>

            <div className="bg-green-100 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-900 font-medium">
                {language === 'th'
                  ? '✨ เหมาะสำหรับผู้ที่พูดภาษาอังกฤษหรือไทยได้'
                  : '✨ Best for those who speak English or Thai'}
              </p>
            </div>
          </button>

          {/* Agency-Assisted */}
          <button
            onClick={() => setSelectedService('agency')}
            className={`
              relative p-8 rounded-2xl border-2 transition-all duration-300 text-left
              ${selectedService === 'agency'
                ? 'border-blue-500 bg-blue-50 shadow-xl scale-105'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
              }
            `}
          >
            {selectedService === 'agency' && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'th' ? 'ต้องการความช่วยเหลือ' : 'Need Assistance'}
                </h2>
                <p className="text-sm text-gray-500">
                  {language === 'th' ? 'มีเจ้าหน้าที่ช่วยเหลือ' : 'Staff will help you'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <p className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'มีเจ้าหน้าที่คอยช่วยเหลือตลอด'
                    : 'Dedicated staff assistance'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'บริการแปลภาษา (5 ภาษา)'
                    : 'Translation service (5 languages)'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'ประสานงานกับแพทย์และโรงพยาบาล'
                    : 'Coordinate with doctors & hospital'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>
                  {language === 'th'
                    ? 'แชทสดกับเจ้าหน้าที่ 24/7'
                    : 'Live chat with staff 24/7'}
                </span>
              </p>
            </div>

            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 flex gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 font-medium">
                {language === 'th'
                  ? 'เหมาะสำหรับผู้ที่ต้องการความช่วยเหลือด้านภาษาหรือการประสานงาน'
                  : 'Perfect for those needing language or coordination help'}
              </p>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            {language === 'th' ? 'หมายเหตุ' : 'Note'}
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              {language === 'th'
                ? '• คุณสามารถเปลี่ยนประเภทการบริการได้ในภายหลังผ่านหน้าโปรไฟล์'
                : '• You can change service type later through your profile settings'}
            </p>
            <p>
              {language === 'th'
                ? '• บริการช่วยเหลืออาจมีค่าใช้จ่ายเพิ่มเติม (ขึ้นอยู่กับโรงพยาบาล)'
                : '• Assistance service may have additional fees (depends on hospital)'}
            </p>
            <p>
              {language === 'th'
                ? '• ทั้งสองแบบสามารถจองนัดหมายและดูประวัติการรักษาได้'
                : '• Both options allow booking appointments and viewing medical records'}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {language === 'th' ? 'ย้อนกลับ' : 'Back'}
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedService}
            className={`
              flex-1 inline-flex items-center justify-center gap-3 px-8 py-3 rounded-xl font-semibold text-lg transition-all
              ${selectedService
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {language === 'th' ? 'ดำเนินการต่อ' : 'Continue'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
