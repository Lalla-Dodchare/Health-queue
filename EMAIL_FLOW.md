# 📧 Flow การทำงานของระบบแจ้งเตือน Email

## 1. ผู้ป่วยจองนัดหมาย

- ผู้ใช้กรอกข้อมูลและจองนัดหมาย
- สถานะ: **status = 'pending'**

## 2. Admin อนุมัติ

- Admin อนุมัติการจองผ่าน Dashboard
- Admin กดปุ่ม "อนุมัติ" และเลือกช่วงเวลา (primary หรือ secondary)
- ส่ง Email หา API: `/api/appointments/create-approval-notification`
  - แจ้งเตือนว่า **status = 'approved'**
  - พร้อมกับส่ง Email แจ้งเตือนอัตโนมัติ
  - ส่ง SMS แจ้งเตือนอัตโนมัติ (ถ้าเปิดใช้งาน)
  - สร้าง in-app notification

## 3. Cron Job รันทุกชั่วโมง

API: `/api/cron/send-appointment-email-reminders` เช็คว่ามีนัดหมายที่ **status = 'approved'** และส่ง Email ตามเงื่อนไข:

### A. 3 วันก่อนนัดหมาย

- เงื่อนไข: **daysUntil >= 2.75 && daysUntil <= 3.25** (tolerance ±6 ชม.)
- เช็คว่าเคยส่งหรือไม่: `reminder_type = '3_days_email'`
- ส่ง Email → สร้าง in-app notification
- บันทึกลงตาราง: **appointment_notifications**

### B. 1 วันก่อนนัดหมาย

- เงื่อนไข: **daysUntil >= 0.75 && daysUntil <= 1.25 && hoursUntil >= 6**
- คำนวณเวลาใหม่: ต้องเหลือมากกว่า 6 ชม.
- เช็คว่าเคยส่งหรือไม่: `reminder_type = '1_day_email'`
- ส่ง Email → สร้าง in-app notification
- บันทึกลงตาราง: **appointment_notifications**

### C. 6 ชั่วโมงก่อนนัดหมาย

- เงื่อนไข: **hoursUntil >= 5.5 && hoursUntil <= 6.5** (tolerance ±30 นาที)
- เช็คว่าเคยส่งหรือไม่: `reminder_type = '6_hours_email'`
- ส่ง Email → สร้าง in-app notification
- บันทึกลงตาราง: **appointment_notifications**

## 4. การป้องกันการส่งซ้ำ

ตาราง **appointment_notifications** มี UNIQUE constraint:
- UNIQUE(**appointment_id**, **reminder_type**)

ถ้าเคยส่ง Email แล้ว (ระบุด้วย `reminder_type` ที่มี suffix `_email`) จะไม่ส่งซ้ำ
- SMS: `'3_days'`, `'1_day'`, `'6_hours'`
- Email: `'3_days_email'`, `'1_day_email'`, `'6_hours_email'`

## 5. เงื่อนไขในการส่ง

✅ ต้องผ่านเงื่อนไขทั้งหมด:
- ✅ **status = 'approved'**
- ✅ **notification_preferences.email_notifications = true** (หรือ undefined)
- ✅ มีอีเมลในตาราง **profiles**
- ✅ ยังไม่เคยส่งการแจ้งเตือนประเภทนี้

## 6. ตัวอย่าง Timeline

```
วันจันทร์ที่ 27 ม.ค. 2568 เวลา 10:00:00
├─ Admin อนุมัติ
│  └─ ส่ง Email + SMS ทันทีว่า "นัดหมายได้รับการอนุมัติ"
│
วันพฤหัสบดี่ที่ 27 ม.ค. 2568 เวลา 10:00:00 (3 วันก่อน)
├─ Cron Job รัน
│  └─ เช็คเงื่อนไข: daysUntil = 3 วัน
│  └─ ส่ง Email เตือน 3 วัน
│  └─ ส่ง SMS เตือน 3 วัน
│  └─ บันทึก: reminder_type = '3_days' และ '3_days_email'
│
วันอาทิตย์ที่ 29 ม.ค. 2568 เวลา 10:00:00 (1 วันก่อน)
├─ Cron Job รัน
│  └─ เช็คเงื่อนไข: daysUntil = 1 วัน && hoursUntil >= 6
│  └─ ส่ง Email เตือน 1 วัน
│  └─ ส่ง SMS เตือน 1 วัน
│  └─ บันทึก: reminder_type = '1_day' และ '1_day_email'
│
วันจันทร์ที่ 30 ม.ค. 2568 เวลา 04:00:00 (6 ชม.ก่อน)
├─ Cron Job รัน
│  └─ เช็คเงื่อนไข: hoursUntil = 6 ชม.
│  └─ ส่ง Email เตือน 6 ชม.
│  └─ ส่ง SMS เตือน 6 ชม.
│  └─ บันทึก: reminder_type = '6_hours' และ '6_hours_email'
│
วันจันทร์ที่ 30 ม.ค. 2568 เวลา 10:00:00
└─ วันเวลานัดหมาย
```

