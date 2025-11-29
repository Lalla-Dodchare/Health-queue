# 📧 คู่มือระบบแจ้งเตือน Email อัตโนมัติ

## ภาพรวมระบบ

ระบบแจ้งเตือน Email อัตโนมัติสำหรับ Health Queue จะส่ง Email แจ้งเตือนผู้ใช้ในจังหวะที่สำคัญ 4 ครั้ง:

### 📬 ประเภทการแจ้งเตือน

1. **หลังได้รับการอนุมัติ** ✅ (ทำงานอัตโนมัติแล้ว)
   - ส่งทันทีเมื่อ admin อนุมัตินัดหมาย
   - API: `/api/appointments/create-approval-notification`

2. **3 วันก่อนนัดหมาย** 🗓️
   - ส่งล่วงหน้า 3 วัน (tolerance ±6 ชม.)
   - เตือนให้จำวันนัดหมาย

3. **1 วันก่อนนัดหมาย** ⏰
   - ส่งล่วงหน้า 1 วัน
   - เงื่อนไข: ต้องมีเวลามากกว่า 6 ชม. จนถึงนัดหมาย
   - เตือนให้เตรียมตัว

4. **6 ชั่วโมงก่อนนัดหมาย** ⚡
   - ส่งก่อนนัดหมาย 6 ชม.
   - เตือนให้ออกเดินทาง

---

## 🔧 การติดตั้ง

### ขั้นตอนที่ 1: ตรวจสอบ Gmail Configuration

ตรวจสอบว่ามีค่าเหล่านี้ใน `.env.local`:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
EMAIL_FROM=Health Queue <your-email@gmail.com>
```

**สร้าง Gmail App Password:**
1. ไปที่ Google Account → Security
2. เปิด 2-Step Verification
3. ไปที่ App passwords
4. สร้าง app password ใหม่
5. คัดลอกและใส่ใน `GMAIL_APP_PASSWORD`

### ขั้นตอนที่ 2: อัพเดทตาราง appointment_notifications

ตารางนี้ใช้ร่วมกันระหว่าง SMS และ Email โดยใช้ suffix `_email` เพื่อแยก:

```sql
-- ตัวอย่าง reminder_type:
-- SMS: '3_days', '1_day', '6_hours'
-- Email: '3_days_email', '1_day_email', '6_hours_email'

-- ตรวจสอบว่าตารางมีอยู่แล้ว
SELECT * FROM appointment_notifications LIMIT 5;
```

**ถ้ายังไม่มีตาราง** ให้รันคำสั่ง:
```bash
node scripts/setup-notification-tracking.js
```

### ขั้นตอนที่ 3: ตั้งค่า Cron Job

#### วิธีที่ 1: ใช้ Vercel Cron (แนะนำ)

เพิ่มใน `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-appointment-reminders",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/send-appointment-email-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Schedule**: ทุกชั่วโมง (minute 0 of every hour)

#### วิธีที่ 2: ใช้บริการ Cron ภายนอก

เช่น cron-job.org, EasyCron:
- URL: `https://your-domain.com/api/cron/send-appointment-email-reminders`
- Method: GET
- Header: `Authorization: Bearer YOUR_CRON_SECRET`
- Frequency: ทุกชั่วโมง

---

## 🧪 การทดสอบ

### ทดสอบส่ง Email ด้วย Node Script

สร้างไฟล์ `scripts/test-email.js`:

```javascript
import { sendAppointmentReminderEmail, formatEmailDate } from '../lib/email.js'

async function test() {
  const result = await sendAppointmentReminderEmail({
    email: 'test@example.com',
    patientName: 'สมชาย ใจดี',
    appointmentDate: formatEmailDate('2025-01-30'),
    appointmentTime: '10:00',
    doctorName: 'นพ.สมหมาย รักษาดี',
    branchName: 'โรงพยาบาลกรุงเทพ สาขาสยาม',
    departmentName: 'อายุรกรรม',
    reminderType: '3_days'
  })

  console.log('Result:', result)
}

test()
```

รันด้วย:
```bash
node scripts/test-email.js
```

### ทดสอบ Cron Job API

```bash
curl -X GET http://localhost:3001/api/cron/send-appointment-email-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Response ตัวอย่าง:

```json
{
  "success": true,
  "timestamp": "2025-01-26T10:00:00.000Z",
  "sent": [
    {
      "appointmentId": "uuid-here",
      "email": "patient@example.com",
      "reminderType": "3_days_email",
      "sentAt": "2025-01-26T10:00:00.000Z"
    }
  ],
  "errors": [],
  "summary": {
    "threeDayReminders": 1,
    "oneDayReminders": 0,
    "sixHourReminders": 0,
    "totalSent": 1,
    "totalErrors": 0
  }
}
```

---

## 📊 ตรวจสอบการทำงาน

### ดูประวัติการส่ง Email

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
LIMIT 10;
```

### นับจำนวน Email ที่ส่งแต่ละประเภท

