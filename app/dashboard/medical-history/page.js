'use client'

/**
 * Medical History Page
 * View past appointments, treatment details, prescriptions
 * Download medical records
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const { t } = useTranslation()
  const [expandedRecord, setExpandedRecord] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // all, 3months, 6months, 1year
  const [filteredRecords, setFilteredRecords] = useState([])

  // Mock data - Replace with Supabase query
  // TODO: Fetch from Supabase:
  // supabase.from('medical_records')
  //   .select('*, appointments(*, doctors(*), clinics(*)), prescriptions(*)')
  //   .eq('user_id', userId)
  //   .order('date', { ascending: false })
  const medicalRecords = [
    {
      id: 1,
      date: '2025-11-10',
      doctor_name_th: 'นพ. ประสิทธิ์ ทองทิพย์',
      doctor_name_en: 'Dr. Prasit Thongthip',
      clinic_name_th: 'คลินิกอายุรกรรม',
      clinic_name_en: 'Internal Medicine',
      diagnosis_th: 'ความดันโลหิตสูง',
      diagnosis_en: 'Hypertension',
      symptoms_th: 'ปวดศีรษะ, เหนื่อยง่าย',
      symptoms_en: 'Headache, easily fatigued',
      treatment_th: 'ให้ยาลดความดันโลหิต, แนะนำลดเกลือในอาหาร',
      treatment_en: 'Prescribed blood pressure medication, advised to reduce salt intake',
      prescriptions: [
        {
          medication_th: 'Amlodipine 5mg',
          medication_en: 'Amlodipine 5mg',
          dosage_th: 'วันละ 1 เม็ด ก่อนนอน',
          dosage_en: '1 tablet daily before bedtime',
          duration: '30 days',
        },
        {
          medication_th: 'Aspirin 81mg',
          medication_en: 'Aspirin 81mg',
          dosage_th: 'วันละ 1 เม็ด หลังอาหารเช้า',
          dosage_en: '1 tablet daily after breakfast',
          duration: '30 days',
        },
      ],
      next_appointment: '2025-12-10',
      notes_th: 'ติดตามผลการรักษาในเดือนหน้า',
      notes_en: 'Follow-up next month to monitor treatment progress',
    },
    {
      id: 2,
      date: '2025-10-05',
      doctor_name_th: 'พญ. สุดารัตน์ วงศ์ใหญ่',
      doctor_name_en: 'Dr. Sudarat Wongyai',
      clinic_name_th: 'คลินิกจักษุ',
      clinic_name_en: 'Ophthalmology',
      diagnosis_th: 'สายตาสั้น',
      diagnosis_en: 'Myopia',
      symptoms_th: 'มองเห็นภาพไม่ชัด มองไกลไม่ชัด',
      symptoms_en: 'Blurry vision, difficulty seeing far objects',
      treatment_th: 'สั่งแว่นสายตา',
      treatment_en: 'Prescribed eyeglasses',
      prescriptions: [],
      next_appointment: '2026-10-05',
      notes_th: 'ตรวจสายตาอีกครั้งในปีหน้า',
      notes_en: 'Eye exam again next year',
      vision_results: {
        right_eye: '-2.50',
        left_eye: '-2.75',
      },
    },
    {
      id: 3,
      date: '2025-09-20',
      doctor_name_th: 'นพ. สมชาย ประเสริฐ',
      doctor_name_en: 'Dr. Somchai Prasert',
      clinic_name_th: 'คลินิกโรคหัวใจ',
      clinic_name_en: 'Cardiology',
      diagnosis_th: 'ตรวจสุขภาพประจำปี - ปกติ',
      diagnosis_en: 'Annual checkup - Normal',
      symptoms_th: 'ไม่มีอาการ',
      symptoms_en: 'No symptoms',
      treatment_th: 'ไม่ต้องรักษา, สุขภาพดี',
      treatment_en: 'No treatment needed, healthy',
      prescriptions: [],
      next_appointment: '2026-09-20',
      notes_th: 'ตรวจสุขภาพประจำปีต่อไปในปีหน้า',
      notes_en: 'Annual checkup next year',
      test_results: {
        blood_pressure: '120/80',
        heart_rate: '72 bpm',
        cholesterol: 'Normal',
        blood_sugar: 'Normal',
      },
    },
    {
      id: 4,
      date: '2025-08-15',
      doctor_name_th: 'ทพ. สมศักดิ์ รุ่งเรือง',
      doctor_name_en: 'Dr. Somsak Rungruang',
      clinic_name_th: 'คลินิกทันตกรรม',
      clinic_name_en: 'Dentistry',
      diagnosis_th: 'ฟันผุ 2 ซี่',
      diagnosis_en: 'Tooth decay (2 teeth)',
      symptoms_th: 'ปวดฟัน เสียวฟัน',
      symptoms_en: 'Toothache, sensitive teeth',
      treatment_th: 'อุดฟัน 2 ซี่, ขูดหินปูน',
      treatment_en: 'Filled 2 teeth, dental scaling',
      prescriptions: [
        {
          medication_th: 'Ibuprofen 400mg',
          medication_en: 'Ibuprofen 400mg',
          dosage_th: 'วันละ 3 ครั้ง หลังอาหาร',
          dosage_en: '3 times daily after meals',
          duration: '3 days',
        },
      ],
      next_appointment: '2026-02-15',
      notes_th: 'ตรวจฟันทุก 6 เดือน',
      notes_en: 'Dental checkup every 6 months',
    },
  ]

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

      filtered = filtered.filter((record) => new Date(record.date) >= filterDate)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (record) =>
          record.doctor_name_th.toLowerCase().includes(query) ||
          record.doctor_name_en.toLowerCase().includes(query) ||
          record.clinic_name_th.toLowerCase().includes(query) ||
          record.clinic_name_en.toLowerCase().includes(query) ||
          record.diagnosis_th.toLowerCase().includes(query) ||
          record.diagnosis_en.toLowerCase().includes(query)
      )
    }

    setFilteredRecords(filtered)
  }, [searchQuery, dateFilter])

  const toggleExpand = (recordId) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId)
  }

  const handleDownloadRecord = (recordId) => {
    // TODO: Generate PDF and download
    // This would typically call an API endpoint to generate a PDF
    alert(t('medicalHistory.downloadStarted'))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('medicalHistory.title')}
          </h1>
          <p className="text-gray-600">{t('medicalHistory.description')}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('medicalHistory.searchPlaceholder')}
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
                <option value="all">{t('medicalHistory.allTime')}</option>
                <option value="3months">{t('medicalHistory.last3Months')}</option>
                <option value="6months">{t('medicalHistory.last6Months')}</option>
                <option value="1year">{t('medicalHistory.lastYear')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Medical Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t('medicalHistory.noRecords')}</p>
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
                            {new Date(record.date).toLocaleDateString(
                              t('language') === 'th' ? 'th-TH' : 'en-US',
                              { year: 'numeric', month: 'long', day: 'numeric' }
                            )}
                          </h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 mb-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 text-blue-600" />
                            <span>
                              {t('language') === 'th'
                                ? record.doctor_name_th
                                : record.doctor_name_en}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Stethoscope className="w-4 h-4 text-blue-600" />
                            <span>
                              {t('language') === 'th'
                                ? record.clinic_name_th
                                : record.clinic_name_en}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 mb-2">
                          <ClipboardList className="w-4 h-4 text-blue-600 mt-0.5" />
                          <p className="text-sm font-semibold text-gray-900">
                            {t('medicalHistory.diagnosis')}:{' '}
                            <span className="font-normal text-gray-700">
                              {t('language') === 'th'
                                ? record.diagnosis_th
                                : record.diagnosis_en}
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
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-2">
                            {t('medicalHistory.symptoms')}
                          </h4>
                          <p className="text-sm text-gray-700">
                            {t('language') === 'th'
                              ? record.symptoms_th
                              : record.symptoms_en}
                          </p>
                        </div>

                        {/* Treatment */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-2">
                            {t('medicalHistory.treatment')}
                          </h4>
                          <p className="text-sm text-gray-700">
                            {t('language') === 'th'
                              ? record.treatment_th
                              : record.treatment_en}
                          </p>
                        </div>

                        {/* Prescriptions */}
                        {record.prescriptions && record.prescriptions.length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Pill className="w-4 h-4 text-blue-600" />
                              {t('medicalHistory.prescriptions')}
                            </h4>
                            <div className="space-y-3">
                              {record.prescriptions.map((prescription, index) => (
                                <div
                                  key={index}
                                  className="bg-blue-50 rounded-lg p-4 border border-blue-100"
                                >
                                  <p className="font-semibold text-gray-900 mb-1">
                                    {t('language') === 'th'
                                      ? prescription.medication_th
                                      : prescription.medication_en}
                                  </p>
                                  <p className="text-sm text-gray-700 mb-1">
                                    {t('medicalHistory.dosage')}:{' '}
                                    {t('language') === 'th'
                                      ? prescription.dosage_th
                                      : prescription.dosage_en}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {t('medicalHistory.duration')}: {prescription.duration}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Test Results (if available) */}
                        {record.test_results && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-900 mb-3">
                              {t('medicalHistory.testResults')}
                            </h4>
                            <div className="grid md:grid-cols-4 gap-4">
                              {Object.entries(record.test_results).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs text-gray-600 mb-1 capitalize">
                                    {key.replace('_', ' ')}
                                  </p>
                                  <p className="font-semibold text-gray-900">{value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Vision Results (if available) */}
                        {record.vision_results && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-900 mb-3">
                              {t('medicalHistory.visionResults')}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600 mb-1">
                                  {t('medicalHistory.rightEye')}
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {record.vision_results.right_eye}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600 mb-1">
                                  {t('medicalHistory.leftEye')}
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {record.vision_results.left_eye}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-bold text-gray-900 mb-2">
                            {t('medicalHistory.notes')}
                          </h4>
                          <p className="text-sm text-gray-700 italic">
                            {t('language') === 'th' ? record.notes_th : record.notes_en}
                          </p>
                        </div>

                        {/* Next Appointment */}
                        {record.next_appointment && (
                          <div className="md:col-span-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <p className="text-sm font-semibold text-blue-900">
                              {t('medicalHistory.nextAppointment')}:{' '}
                              {new Date(record.next_appointment).toLocaleDateString(
                                t('language') === 'th' ? 'th-TH' : 'en-US',
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
