'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Upload, CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react'

export default function DoctorUploadPage() {
  const params = useParams()
  const token = params.token

  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    treatmentNote: '',
    files: []
  })

  useEffect(() => {
    loadAppointment()
  }, [token])

  const loadAppointment = async () => {
    try {
      const decodedToken = decodeURIComponent(token)
      const decoded = atob(decodedToken)
      const [appointmentId, secret] = decoded.split(':')

      const expectedSecret = process.env.NEXT_PUBLIC_DOCTOR_RESPONSE_SECRET || 'secret'
      if (secret !== expectedSecret) {
        setError('Invalid token')
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          user:profiles!appointments_user_id_fkey (full_name, phone),
          doctor:doctors!appointments_doctor_id_fkey (contact_name),
          branch:branches!appointments_branch_id_fkey (name),
          department:departments!appointments_department_id_fkey (name)
        `)
        .eq('id', appointmentId)
        .single()

      if (fetchError || !data) {
        setError('ไม่พบข้อมูลการนัดหมาย')
        setLoading(false)
        return
      }

      setAppointment(data)
      setLoading(false)
    } catch (err) {
      console.error('Error:', err)
      setError('เกิดข้อผิดพลาด')
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || [])

    // Validate each file
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`ไฟล์ ${file.name} ใหญ่เกิน 10MB`)
        return false
      }
      return true
    })

    setFormData({ ...formData, files: [...formData.files, ...validFiles] })
  }

  const removeFile = (index) => {
    const newFiles = formData.files.filter((_, i) => i !== index)
    setFormData({ ...formData, files: newFiles })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    if (!formData.treatmentNote.trim()) {
      alert('กรุณากรอกหมายเหตุการรักษา')
      return
    }

    setSubmitting(true)

    try {
      const fileUrls = []

      // Upload all files
      for (const file of formData.files) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        formDataUpload.append('appointmentId', appointment.id)

        const uploadResponse = await fetch('/api/upload-treatment-file', {
          method: 'POST',
          body: formDataUpload
        })

        const uploadResult = await uploadResponse.json()

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed')
        }

        fileUrls.push(uploadResult.fileUrl)
      }

      // Update appointment - store JSON array of URLs
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          treatment_note: formData.treatmentNote,
          treatment_file_url: fileUrls.length > 0 ? JSON.stringify(fileUrls) : null,
          treatment_completed_at: new Date().toISOString()
        })
        .eq('id', appointment.id)

      if (updateError) throw updateError

      // Send email to user
      await fetch('/api/send-treatment-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: appointment.id })
      })

      setSuccess(true)
    } catch (err) {
      console.error('Error:', err)
      alert('เกิดข้อผิดพลาด: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">อัปโหลดสำเร็จ!</h1>
          <p className="text-gray-600 mb-6">
            ระบบได้บันทึกผลการรักษาแล้ว<br />
            Admin จะเห็นข้อมูลในระบบ
          </p>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-800">ขอบคุณที่ให้ความร่วมมือ</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">📤 อัปโหลดผลการรักษา</h1>
            <p className="text-green-50">กรุณากรอกข้อมูลและอัปโหลดไฟล์ผลการรักษา</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Appointment Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">ข้อมูลผู้ป่วย</h2>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">ชื่อ:</span> {appointment.user?.full_name}</p>
                <p><span className="font-semibold">เบอร์โทร:</span> {appointment.user?.phone}</p>
                <p><span className="font-semibold">สาขา:</span> {appointment.branch?.name}</p>
                <p><span className="font-semibold">แผนก:</span> {appointment.department?.name}</p>
                <p><span className="font-semibold">อาการ:</span> {appointment.symptoms}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Treatment Note */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  หมายเหตุการรักษา <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.treatmentNote}
                  onChange={(e) => setFormData({ ...formData, treatmentNote: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={6}
                  placeholder="กรอกรายละเอียดการรักษา ผลการตรวจ และคำแนะนำ..."
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  อัปโหลดไฟล์ผลการรักษา (อัปโหลดได้หลายไฟล์)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="file-upload"
                    multiple
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-1">
                      คลิกเพื่ออัปโหลดไฟล์ (หลายไฟล์ได้)
                    </p>
                    <p className="text-sm text-gray-500">PDF, JPG, PNG (สูงสุด 10MB ต่อไฟล์)</p>
                  </label>
                </div>

                {/* File List */}
                {formData.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    กำลังอัปโหลด...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    บันทึกผลการรักษา
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