## 7. การตั้งค่าของผู้ใช้

ผู้ใช้สามารถเปิด/ปิดการแจ้งเตือนได้:

### ตัวอย่าง SQL:

```sql
-- เปิด Email notifications
UPDATE profiles
SET notification_preferences = jsonb_set(
  COALESCE(notification_preferences, '{}'::jsonb),
  '{email_notifications}',
  'true'::jsonb
)
WHERE id = 'user-uuid';

-- ปิด Email notifications
UPDATE profiles
SET notification_preferences = jsonb_set(
  COALESCE(notification_preferences, '{}'::jsonb),
  '{email_notifications}',
  'false'::jsonb
)
WHERE id = 'user-uuid';
```

## 8. ตารางที่เกี่ยวข้อง

### appointments
- **appointment_date**: วันที่นัดหมาย
- **appointment_time**: เวลานัดหมาย
- **status**: สถานะ ('booked', 'approved', 'completed', 'cancelled', 'rejected')

### profiles
- **email**: อีเมลผู้ใช้
- **notification_preferences**: JSON object
  - `{ "email_notifications": true, "sms_notifications": true }`

### appointment_notifications
- **appointment_id**: FK ไปยัง appointments
- **reminder_type**: ประเภทการแจ้งเตือน
  - SMS: '3_days', '1_day', '6_hours'
  - Email: '3_days_email', '1_day_email', '6_hours_email'
- **sent_at**: เวลาที่ส่ง

## 9. Email Template

Email แต่ละประเภทจะมีสีและข้อความต่างกัน:

| ประเภท | สี | Subject |
|--------|-----|---------|
| 3 วันก่อน | 🔵 สีน้ำเงิน (#3b82f6) | 🗓️ เตือนนัดหมาย - 3 วันก่อนนัด |
| 1 วันก่อน | 🟡 สีส้ม (#f59e0b) | ⏰ เตือนนัดหมาย - พรุ่งนี้มีนัดพบแพทย์ |
| 6 ชั่วโมง | 🔴 สีแดง (#ef4444) | 🔔 เตือนนัดหมาย - อีก 6 ชั่วโมงถึงเวลานัด |

Email ทุกฉบับมี:
- ชื่อผู้ป่วย
- วันที่และเวลานัดหมาย (แบบไทย: วันจันทร์ ที่ 30 ม.ค. 2568)
- ชื่อแพทย์
- สาขาและแผนก
- ข้อความเตือนเฉพาะ (เช่น "กรุณามาถึงก่อนเวลานัด 15 นาที")

## 10. Monitoring & Logging

### ดูประวัติการส่ง Email:

```sql
SELECT
  an.id,
  an.reminder_type,
  an.sent_at,
  a.appointment_date,
  a.appointment_time,
  p.full_name,
  p.email
FROM appointment_notifications an
JOIN appointments a ON an.appointment_id = a.id
JOIN profiles p ON a.user_id = p.id
WHERE an.reminder_type LIKE '%_email'
ORDER BY an.sent_at DESC
LIMIT 20;
```

### เปรียบเทียบ SMS vs Email:

```sql
SELECT
  CASE
    WHEN reminder_type LIKE '%_email' THEN 'Email'
    ELSE 'SMS'
  END as notification_type,
  REPLACE(REPLACE(reminder_type, '_email', ''), '_', ' ') as reminder_period,
  COUNT(*) as total_sent,
  MAX(sent_at) as last_sent
FROM appointment_notifications
GROUP BY notification_type, reminder_period
ORDER BY reminder_period, notification_type;
```

---

## สรุป

ระบบ Email Reminder ทำงานคู่ขนานกับระบบ SMS โดย:
- ✅ ใช้ตาราง `appointment_notifications` ร่วมกัน
- ✅ แยก tracking ด้วย suffix `_email`
- ✅ ส่งพร้อมกัน 3 ครั้ง: 3 วัน, 1 วัน, 6 ชม. ก่อนนัด
- ✅ ผู้ใช้สามารถเลือกเปิด/ปิดแยกกันได้
- ✅ ป้องกันการส่งซ้ำด้วย UNIQUE constraint
- ✅ Email template สวยงาม responsive รองรับ mobile
