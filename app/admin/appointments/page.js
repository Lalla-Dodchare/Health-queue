'use client'

/**
 * Admin Appointments Management Page
 * Features:
 * - View all appointments with filters
 * - Approve/Reject appointments
 * - Choose between primary or secondary date
 * - Send email notifications
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/Sidebar'
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building2,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Mail,
  AlertCircle,
  ChevronDown,
  FileText,
} from 'lucide-react'

export default function AdminAppointmentsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [processing, setProcessing] = useState(null)

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    branchId: 'all',
    departmentId: 'all',
    search: '',
  })

  // Data for filters
  const [branches, setBranches] = useState([])
  const [departments, setDepartments] = useState([])

  // Modal state
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [approvalModal, setApprovalModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('primary') // 'primary' or 'secondary'

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/login')
        return
      }
      setUser(currentUser)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  // Load branches and departments
  useEffect(() => {
    const loadFilters = async () => {
      const { data: branchesData } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      const { data: departmentsData } = await supabase
        .from('departments')
        .select('*')
        .order('name')

      if (branchesData) setBranches(branchesData)
      if (departmentsData) setDepartments(departmentsData)
    }
    loadFilters()
  }, [])

  // Load appointments function (moved outside useEffect so it can be called from handlers)
  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        user:profiles!appointments_user_id_fkey (
          id,
          full_name,
          email,
          phone
        ),
        doctor:doctors!appointments_doctor_id_fkey (
          id,
          contact_name,
          contact_email,
          specialty
        ),
        branch:branches!appointments_branch_id_fkey (
          id,
          name
        ),
        department:departments!appointments_department_id_fkey (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading appointments:', error)
      return
    }

    setAppointments(data || [])
    setFilteredAppointments(data || [])
  }

  // Load appointments on mount and when user changes
  useEffect(() => {
    if (!user) return

    loadAppointments()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('appointments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
      }, () => {
        loadAppointments()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  // Apply filters
  useEffect(() => {
    let filtered = [...appointments]

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(apt => apt.status === filters.status)
    }

    // Branch filter
    if (filters.branchId !== 'all') {
      filtered = filtered.filter(apt => apt.branch_id === parseInt(filters.branchId))
    }

    // Department filter
    if (filters.departmentId !== 'all') {
      filtered = filtered.filter(apt => apt.department_id === parseInt(filters.departmentId))
    }

    // Search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(apt =>
        apt.user?.full_name?.toLowerCase().includes(searchLower) ||
        apt.doctor?.contact_name?.toLowerCase().includes(searchLower) ||
        apt.symptoms?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredAppointments(filtered)
  }, [filters, appointments])

  // Open approval modal
  const openApprovalModal = (appointment) => {
    setSelectedAppointment(appointment)
    setSelectedSlot('primary')
    setApprovalModal(true)
  }

  // Approve appointment
  const handleApprove = async () => {
    if (!selectedAppointment) return

    setProcessing(selectedAppointment.id)

    try {
      const approvedDate = selectedSlot === 'primary'
        ? selectedAppointment.primary_date
        : selectedAppointment.secondary_date

      const approvedTime = selectedSlot === 'primary'
        ? selectedAppointment.primary_time
        : selectedAppointment.secondary_time

      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'approved',
          approved_option: selectedSlot
        })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      // Send email notification to patient
      try {
        const emailResponse = await fetch('/api/appointments/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: selectedAppointment.id,
            action: 'approved'
          })
        })

        const emailResult = await emailResponse.json()

        if (emailResult.success) {
          console.log('✅ Email sent successfully to:', selectedAppointment.user?.email)
        } else {
          console.error('❌ Failed to send email:', emailResult.error)
          // Don't fail the approval if email fails, just log it
        }
      } catch (emailError) {
        console.error('❌ Email notification error:', emailError)
        // Don't fail the approval if email fails
      }

      // Reload appointments to update UI
      await loadAppointments()

      alert('อนุมัติการนัดหมายเรียบร้อยแล้ว! อีเมลแจ้งเตือนถูกส่งไปยังผู้ป่วยแล้ว')
      setApprovalModal(false)
      setSelectedAppointment(null)
    } catch (error) {
      console.error('Error approving appointment:', error)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setProcessing(null)
    }
  }

  // Reject appointment
  const handleReject = async (appointmentId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะปฏิเสธการนัดหมายนี้?')) return

    setProcessing(appointmentId)

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'rejected'
        })
        .eq('id', appointmentId)

      if (error) throw error

      // Send email notification to patient
      try {
        const rejectionReason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ (Optional):')

        const emailResponse = await fetch('/api/appointments/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId,
            action: 'rejected',
            rejectionReason
          })
        })

        const emailResult = await emailResponse.json()

        if (emailResult.success) {
          console.log('✅ Rejection email sent successfully')
        } else {
          console.error('❌ Failed to send rejection email:', emailResult.error)
        }
      } catch (emailError) {
        console.error('❌ Email notification error:', emailError)
      }

      const appointment = appointments.find(apt => apt.id === appointmentId)
      console.log('📧 Send rejection email to:', appointment?.user?.email)

      // Reload appointments to update UI
      await loadAppointments()

      alert('ปฏิเสธการนัดหมายเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error rejecting appointment:', error)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setProcessing(null)
    }
  }

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
    }

    const labels = {
      pending: 'รอพิจารณา',
      approved: 'อนุมัติแล้ว',
      rejected: 'ปฏิเสธ',
      completed: 'เสร็จสิ้น',
      cancelled: 'ยกเลิก',
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <AdminSidebar user={user} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">จัดการนัดหมาย</h1>
            <p className="text-gray-600">อนุมัติหรือปฏิเสธการนัดหมายของผู้ใช้งาน</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">ตัวกรอง</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="pending">รอพิจารณา</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ปฏิเสธ</option>
                  <option value="completed">เสร็จสิ้น</option>
                </select>
              </div>

              {/* Branch Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">สาขา</label>
                <select
                  value={filters.branchId}
                  onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">ทั้งหมด</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">แผนก</label>
                <select
                  value={filters.departmentId}
                  onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">ทั้งหมด</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="ชื่อคนไข้ หมอ อาการ..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              แสดง {filteredAppointments.length} จาก {appointments.length} รายการ
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีการนัดหมาย</h3>
                <p className="text-gray-600">ยังไม่มีการนัดหมายที่ตรงกับเงื่อนไขการค้นหา</p>
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.user?.full_name || 'ไม่ระบุชื่อ'}</h3>
                        <p className="text-sm text-gray-600">{appointment.user?.email}</p>
                      </div>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Left Column */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">สาขา:</span>
                        <span className="font-medium text-gray-900">{appointment.branch?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Stethoscope className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">แผนก:</span>
                        <span className="font-medium text-gray-900">{appointment.department?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">แพทย์:</span>
                        <span className="font-medium text-gray-900">{appointment.doctor?.contact_name}</span>
                      </div>
                    </div>

                    {/* Right Column - Date Options */}
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-900">ตัวเลือกที่ 1 (หลัก)</span>
                          {appointment.approved_slot === 'primary' && (
                            <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                          )}
                        </div>
                        <p className="text-sm text-gray-900">
                          {new Date(appointment.primary_date).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          {' | ⏰ '} {appointment.primary_time}
                          {appointment.primary_flexible && <span className="text-blue-600 ml-1">(ยืดหยุ่น)</span>}
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-medium text-gray-900">ตัวเลือกที่ 2 (รอง)</span>
                          {appointment.approved_slot === 'secondary' && (
                            <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                          )}
                        </div>
                        <p className="text-sm text-gray-900">
                          {new Date(appointment.secondary_date).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          {' | ⏰ '} {appointment.secondary_time}
                          {appointment.secondary_flexible && <span className="text-gray-600 ml-1">(ยืดหยุ่น)</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  {appointment.symptoms && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">อาการ/เหตุผล:</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{appointment.symptoms}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {appointment.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => openApprovalModal(appointment)}
                        disabled={processing === appointment.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => handleReject(appointment.id)}
                        disabled={processing === appointment.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        ปฏิเสธ
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Approval Modal */}
      {approvalModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">อนุมัติการนัดหมาย</h2>

            <p className="text-gray-600 mb-6">
              เลือกวันที่ต้องการอนุมัติสำหรับ <span className="font-semibold">{selectedAppointment.user?.full_name}</span>
            </p>

            <div className="space-y-3 mb-6">
              {/* Primary Date Option */}
              <label className={`block cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                selectedSlot === 'primary'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="slot"
                  value="primary"
                  checked={selectedSlot === 'primary'}
                  onChange={() => setSelectedSlot('primary')}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedSlot === 'primary'
                      ? 'border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedSlot === 'primary' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">ตัวเลือกที่ 1 (หลัก)</p>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedAppointment.primary_date).toLocaleDateString('th-TH')} | {selectedAppointment.primary_time}
                    </p>
                  </div>
                </div>
              </label>

              {/* Secondary Date Option */}
              <label className={`block cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                selectedSlot === 'secondary'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="slot"
                  value="secondary"
                  checked={selectedSlot === 'secondary'}
                  onChange={() => setSelectedSlot('secondary')}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedSlot === 'secondary'
                      ? 'border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedSlot === 'secondary' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">ตัวเลือกที่ 2 (รอง)</p>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedAppointment.secondary_date).toLocaleDateString('th-TH')} | {selectedAppointment.secondary_time}
                    </p>
                  </div>
                </div>
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                ระบบจะส่งอีเมลแจ้งเตือนไปยังผู้ใช้และแพทย์โดยอัตโนมัติ
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setApprovalModal(false)
                  setSelectedAppointment(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    กำลังดำเนินการ...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    ยืนยันการอนุมัติ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
