'use client'

/**
 * Book Appointment - Step 1: Select Hospital Branch
 * User selects which hospital branch they want to visit
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import { MapPin, ChevronRight, Clock, Phone } from 'lucide-react'

export default function SelectBranchPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [selectedBranch, setSelectedBranch] = useState(null)

  // Mock data - Replace with Supabase query
  // TODO: Fetch from Supabase: supabase.from('branches').select('*')
  const branches = [
    {
      id: 1,
      name_th: 'สาขาสีลม',
      name_en: 'Silom Branch',
      address_th: '123 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
      address_en: '123 Silom Road, Silom, Bang Rak, Bangkok 10500',
      phone: '02-123-4567',
      open_hours_th: 'จันทร์-ศุกร์ 8:00-20:00, เสาร์-อาทิตย์ 9:00-17:00',
      open_hours_en: 'Mon-Fri 8:00-20:00, Sat-Sun 9:00-17:00',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    },
    {
      id: 2,
      name_th: 'สาขาสุขุมวิท',
      name_en: 'Sukhumvit Branch',
      address_th: '456 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
      address_en: '456 Sukhumvit Road, Khlong Toei, Bangkok 10110',
      phone: '02-234-5678',
      open_hours_th: 'เปิดตลอด 24 ชั่วโมง',
      open_hours_en: 'Open 24 Hours',
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800',
    },
    {
      id: 3,
      name_th: 'สาขาเชียงใหม่',
      name_en: 'Chiang Mai Branch',
      address_th: '789 ถนนห้วยแก้ว ตำบลสุเทพ อำเภอเมือง เชียงใหม่ 50200',
      address_en: '789 Huay Kaew Road, Suthep, Mueang, Chiang Mai 50200',
      phone: '053-345-6789',
      open_hours_th: 'จันทร์-อาทิตย์ 7:00-21:00',
      open_hours_en: 'Mon-Sun 7:00-21:00',
      image: 'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?w=800',
    },
    {
      id: 4,
      name_th: 'สาขาภูเก็ต',
      name_en: 'Phuket Branch',
      address_th: '321 ถนนเจ้าฟ้า ตำบลตลาดใหญ่ อำเภอเมือง ภูเก็ต 83000',
      address_en: '321 Chao Fa Road, Talad Yai, Mueang, Phuket 83000',
      phone: '076-456-7890',
      open_hours_th: 'จันทร์-ศุกร์ 8:00-19:00, เสาร์-อาทิตย์ 9:00-16:00',
      open_hours_en: 'Mon-Fri 8:00-19:00, Sat-Sun 9:00-16:00',
      image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800',
    },
  ]

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch.id)
    // Save to localStorage or state management
    localStorage.setItem('booking_branch_id', branch.id.toString())
    localStorage.setItem('booking_branch_name', JSON.stringify({
      th: branch.name_th,
      en: branch.name_en,
    }))
    // Navigate to step 2
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
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">
                  {t('booking.step1')}
                </span>
              </div>
              <div className="w-16 h-1 bg-gray-300 mx-4"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">
                  {t('booking.step2')}
                </span>
              </div>
              <div className="w-16 h-1 bg-gray-300 mx-4"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">
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
            {t('booking.selectBranch')}
          </h1>
          <p className="text-gray-600">
            {t('booking.selectBranchDescription')}
          </p>
        </div>

        {/* Branch Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((branch) => (
            <div
              key={branch.id}
              onClick={() => handleSelectBranch(branch)}
              className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 ${
                selectedBranch === branch.id ? 'ring-4 ring-blue-500' : ''
              }`}
            >
              {/* Branch Image */}
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
                <img
                  src={branch.image}
                  alt={branch.name_en}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
                  {t('language') === 'th' ? branch.name_th : branch.name_en}
                </div>
              </div>

              {/* Branch Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('language') === 'th' ? branch.name_th : branch.name_en}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      {t('language') === 'th' ? branch.address_th : branch.address_en}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{branch.phone}</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      {t('language') === 'th' ? branch.open_hours_th : branch.open_hours_en}
                    </p>
                  </div>
                </div>

                <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  {t('booking.selectThisBranch')}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
