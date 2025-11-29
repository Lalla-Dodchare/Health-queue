import { createClient } from '@supabase/supabase-js'
import { sendAppointmentReminderEmail, formatEmailDate } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const results = {
      sent: [],
      errors: [],
      summary: {
        threeDayReminders: 0,
        oneDayReminders: 0,
        sixHourReminders: 0,
        totalSent: 0,
        totalErrors: 0
      }
    }

    // ดึงนัดหมายที่ approved และยังไม่เสร็จ
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        user_id,
        doctor_id,
        branch_id,
        department_id
      `)
      .eq('status', 'approved')
      .gte('appointment_date', now.toISOString().split('T')[0])

    if (error) throw error

    for (const appointment of appointments) {
      // ดึงข้อมูล user profile
      const { data: user } = await supabase
        .from('profiles')
        .select('id, full_name, email, notification_preferences')
        .eq('id', appointment.user_id)
        .single()

      // ตรวจสอบว่าผู้ใช้เปิด Email notifications หรือไม่
      // Default: true (ส่งอัตโนมัติ ยกเว้นผู้ใช้ปิดไว้)
      const emailEnabled = user?.notification_preferences?.email_notifications !== false
      if (!emailEnabled || !user?.email) {
        continue
      }

      // ดึงข้อมูล doctor, branch, department
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id, contact_name, specialty')
        .eq('id', appointment.doctor_id)
        .single()

      const { data: branch } = await supabase
        .from('branches')
        .select('id, name')
        .eq('id', appointment.branch_id)
        .single()

      const { data: department } = await supabase
        .from('departments')
        .select('id, name')
        .eq('id', appointment.department_id)
        .single()

      const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
      const hoursUntil = (appointmentDateTime - now) / (1000 * 60 * 60)
      const daysUntil = hoursUntil / 24

      let reminderType = null

      // Logic การแจ้งเตือน (เหมือนกับ SMS)
      if (daysUntil >= 2.75 && daysUntil <= 3.25) {
        // 3 วันก่อนนัดหมาย
        reminderType = '3_days'
      } else if (daysUntil >= 0.75 && daysUntil <= 1.25 && hoursUntil >= 6) {
        // 1 วันก่อนนัดหมาย
        reminderType = '1_day'
      } else if (hoursUntil >= 5.5 && hoursUntil <= 6.5) {
        // 6 ชั่วโมงก่อนนัดหมาย
        reminderType = '6_hours'
      }

      // ส่ง Email
      if (reminderType && user?.email) {
        // ตรวจสอบว่าส่งแล้วหรือยัง (ใช้ตาราง appointment_notifications ร่วมกับ SMS)
        const alreadySent = await checkEmailNotificationSent(appointment.id, reminderType)
        if (alreadySent) continue

        try {
          const formattedDate = formatEmailDate(appointment.appointment_date)

          await sendAppointmentReminderEmail({
            email: user.email,
            patientName: user.full_name,
            appointmentDate: formattedDate,
            appointmentTime: appointment.appointment_time,
            doctorName: doctor?.contact_name,
            branchName: branch?.name,
            departmentName: department?.name,
            reminderType
          })

          // บันทึกว่าส่งแล้ว (ใช้ metadata field เพื่อบอกว่าเป็น email)
          await recordEmailNotificationSent(appointment.id, reminderType)

          // สร้าง in-app notification
          await supabase.from('notifications').insert({
            user_id: appointment.user_id,
            title: reminderType === '3_days' ? 'เตือนนัดหมาย 3 วัน' :
                   reminderType === '1_day' ? 'เตือนนัดหมาย 1 วัน' :
                   'เตือนนัดหมาย 6 ชั่วโมง',
            message: `คุณมีนัดพบแพทย์ที่ ${branch?.name || 'ไม่ระบุ'}\nวันที่: ${formattedDate}\nเวลา: ${appointment.appointment_time} น.`,
            type: 'appointment_reminder',
            is_read: false
          })

          results.sent.push({
            appointmentId: appointment.id,
            email: user.email,
            reminderType,
            sentAt: now.toISOString()
          })

          if (reminderType === '3_days') results.summary.threeDayReminders++
          else if (reminderType === '1_day') results.summary.oneDayReminders++
          else if (reminderType === '6_hours') results.summary.sixHourReminders++

          results.summary.totalSent++

        } catch (emailError) {
          console.error('Email Error:', emailError)
          results.errors.push({
            appointmentId: appointment.id,
            error: emailError.message
          })
          results.summary.totalErrors++
        }
      }
    }

    return Response.json({
      success: true,
      timestamp: now.toISOString(),
      ...results
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// Helper: ตรวจสอบว่าส่ง Email แล้วหรือยัง
// ใช้ตาราง appointment_notifications ร่วมกับ SMS
// แต่ต้องมีแยก tracking สำหรับ email ด้วย
async function checkEmailNotificationSent(appointmentId, reminderType) {
  // ตรวจสอบว่ามี record ที่ระบุว่าเป็น email หรือไม่
  const { data } = await supabase
    .from('appointment_notifications')
    .select('id')
    .eq('appointment_id', appointmentId)
    .eq('reminder_type', `${reminderType}_email`)
    .single()

  return !!data
}

// Helper: บันทึกว่าส่ง Email แล้ว
async function recordEmailNotificationSent(appointmentId, reminderType) {
  await supabase.from('appointment_notifications').insert({
    appointment_id: appointmentId,
    reminder_type: `${reminderType}_email`, // เพิ่ม _email suffix เพื่อแยกจาก SMS
    sent_at: new Date().toISOString()
  })
}
