import { createClient } from '@supabase/supabase-js'
import { sendSMS } from '@/lib/sms'

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
        .select('id, full_name, phone, notification_preferences')
        .eq('id', appointment.user_id)
        .single()

      // ตรวจสอบว่าผู้ใช้เปิด SMS notifications หรือไม่
      // Default: false (ผู้ใช้ต้องเปิดเอง)
      const smsEnabled = user?.notification_preferences?.sms_notifications === true
      if (!smsEnabled || !user?.phone) {
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
      let message = ''

      // Logic การแจ้งเตือน
      if (daysUntil >= 2.75 && daysUntil <= 3.25) {
        // 3 วันก่อนนัดหมาย (tolerance ±6 ชั่วโมง)
        reminderType = '3_days'

        // ตรวจสอบว่าส่งแล้วหรือยัง
        const alreadySent = await checkNotificationSent(appointment.id, reminderType)
        if (alreadySent) continue

        message = `[Health Queue] เตือนความจำ: คุณมีนัดพบแพทย์ในอีก 3 วัน\n` +
          `วันที่: ${formatDate(appointment.appointment_date)}\n` +
          `เวลา: ${appointment.appointment_time} น.\n` +
          `แพทย์: ${doctor?.contact_name || 'ไม่ระบุ'}\n` +
          `สถานที่: ${branch?.name || 'ไม่ระบุ'}`

      } else if (daysUntil >= 0.75 && daysUntil <= 1.25 && hoursUntil >= 6) {
        // 1 วันก่อนนัดหมาย (ต้องมากกว่า 6 ชม.)
        reminderType = '1_day'

        const alreadySent = await checkNotificationSent(appointment.id, reminderType)
        if (alreadySent) continue

        message = `[Health Queue] เตือนความจำ: คุณมีนัดพบแพทย์พรุ่งนี้\n` +
          `วันที่: ${formatDate(appointment.appointment_date)}\n` +
          `เวลา: ${appointment.appointment_time} น.\n` +
          `แพทย์: ${doctor?.contact_name || 'ไม่ระบุ'}\n` +
          `สาขา: ${branch?.name || 'ไม่ระบุ'}\n` +
          `กรุณามาถึงก่อนเวลานัด 15 นาที`

      } else if (hoursUntil >= 5.5 && hoursUntil <= 6.5) {
        // 6 ชั่วโมงก่อนนัดหมาย
        reminderType = '6_hours'

        const alreadySent = await checkNotificationSent(appointment.id, reminderType)
        if (alreadySent) continue

        message = `[Health Queue] แจ้งเตือน: ใกล้ถึงเวลานัดหมายของคุณแล้ว\n` +
          `วันที่: วันนี้\n` +
          `เวลา: ${appointment.appointment_time} น. (อีก 6 ชั่วโมง)\n` +
          `แพทย์: ${doctor?.contact_name || 'ไม่ระบุ'}\n` +
          `สาขา: ${branch?.name || 'ไม่ระบุ'}\n` +
          `แผนก: ${department?.name || 'ไม่ระบุ'}\n` +
          `กรุณาเตรียมตัวและมาถึงก่อนเวลา`
      }

      // ส่ง SMS
      if (reminderType && message && user?.phone) {
        try {
          await sendSMS(user.phone, message)

          // บันทึกว่าส่งแล้ว
          await recordNotificationSent(appointment.id, reminderType)

          // สร้าง in-app notification
          await supabase.from('notifications').insert({
            user_id: appointment.user_id,
            title: reminderType === '3_days' ? 'เตือนนัดหมาย 3 วัน' :
                   reminderType === '1_day' ? 'เตือนนัดหมาย 1 วัน' :
                   'เตือนนัดหมาย 6 ชั่วโมง',
            message: message,
            type: 'appointment_reminder',
            is_read: false
          })

          results.sent.push({
            appointmentId: appointment.id,
            phone: user.phone,
            reminderType,
            sentAt: now.toISOString()
          })

          if (reminderType === '3_days') results.summary.threeDayReminders++
          else if (reminderType === '1_day') results.summary.oneDayReminders++
          else if (reminderType === '6_hours') results.summary.sixHourReminders++

          results.summary.totalSent++

        } catch (smsError) {
          console.error('SMS Error:', smsError)
          results.errors.push({
            appointmentId: appointment.id,
            error: smsError.message
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

// Helper: ตรวจสอบว่าส่งการแจ้งเตือนแล้วหรือยัง
async function checkNotificationSent(appointmentId, reminderType) {
  const { data } = await supabase
    .from('appointment_notifications')
    .select('id')
    .eq('appointment_id', appointmentId)
    .eq('reminder_type', reminderType)
    .single()

  return !!data
}

// Helper: บันทึกว่าส่งการแจ้งเตือนแล้ว
async function recordNotificationSent(appointmentId, reminderType) {
  await supabase.from('appointment_notifications').insert({
    appointment_id: appointmentId,
    reminder_type: reminderType,
    sent_at: new Date().toISOString()
  })
}

// Helper: Format date เป็นภาษาไทย
function formatDate(dateString) {
  const date = new Date(dateString)
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                     'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`
}
