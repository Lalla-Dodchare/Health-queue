'use client'

/**
 * Medical History Page
 * View past appointments, treatment details, prescriptions
 * Download medical records
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import {
  FileText,
  Download,
  Calendar,
  User,
  Stethoscope,
  Pill,
  ClipboardList,
  Filter,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react'

export default function MedicalHistoryPage() {
  const router = useRouter()
  const { t, language } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [medicalRecords, setMedicalRecords] = useState([])
  const [expandedRecord, setExpandedRecord] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // all, 3months, 6months, 1year
  const [filteredRecords, setFilteredRecords] = useState([])

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      await loadMedicalRecords(currentUser.id)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const loadMedicalRecords = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          id,
          appointment_id,
          diagnosis,
          diagnosis_th,
          diagnosis_en,
          symptoms,
          symptoms_th,
          symptoms_en,
          treatment,
          treatment_th,
          treatment_en,
          test_results,
          vision_results,
          notes,
          notes_th,
          notes_en,
          next_appointment_date,
          created_at,
          appointments (
            id,
            appointment_date,
            appointment_time,
            doctors (
              id,
              full_name,
              name_th,
              name_en,
              specialization,
              specialty_th,
              specialty_en
            ),
            clinics (
              id,
              name,
              name_th,
              name_en
            )
          ),
          prescriptions (
            id,
            medication,
            medication_th,
            medication_en,
            dosage,
            dosage_th,
            dosage_en,
            duration,
            notes
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('✅ Loaded medical records:', data)
      setMedicalRecords(data || [])
    } catch (error) {
      console.error('❌ Error loading medical records:', error)
      setMedicalRecords([])
    }
  }

  // Filter records based on search and date filter
  useEffect(() => {
    let filtered = medicalRecords

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()

      if (dateFilter === '3months') {
        filterDate.setMonth(now.getMonth() - 3)
      } else if (dateFilter === '6months') {
        filterDate.setMonth(now.getMonth() - 6)
      } else if (dateFilter === '1year') {
        filterDate.setFullYear(now.getFullYear() - 1)
      }

      filtered = filtered.filter((record) =>
        new Date(record.appointments?.appointment_date || record.created_at) >= filterDate
      )
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((record) => {
        const doctorNameTh = record.appointments?.doctors?.name_th || record.appointments?.doctors?.full_name || ''
        const doctorNameEn = record.appointments?.doctors?.name_en || record.appointments?.doctors?.full_name || ''
        const clinicNameTh = record.appointments?.clinics?.name_th || record.appointments?.clinics?.name || ''
        const clinicNameEn = record.appointments?.clinics?.name_en || record.appointments?.clinics?.name || ''
        const diagnosisTh = record.diagnosis_th || record.diagnosis || ''
        const diagnosisEn = record.diagnosis_en || record.diagnosis || ''

        return (
          doctorNameTh.toLowerCase().includes(query) ||
          doctorNameEn.toLowerCase().includes(query) ||
          clinicNameTh.toLowerCase().includes(query) ||
          clinicNameEn.toLowerCase().includes(query) ||
          diagnosisTh.toLowerCase().includes(query) ||
          diagnosisEn.toLowerCase().includes(query)
        )
      })
    }

    setFilteredRecords(filtered)
  }, [searchQuery, dateFilter, medicalRecords])

  const toggleExpand = (recordId) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId)
  }

  const handleDownloadRecord = (recordId) => {
    // TODO: Generate PDF and download
    // This would typically call an API endpoint to generate a PDF
    alert(t('medicalHistory.downloadStarted') || 'เริ่มดาวน์โหลดประวัติการรักษา')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('medicalHistory.title') || 'ประวัติการรักษา'}
          </h1>
          <p className="text-gray-600">
            {t('medicalHistory.description') || 'ดูประวัติการรักษาและข้อมูลสุขภาพของคุณ'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('medicalHistory.searchPlaceholder') || 'ค้นหาประวัติการรักษา...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('medicalHistory.allTime') || 'ทั้งหมด'}</option>
                <option value="3months">{t('medicalHistory.last3Months') || '3 เดือนที่แล้ว'}</option>
                <option value="6months">{t('medicalHistory.last6Months') || '6 เดือนที่แล้ว'}</option>
                <option value="1year">{t('medicalHistory.lastYear') || '1 ปีที่แล้ว'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Medical Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {t('medicalHistory.noRecords') || 'ไม่มีประวัติการรักษา'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {language === 'th'
                  ? 'ประวัติการรักษาจะแสดงหลังจากเข้ารับการรักษา'
                  : 'Medical records will appear after receiving treatment'}
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const isExpanded = expandedRecord === record.id

              return (
                <div key={record.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* Record Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(record.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-bold text-gray-900">
                            {new Date(
                              record.appointments?.appointment_date || record.created_at
                            ).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 mb-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 text-blue-600" />
                            <span>
                              {language === 'th'
                                ? record.appointments?.doctors?.name_th ||
                                  record.appointments?.doctors?.full_name
                                : record.appointments?.doctors?.name_en ||
                                  record.appointments?.doctors?.full_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Stethoscope className="w-4 h-4 text-blue-600" />
                            <span>
                              {language === 'th'
                                ? record.appointments?.clinics?.name_th ||
                                  record.appointments?.clinics?.name
                                : record.appointments?.clinics?.name_en ||
                                  record.appointments?.clinics?.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 mb-2">
                          <ClipboardList className="w-4 h-4 text-blue-600 mt-0.5" />
                          <p className="text-sm font-semibold text-gray-900">
                            {t('medicalHistory.diagnosis') || 'การวินิจฉัย'}:{' '}
                            <span className="font-normal text-gray-700">
                              {language === 'th'
                                ? record.diagnosis_th || record.diagnosis
                                : record.diagnosis_en || record.diagnosis}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadRecord(record.id)
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('medicalHistory.download')}
                        >
                          <Download className="w-5 h-5 text-blue-600" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        {/* Symptoms */}
                        {(record.symptoms_th || record.symptoms_en || record.symptoms) && (
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2">
                              {t('medicalHistory.symptoms') || 'อาการ'}
                            </h4>
                            <p className="text-sm text-gray-700">
                              {language === 'th'
                                ? record.symptoms_th || record.symptoms
                                : record.symptoms_en || record.symptoms}
                            </p>
                          </div>
                        )}

                        {/* Treatment */}
                        {(record.treatment_th || record.treatment_en || record.treatment) && (
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2">
                              {t('medicalHistory.treatment') || 'การรักษา'}
                            </h4>
                            <p className="text-sm text-gray-700">
                              {language === 'th'
                                ? record.treatment_th || record.treatment
                                : record.treatment_en || record.treatment}
                            </p>
                          </div>
                        )}

                        {/* Prescriptions */}
                        {record.prescriptions && record.prescriptions.length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Pill className="w-4 h-4 text-blue-600" />
                              {t('medicalHistory.prescriptions') || 'ใบสั่งยา'}
                            </h4>
                            <div className="space-y-3">
                              {record.prescriptions.map((prescription, index) => (
                                <div
                                  key={prescription.id || index}
                                  className="bg-blue-50 rounded-lg p-4 border border-blue-100"
                                >
                                  <p className="font-semibold text-gray-900 mb-1">
                                    {language === 'th'
                                      ? prescription.medication_th || prescription.medication
                                      : prescription.medication_en || prescription.medication}
                                  </p>
                                  <p className="text-sm text-gray-700 mb-1">
                                    {t('medicalHistory.dosage') || 'ขนาดยา'}:{' '}
                                    {language === 'th'
                                      ? prescription.dosage_th || prescription.dosage
                                      : prescription.dosage_en || prescription.dosage}
                                  </p>
                                  {prescription.duration && (
                                    <p className="text-sm text-gray-600">
                                      {t('medicalHistory.duration') || 'ระยะเวลา'}: {prescription.duration}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Test Results (if available) */}
                        {record.test_results && Object.keys(record.test_results).length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-900 mb-3">
                              {t('medicalHistory.testResults') || 'ผลการตรวจ'}
                            </h4>
                            <div className="grid md:grid-cols-4 gap-4">
                              {Object.entries(record.test_results).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs text-gray-600 mb-1 capitalize">
                                    {key.replace(/_/g, ' ')}
                                  </p>
                                  <p className="font-semibold text-gray-900">{value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Vision Results (if available) */}
                        {record.vision_results && Object.keys(record.vision_results).length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-900 mb-3">
                              {t('medicalHistory.visionResults') || 'ผลการตรวจสายตา'}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              {record.vision_results.right_eye && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs text-gray-600 mb-1">
                                    {t('medicalHistory.rightEye') || 'ตาขวา'}
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {record.vision_results.right_eye}
                                  </p>
                                </div>
                              )}
                              {record.vision_results.left_eye && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs text-gray-600 mb-1">
                                    {t('medicalHistory.leftEye') || 'ตาซ้าย'}
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {record.vision_results.left_eye}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {(record.notes_th || record.notes_en || record.notes) && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-900 mb-2">
                              {t('medicalHistory.notes') || 'บันทึกเพิ่มเติม'}
                            </h4>
                            <p className="text-sm text-gray-700 italic">
                              {language === 'th'
                                ? record.notes_th || record.notes
                                : record.notes_en || record.notes}
                            </p>
                          </div>
                        )}

                        {/* Next Appointment */}
                        {record.next_appointment_date && (
                          <div className="md:col-span-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <p className="text-sm font-semibold text-blue-900">
                              {t('medicalHistory.nextAppointment') || 'นัดหมายครั้งถัดไป'}:{' '}
                              {new Date(record.next_appointment_date).toLocaleDateString(
                                language === 'th' ? 'th-TH' : 'en-US',
                                { year: 'numeric', month: 'long', day: 'numeric' }
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
