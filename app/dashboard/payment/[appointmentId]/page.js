'use client'

/**
 * Payment Page
 * Show QR code for payment and payment details
 * Calculate points earned (100 baht = 1 point)
 */

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import QRCode from 'react-qr-code'
import {
  CreditCard,
  QrCode as QrCodeIcon,
  CheckCircle,
  Clock,
  Calendar,
  User as UserIcon,
  Award,
  ArrowLeft,
  Loader2,
  Download
} from 'lucide-react'
import { generateReceipt } from '@/lib/pdfGenerator'

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const { t, language } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [appointment, setAppointment] = useState(null)
  const [payment, setPayment] = useState(null)
  const [qrData, setQrData] = useState(null)
  const [amount, setAmount] = useState(1500) // Default amount

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      await loadAppointmentAndPayment(currentUser.id)
      setLoading(false)
    }
    checkAuth()
  }, [params.appointmentId])

  const loadAppointmentAndPayment = async (userId) => {
    try {
      // Load appointment details
      const { data: aptData, error: aptError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          doctors (full_name, name_th, name_en),
          branches (name, name_th, name_en),
          clinics (name, name_th, name_en)
        `)
        .eq('id', params.appointmentId)
        .eq('user_id', userId)
        .single()

      if (aptError) throw aptError
      setAppointment(aptData)

      // Check if payment already exists
      const { data: payData, error: payError } = await supabase
        .from('payments')
        .select('*')
        .eq('appointment_id', params.appointmentId)
        .single()

      if (payData) {
        setPayment(payData)
        setAmount(parseFloat(payData.amount))
        if (payData.qr_code_data) {
          setQrData(payData.qr_code_data)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const generateQRCode = async () => {
    setGenerating(true)
    try {
      // Call API to generate QR code
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error)
      }

      setQrData(data.qrData)

      // Calculate points (100 baht = 1 point)
      const pointsEarned = Math.floor(amount / 100)

      // Save payment to database
      const { error } = await supabase
        .from('payments')
        .insert({
          appointment_id: params.appointmentId,
          user_id: user.id,
          amount: amount,
          payment_method: 'qr_code',
          payment_status: 'pending',
          qr_code_data: data.qrData,
          qr_code_ref: data.refNumber,
          points_earned: pointsEarned,
          points_calculation: `${amount} baht / 100 = ${pointsEarned} points`
        })

      if (error) throw error

      alert(language === 'th' ? 'สร้าง QR Code สำเร็จ' : 'QR Code generated successfully')
      await loadAppointmentAndPayment(user.id)
    } catch (error) {
      console.error('Error generating QR:', error)
      alert(t('common.error') || 'เกิดข้อผิดพลาด')
    } finally {
      setGenerating(false)
    }
  }

  const calculatePoints = () => Math.floor(amount / 100)

  const handleDownloadReceipt = () => {
    if (!payment) return

    const receiptData = {
      id: payment.id,
      created_at: payment.created_at,
      user_name: user?.full_name || user?.name || 'N/A',
      amount: parseFloat(payment.amount),
      payment_method: payment.payment_method,
      status: payment.payment_status,
      doctor_name: language === 'th'
        ? appointment.doctors?.name_th || appointment.doctors?.full_name
        : appointment.doctors?.name_en || appointment.doctors?.full_name,
      appointment_date: appointment.appointment_date
    }

    generateReceipt(receiptData, language)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <UserHeader />
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <UserHeader />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600">{language === 'th' ? 'ไม่พบข้อมูลนัดหมาย' : 'Appointment not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <UserHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'th' ? 'กลับ' : 'Back'}
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'th' ? 'ชำระเงิน' : 'Payment'}
          </h1>
          <p className="text-gray-600">
            {language === 'th' ? 'สแกน QR Code เพื่อชำระเงิน' : 'Scan QR Code to pay'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Appointment Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'th' ? 'รายละเอียดนัดหมาย' : 'Appointment Details'}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">
                    {language === 'th' ? 'แพทย์' : 'Doctor'}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {language === 'th'
                      ? appointment.doctors?.name_th || appointment.doctors?.full_name
                      : appointment.doctors?.name_en || appointment.doctors?.full_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">
                    {language === 'th' ? 'วันที่' : 'Date'}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date(appointment.appointment_date).toLocaleDateString(
                      language === 'th' ? 'th-TH' : 'en-US'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">
                    {language === 'th' ? 'เวลา' : 'Time'}
                  </p>
                  <p className="font-semibold text-gray-900">{appointment.appointment_time}</p>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-500">
                    {language === 'th' ? 'ยอดชำระ' : 'Amount'}
                  </p>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  disabled={payment?.payment_status === 'verified'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-2xl font-bold text-center disabled:bg-gray-100"
                  min="0"
                  step="0.01"
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  {language === 'th' ? 'บาท' : 'THB'}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <p className="font-semibold text-purple-900">
                    {language === 'th' ? 'คะแนนที่จะได้รับ' : 'Points to Earn'}
                  </p>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {calculatePoints()} {language === 'th' ? 'คะแนน' : 'points'}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  {language === 'th' ? '100 บาท = 1 คะแนน' : '100 THB = 1 point'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: QR Code */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <QrCodeIcon className="w-6 h-6 text-blue-600" />
              {language === 'th' ? 'สแกนเพื่อชำระเงิน' : 'Scan to Pay'}
            </h2>

            {payment?.payment_status === 'verified' ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <p className="text-xl font-bold text-green-600 mb-2">
                  {language === 'th' ? 'ชำระเงินเรียบร้อยแล้ว' : 'Payment Verified'}
                </p>
                <p className="text-gray-600 mb-4">
                  {language === 'th'
                    ? `คุณได้รับ ${payment.points_earned} คะแนน`
                    : `You earned ${payment.points_earned} points`}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDownloadReceipt}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 justify-center"
                  >
                    <Download className="w-5 h-5" />
                    {language === 'th' ? 'ดาวน์โหลดใบเสร็จ' : 'Download Receipt'}
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {language === 'th' ? 'กลับหน้าหลัก' : 'Back to Dashboard'}
                  </button>
                </div>
              </div>
            ) : payment?.payment_status === 'pending' && qrData ? (
              <div className="text-center">
                <div className="bg-white p-6 rounded-lg inline-block border-2 border-gray-200">
                  <QRCode value={qrData} size={256} />
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  {language === 'th'
                    ? 'สแกน QR Code ด้วยแอพธนาคารของคุณ'
                    : 'Scan QR Code with your banking app'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {language === 'th' ? 'หมายเลขอ้างอิง:' : 'Reference:'} {payment.qr_code_ref}
                </p>
                <div className="bg-yellow-50 rounded-lg p-4 mt-4 border border-yellow-200">
                  <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-yellow-800">
                    {language === 'th'
                      ? 'รอพนักงานยืนยันการชำระเงิน'
                      : 'Waiting for staff verification'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCodeIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 mb-6">
                  {language === 'th'
                    ? 'คลิกปุ่มด้านล่างเพื่อสร้าง QR Code'
                    : 'Click button below to generate QR Code'}
                </p>
                <button
                  onClick={generateQRCode}
                  disabled={generating}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {language === 'th' ? 'กำลังสร้าง...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <QrCodeIcon className="w-5 h-5" />
                      {language === 'th' ? 'สร้าง QR Code' : 'Generate QR Code'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