```sql
SELECT
  reminder_type,
  COUNT(*) as total_sent,
  MAX(sent_at) as last_sent
FROM appointment_notifications
WHERE reminder_type LIKE '%_email'
GROUP BY reminder_type;
```

### เปรียบเทียบ SMS vs Email

```sql
SELECT
  CASE
    WHEN reminder_type LIKE '%_email' THEN 'Email'
    ELSE 'SMS'
  END as notification_type,
  REPLACE(REPLACE(reminder_type, '_email', ''), '_', ' ') as reminder_period,
  COUNT(*) as total_sent
FROM appointment_notifications
GROUP BY notification_type, reminder_period
ORDER BY reminder_period, notification_type;
```

---

## ⚙️ การตั้งค่า Email

### ผู้ใช้สามารถเปิด/ปิด Email ได้ที่:
- **หน้า Profile** → Notification Settings → Email Notifications

### เงื่อนไขการส่ง:
1. ผู้ใช้ต้องเปิด `notification_preferences.email_notifications = true` (หรือ undefined จะถือว่า true)
2. นัดหมายต้องมีสถานะ `status = 'approved'`
3. ต้องมี email ในตาราง profiles
4. ยังไม่เคยส่งการแจ้งเตือนประเภทนี้ไปแล้ว

### เพิ่ม Email Notifications Toggle ให้ผู้ใช้

```sql
-- เปิด Email notifications สำหรับผู้ใช้
UPDATE profiles
SET notification_preferences = jsonb_set(
  COALESCE(notification_preferences, '{}'::jsonb),
  '{email_notifications}',
  'true'::jsonb
)
WHERE id = 'user-uuid';

-- ปิด Email notifications สำหรับผู้ใช้
UPDATE profiles
SET notification_preferences = jsonb_set(
  COALESCE(notification_preferences, '{}'::jsonb),
  '{email_notifications}',
  'false'::jsonb
)
WHERE id = 'user-uuid';
```

---

## 🎨 Email Template Design

### Features:
- ✅ Responsive design (รองรับทุก device)
- ✅ สีสันตามประเภทการแจ้งเตือน
- ✅ ข้อมูลครบถ้วน (วันที่, เวลา, หมอ, สาขา, แผนก)
- ✅ รูปแบบสวยงามด้วย HTML/CSS
- ✅ แสดงวันที่แบบไทย (วันจันทร์ ที่ 30 ม.ค. 2568)

