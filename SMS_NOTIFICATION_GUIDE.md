# 📱 คู่มือระบบแจ้งเตือน SMS อัตโนมัติ

## ภาพรวมระบบ

ระบบแจ้งเตือน SMS อัตโนมัติสำหรับ Health Queue จะส่ง SMS แจ้งเตือนผู้ใช้ในจังหวะที่สำคัญ 4 ครั้ง:

### 🔔 ประเภทการแจ้งเตือน

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

### ขั้นตอนที่ 1: สร้างตาราง tracking

```bash
node scripts/setup-notification-tracking.js
```

ตารางนี้จะเก็บข้อมูลว่าส่ง SMS แจ้งเตือนไปแล้ว เพื่อป้องกันการส่งซ้ำ

### ขั้นตอนที่ 2: เพิ่ม CRON_SECRET ใน .env.local

```.env
CRON_SECRET=your-secure-random-string-here
```

**สร้าง random string:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### ขั้นตอนที่ 3: ตั้งค่า Cron Job

#### วิธีที่ 1: ใช้ Vercel Cron (แนะนำ)

สร้างไฟล์ `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-appointment-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Schedule**: ทุกชั่วโมง (minute 0 of every hour)

#### วิธีที่ 2: ใช้บริการ Cron ภายนอก

เช่น cron-job.org, EasyCron:
- URL: `https://your-domain.com/api/cron/send-appointment-reminders`
- Method: GET
- Header: `Authorization: Bearer YOUR_CRON_SECRET`
- Frequency: ทุกชั่วโมง

---

## 🧪 การทดสอบ

### ทดสอบ Cron Job API

```bash
curl -X GET http://localhost:3001/api/cron/send-appointment-reminders \
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
      "phone": "+66812345678",
      "reminderType": "3_days",
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

### สร้างข้อมูลทดสอบ

```sql
-- สร้างนัดหมายทดสอบที่จะได้รับการแจ้งเตือน 3 วัน
INSERT INTO appointments (
  user_id,
  doctor_id,
  branch_id,
  department_id,
  appointment_date,
  appointment_time,
  status
) VALUES (
  'user-uuid',
  'doctor-uuid',
  'branch-uuid',
  'department-uuid',
  CURRENT_DATE + INTERVAL '3 days',
  '10:00',
  'approved'
);

-- ตรวจสอบว่าผู้ใช้เปิด SMS notifications
UPDATE profiles
SET notification_preferences = jsonb_set(
  COALESCE(notification_preferences, '{}'::jsonb),
  '{sms_notifications}',
  'true'::jsonb
)
WHERE id = 'user-uuid';
```

---

## 📊 ตรวจสอบการทำงาน

### ดูประวัติการส่ง SMS

```sql
SELECT
  an.id,
  an.reminder_type,
  an.sent_at,
  a.appointment_date,
  a.appointment_time,
  p.full_name,
  p.phone
FROM appointment_notifications an
JOIN appointments a ON an.appointment_id = a.id
JOIN profiles p ON a.user_id = p.id
ORDER BY an.sent_at DESC
LIMIT 10;
```

### นับจำนวน SMS ที่ส่งแต่ละประเภท

```sql
SELECT
  reminder_type,
  COUNT(*) as total_sent,
  MAX(sent_at) as last_sent
FROM appointment_notifications
GROUP BY reminder_type;
```

---

## ⚙️ การตั้งค่า SMS

### ผู้ใช้สามารถเปิด/ปิด SMS ได้ที่:
- **หน้า Profile** → Notification Settings → SMS Notifications

### เงื่อนไขการส่ง:
1. ผู้ใช้ต้องเปิด `notification_preferences.sms_notifications = true`
2. นัดหมายต้องมีสถานะ `status = 'approved'`
3. ต้องมีเบอร์โทรศัพท์ในตาราง profiles
4. ยังไม่เคยส่งการแจ้งเตือนประเภทนี้ไปแล้ว

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
  // ส่ง SMS
}
```
- Tolerance: ±6 ชม. (0.25 วัน)
- เช่น นัดวันที่ 30 จะส่งวันที่ 27

