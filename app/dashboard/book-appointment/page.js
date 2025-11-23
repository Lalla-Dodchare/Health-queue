'use client'

/**
 * Book Appointment Page
 * Simple booking page that redirects to the main booking flow
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'

export default function BookAppointmentPage() {
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    // Redirect to the new booking flow (V2) - use replace to avoid history stack issues
    router.replace('/dashboard/book-appointment/new')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600">{t('common.loading') || 'กำลังโหลด...'}</p>
        <p className="text-sm text-gray-500 mt-2">
          {t('booking.redirecting') || 'กำลังนำคุณไปหน้าจองนัดหมาย...'}
        </p>
      </div>
    </div>
  )
}