### สีของแต่ละประเภท:
- **3 วันก่อน**: 🔵 สีน้ำเงิน (#3b82f6)
- **1 วันก่อน**: 🟡 สีส้ม (#f59e0b)
- **6 ชั่วโมง**: 🔴 สีแดง (#ef4444)
- **อนุมัติแล้ว**: 🟢 สีเขียว (#10b981)
- **ปฏิเสธ**: 🔴 สีแดง (#ef4444)

---

## 🔍 Logic การแจ้งเตือน

### 1. การคำนวณเวลา

```javascript
const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`)
const hoursUntil = (appointmentDateTime - now) / (1000 * 60 * 60)
const daysUntil = hoursUntil / 24
```

### 2. เงื่อนไขแต่ละประเภท

**3 วันก่อน:**
```javascript
if (daysUntil >= 2.75 && daysUntil <= 3.25) {
  // ส่ง Email
}
```
- Tolerance: ±6 ชม. (0.25 วัน)
- เช่น นัดวันที่ 30 จะส่งวันที่ 27

**1 วันก่อน:**
```javascript
if (daysUntil >= 0.75 && daysUntil <= 1.25 && hoursUntil >= 6) {
  // ส่ง Email
}
```
- ต้องมากกว่า 6 ชม.
- ถ้านัดภายใน 6 ชม. จะข้ามไป

**6 ชั่วโมงก่อน:**
```javascript
if (hoursUntil >= 5.5 && hoursUntil <= 6.5) {
  // ส่ง Email
}
```
- Tolerance: ±30 นาที

---

## 🚨 Troubleshooting

### ไม่ได้รับ Email

1. **ตรวจสอบ Gmail Configuration**
   ```bash
   node -e "console.log(process.env.GMAIL_USER, process.env.GMAIL_APP_PASSWORD)"
   ```

2. **ตรวจสอบว่า Email ถูกต้อง**
   ```sql
   SELECT id, full_name, email FROM profiles WHERE id = 'user-uuid';
   ```

3. **ตรวจสอบ Email Notifications Setting**
   ```sql
   SELECT
     id,
     full_name,
     notification_preferences->>'email_notifications' as email_enabled
   FROM profiles
   WHERE id = 'user-uuid';
   ```

4. **ตรวจสอบ Spam/Junk Folder**
   - Email อาจถูกจัดเป็น spam
   - ให้ผู้ใช้ mark as "Not Spam"

5. **ดู Logs**
   ```bash
   curl -X GET http://localhost:3001/api/cron/send-appointment-email-reminders \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     | jq
   ```

### Email ส่งซ้ำ

- ตรวจสอบตาราง `appointment_notifications`
- ลบ record ถ้าต้องการทดสอบส่งใหม่:
  ```sql
  DELETE FROM appointment_notifications
  WHERE appointment_id = 'uuid' AND reminder_type = '3_days_email';
  ```

### Gmail Rate Limiting

Gmail มีข้อจำกัด:
- **500 emails/day** (free Gmail account)
- **2,000 emails/day** (Google Workspace)

ถ้าส่งเกิน limit:
- ใช้ Resend, SendGrid, Mailgun แทน
- หรือ Upgrade เป็น Google Workspace

---

## 📱 ตัวอย่าง Email ที่ส่งออกไป

### 3 วันก่อน:
```
Subject: 🗓️ เตือนนัดหมาย - 3 วันก่อนนัด

สวัสดีค่ะคุณ สมชาย ใจดี

📋 รายละเอียดการนัดหมาย
📅 วันที่: จันทร์ ที่ 30 ม.ค. 2568
⏰ เวลา: 10:00 น.
👨‍⚕️ แพทย์: นพ.สมหมาย รักษาดี
🏥 สาขา: โรงพยาบาลกรุงเทพ สาขาสยาม
🏢 แผนก: อายุรกรรม

คุณมีนัดพบแพทย์ในอีก 3 วัน กรุณาเตรียมตัวและจดจำวันนัดหมาย
```

### 1 วันก่อน:
```
Subject: ⏰ เตือนนัดหมาย - พรุ่งนี้มีนัดพบแพทย์

สวัสดีค่ะคุณ สมชาย ใจดี

📋 รายละเอียดการนัดหมาย
📅 วันที่: จันทร์ ที่ 30 ม.ค. 2568
⏰ เวลา: 10:00 น.
👨‍⚕️ แพทย์: นพ.สมหมาย รักษาดี
🏥 สาขา: โรงพยาบาลกรุงเทพ สาขาสยาม

⚠️ กรุณามาถึงก่อนเวลานัด 15 นาที
```

### 6 ชั่วโมงก่อน:
```
Subject: 🔔 เตือนนัดหมาย - อีก 6 ชั่วโมงถึงเวลานัด

สวัสดีค่ะคุณ สมชาย ใจดี

📋 รายละเอียดการนัดหมาย
📅 วันที่: จันทร์ ที่ 30 ม.ค. 2568
⏰ เวลา: 10:00 น.
👨‍⚕️ แพทย์: นพ.สมหมาย รักษาดี
🏥 สาขา: โรงพยาบาลกรุงเทพ สาขาสยาม
🏢 แผนก: อายุรกรรม

⚠️ กรุณามาถึงก่อนเวลานัด 15 นาที
```

---

## 💰 ค่าใช้จ่าย

**Gmail (ฟรี):**
- ฟรีสำหรับ 500 emails/day
- เหมาะสำหรับ startup และ testing

**Google Workspace ($6/user/month):**
- 2,000 emails/day
- Professional email address
- เหมาะสำหรับ production

**ทางเลือกอื่น:**
- **Resend**: $20/month (50,000 emails)
- **SendGrid**: Free tier 100 emails/day
- **Mailgun**: Free tier 1,000 emails/month

---

## ✅ Checklist การ Deploy

- [ ] ตรวจสอบ Gmail credentials ใน .env.local
- [ ] ตั้งค่า Gmail App Password
- [ ] ตรวจสอบว่าตาราง `appointment_notifications` มีอยู่แล้ว
- [ ] เพิ่ม Cron Job ใน vercel.json
- [ ] ทดสอบส่ง Email ด้วย test script
- [ ] ตรวจสอบ Gmail sending limit เพียงพอ
- [ ] เปิดใช้งาน Email Notifications สำหรับ test user
- [ ] ตรวจสอบ logs หลังจากรัน cron job
- [ ] ทดสอบ Email ไม่ไปอยู่ใน Spam

---

## 📈 การรวมระบบ SMS + Email

ระบบจะส่งทั้ง SMS และ Email พร้อมกัน:

| Event | SMS | Email | In-App |
|-------|-----|-------|--------|
| หลังอนุมัติ | ✅ | ✅ | ✅ |
| 3 วันก่อน | ✅ | ✅ | ✅ |
| 1 วันก่อน | ✅ | ✅ | ✅ |
| 6 ชม.ก่อน | ✅ | ✅ | ✅ |

**ผู้ใช้สามารถเลือกได้ว่า:**
- เปิดเฉพาะ SMS
- เปิดเฉพาะ Email
- เปิดทั้งคู่
- ปิดทั้งหมด (มีแค่ in-app notification)

---

**หมายเหตุ:**
- Cron job จะรันทุกชั่วโมง แต่จะส่ง Email เฉพาะนัดหมายที่ตรงเงื่อนไขเท่านั้น
- การแจ้งเตือนแต่ละประเภทจะส่งเพียงครั้งเดียว (ป้องกันด้วยตาราง tracking)
- ผู้ใช้สามารถปิดการแจ้งเตือนได้ตลอดเวลาที่หน้า Profile
- Email และ SMS ใช้ tracking ร่วมกันในตาราง `appointment_notifications`