**1 วันก่อน:**
```javascript
if (daysUntil >= 0.75 && daysUntil <= 1.25 && hoursUntil >= 6) {
  // ส่ง SMS
}
```
- ต้องมากกว่า 6 ชม.
- ถ้านัดภายใน 6 ชม. จะข้ามไป

**6 ชั่วโมงก่อน:**
```javascript
if (hoursUntil >= 5.5 && hoursUntil <= 6.5) {
  // ส่ง SMS
}
```
- Tolerance: ±30 นาที

---

## 🚨 Troubleshooting

### ไม่ได้รับ SMS

1. **ตรวจสอบ Twilio Account**
   ```bash
   node scripts/test-twilio-direct.js
   ```

2. **ตรวจสอบเบอร์โทร**
   - ต้องเป็นรูปแบบ +66XXXXXXXXX
   - ต้องเป็นเบอร์ที่ verified ใน Twilio (ถ้าเป็น Trial Account)

3. **ตรวจสอบ SMS Notifications**
   ```sql
   SELECT sms_notifications FROM users WHERE id = 'user-uuid';
   ```

4. **ดู Logs**
   ```bash
   # Check cron job response
   curl -X GET http://localhost:3001/api/cron/send-appointment-reminders \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     | jq
   ```

### SMS ส่งซ้ำ

- ตรวจสอบตาราง `appointment_notifications`
- ลบ record ถ้าต้องการทดสอบส่งใหม่:
  ```sql
  DELETE FROM appointment_notifications
  WHERE appointment_id = 'uuid' AND reminder_type = '3_days';
  ```

---

## 📱 ตัวอย่าง SMS ที่ส่งออกไป

### 3 วันก่อน:
```
[Health Queue] เตือนความจำ: คุณมีนัดพบแพทย์ในอีก 3 วัน
วันที่: 30 ม.ค. 2568
เวลา: 10:00 น.
แพทย์: นพ.สมชาย ใจดี
สถานที่: โรงพยาบาลกรุงเทพ สาขาสยาม
```

### 1 วันก่อน:
```
[Health Queue] เตือนความจำ: คุณมีนัดพบแพทย์พรุ่งนี้
วันที่: 30 ม.ค. 2568
เวลา: 10:00 น.
แพทย์: นพ.สมชาย ใจดี
สาขา: โรงพยาบาลกรุงเทพ สาขาสยาม
กรุณามาถึงก่อนเวลานัด 15 นาที
```

### 6 ชั่วโมงก่อน:
```
[Health Queue] แจ้งเตือน: ใกล้ถึงเวลานัดหมายของคุณแล้ว
วันที่: วันนี้
เวลา: 10:00 น. (อีก 6 ชั่วโมง)
แพทย์: นพ.สมชาย ใจดี
สาขา: โรงพยาบาลกรุงเทพ สาขาสยาม
แผนก: อายุรกรรม
กรุณาเตรียมตัวและมาถึงก่อนเวลา
```

---

## 💰 ค่าใช้จ่าย Twilio

- Trial Account: ฟรี (เฉพาะเบอร์ verified)
- Pay-as-you-go: ~$0.0075/SMS (ประมาณ 0.25 บาท)
- ถ้ามีนัดหมาย 100 ครั้ง/เดือน = 300 SMS = ~75 บาท/เดือน

---

## ✅ Checklist การ Deploy

- [ ] รัน `node scripts/setup-notification-tracking.js`
- [ ] เพิ่ม `CRON_SECRET` ใน .env.local
- [ ] ตั้งค่า Vercel Cron หรือ External Cron Service
- [ ] ทดสอบส่ง SMS ด้วย curl
- [ ] ตรวจสอบ Twilio Account มี credit เพียงพอ
- [ ] เปิดใช้งาน SMS Notifications สำหรับ test user
- [ ] ตรวจสอบ logs หลังจากรัน cron job

---

**หมายเหตุ:**
- Cron job จะรันทุกชั่วโมง แต่จะส่ง SMS เฉพาะนัดหมายที่ตรงเงื่อนไขเท่านั้น
- การแจ้งเตือนแต่ละประเภทจะส่งเพียงครั้งเดียว (ป้องกันด้วยตาราง tracking)
- ผู้ใช้สามารถปิดการแจ้งเตือนได้ตลอดเวลาที่หน้า Profile
