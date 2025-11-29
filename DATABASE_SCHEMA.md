# Database Schema (Complete - from Supabase CSV)

## Table: admin_messages

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| sender_id | uuid | YES | null |
| sender_role | text | NO | null |
| recipient_id | uuid | YES | null |
| user_id | uuid | YES | null |
| message | text | NO | null |
| message_type | text | YES | 'text' |
| metadata | jsonb | YES | null |
| is_read | boolean | YES | false |
| read_at | timestamp | YES | null |
| created_at | timestamp | YES | now() |
| updated_at | timestamp | YES | now() |
| expires_at | timestamp | YES | now() + 60 days |

## Table: admins

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | YES | null |
| status | text | YES | 'active' |
| created_at | timestamp | YES | now() |

## Table: appointments

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key |
| user_id | uuid | YES | null | FK to profiles |
| doctor_id | uuid | YES | null | FK to doctors |
| branch_id | integer | YES | null | FK to branches |
| department_id | integer | YES | null | FK to departments |
| appointment_date | date | YES | null | วันที่นัดหมาย |
| appointment_time | time | YES | null | เวลานัดหมาย |
| primary_date | date | YES | null | วันที่ตัวเลือกหลัก |
| primary_time | time | YES | null | เวลาตัวเลือกหลัก |
| primary_flexible | boolean | YES | false | ยืดหยุ่นเวลาได้ไหม |
| secondary_date | date | YES | null | วันที่ตัวเลือกรอง |
| secondary_time | time | YES | null | เวลาตัวเลือกรอง |
| secondary_flexible | boolean | YES | false | ยืดหยุ่นเวลาได้ไหม |
| confirmed_date | date | YES | null | วันที่ยืนยันแล้ว |
| confirmed_time | time | YES | null | เวลาที่ยืนยันแล้ว |
| approved_option | text | YES | null | 'primary' or 'secondary' |
| status | appointment_status | NO | 'booked' | Status enum: 'booked', 'approved', 'completed', 'cancelled', 'rejected' |
| service_type | text | YES | 'standard' | ประเภทบริการ |
| service_date | date | YES | null | วันที่ให้บริการ |
| queue_no | integer | YES | null | หมายเลขคิว |
| queue_number | integer | YES | null | หมายเลขคิว (เก่า) |
| symptoms | text | YES | null | อาการ |
| notes | text | YES | null | หมายเหตุจากผู้ป่วย |
| admin_notes | text | YES | null | หมายเหตุจาก admin |
| cancel_reason | text | YES | null | เหตุผลยกเลิก |
| sent_to_doctor_at | timestamp | YES | null | เวลาที่ส่งอีเมลหาหมอ |
| treatment_completed_at | timestamp | YES | null | เวลาที่รักษาเสร็จ |
| followup_email_sent_at | timestamp | YES | null | เวลาที่ส่งอีเมล follow-up |
| treatment_note | text | YES | null | หมายเหตุจากหมอหลังรักษาเสร็จ |
| treatment_file_url | text | YES | null | JSON array ของ URL ไฟล์ผลการรักษา |
| created_at | timestamp | YES | now() | |

## Table: appointment_files

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | bigint | NO | nextval('appointment_files_id_seq') |
| appointment_id | uuid | NO | null |
| file_name | text | NO | null |
| file_path | text | NO | null |
| file_url | text | NO | null |
| file_type | text | NO | null |
| file_size | bigint | NO | null |
| uploaded_at | timestamp | YES | now() |
| created_at | timestamp | YES | now() |

## Table: appointment_notifications

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| appointment_id | uuid | NO | null | FK to appointments |
| reminder_type | text | NO | null | '3_days', '1_day', or '6_hours' |
| sent_at | timestamptz | NO | now() | เวลาที่ส่ง SMS |
| created_at | timestamptz | NO | now() | |

**Constraints:**
- UNIQUE(appointment_id, reminder_type) - ป้องกันการส่ง SMS ซ้ำ
- CHECK(reminder_type IN ('3_days', '1_day', '6_hours'))

**Purpose:** Track SMS notifications to prevent duplicate sends

## Table: appointment_queue_counters

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| doctor_id | uuid | NO | null |
| service_date | date | NO | null |
| last_no | integer | NO | 0 |

## Table: branches

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('branches_id_seq') |
| name | text | NO | null |
| address | text | YES | null |
| phone | text | YES | null |
| created_at | timestamp | YES | now() |

## Table: departments

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('departments_id_seq') |
| name | text | NO | null |
| code | text | YES | null |
| branch_id | integer | YES | null |
| created_at | timestamp | YES | now() |

## Table: branch_departments

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('branch_departments_id_seq') |
| branch_id | integer | NO | null |
| department_id | integer | NO | null |
| created_at | timestamp | YES | now() |

## Table: doctors

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | null |
| contact_name | text | YES | null |
| contact_email | text | YES | null |
| contact_type | text | YES | 'direct' |
| phone | text | YES | null |
| line_id | text | YES | null |
| specialty | text | NO | null |
| branch_id | integer | YES | null |
| department_id | integer | YES | null |
| image_url | text | YES | null |
| status | text | YES | 'active' |
| created_at | timestamp | YES | now() |

## Table: notifications

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | YES | null |
| title | text | YES | null |
| message | text | YES | null |
| type | text | YES | null |
| is_read | boolean | YES | false |
| created_at | timestamp | YES | now() |

## Table: payments

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| appointment_id | uuid | NO | null |
| user_id | uuid | NO | null |
| amount | numeric | NO | null |
| payment_method | varchar | YES | 'qr_code' |
| payment_status | varchar | YES | 'pending' |
| qr_code_data | text | YES | null |

## Table: profiles

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | null | FK to auth.users.id |
| email | text | YES | null | User email |
| full_name | text | YES | null | ชื่อ-นามสกุล |
| phone | text | YES | null | เบอร์โทร |
| gender | text | YES | null | เพศ |
| date_of_birth | date | YES | null | วันเกิด |
| id_card | text | YES | null | เลขบัตรประชาชน (สำหรับคนไทย) |
| passport_number | text | YES | null | เลขพาสปอร์ต (สำหรับชาวต่างชาติ) |
| allergies | text | YES | null | ประวัติแพ้ยา |
| is_foreign | boolean | YES | false | เป็นชาวต่างชาติหรือไม่ |
| preferred_language | text | YES | 'th' | ภาษาที่ต้องการ (th, en, etc.) |
| notification_preferences | jsonb | YES | null | ตั้งค่าการแจ้งเตือน (email, SMS) |
| created_at | timestamp | YES | now() | |
| updated_at | timestamp | YES | now() | |

**Constraints:**
- PRIMARY KEY (id)
- FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
- CHECK: Either `id_card` OR `passport_number` must exist (one required, not both)

**Identification Fields:**
1. **คนไทย**: ใช้ `id_card` (เลขบัตรประชาชน 13 หลัก)
2. **ชาวต่างชาติ**: ใช้ `passport_number` (เลขพาสปอร์ต)

**Note**:
- ลบ columns `address` และ `passport_id` ออกแล้ว (cleanup_profiles_columns.sql)
- ใช้ `passport_number` เป็น field หลักสำหรับพาสปอร์ต
- ผู้ใช้ต้องมีอย่างใดอย่างหนึ่ง: `id_card` **หรือ** `passport_number`
- เพิ่ม `is_foreign`, `preferred_language`, `notification_preferences` สำหรับระบบหลายภาษาและการแจ้งเตือน

## Table: canned_responses

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| title | text | NO | null | ชื่อข้อความสำเร็จรูป |
| message | text | NO | null | เนื้อหาข้อความ |
| category | text | YES | 'general' | หมวดหมู่ (greeting, inquiry, confirmation, document_request, general, other) |
| shortcut | text | YES | null | รหัสลัด (เช่น /hello) |
| usage_count | integer | YES | 0 | จำนวนครั้งที่ใช้ |
| created_at | timestamp | YES | now() | |
| updated_at | timestamp | YES | now() | |

**Purpose:** Store pre-written messages for admin chat (Canned Responses)

## Table: chat_tags

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| message_id | uuid | NO | null | FK to admin_messages.id |
| tag | text | NO | null | Tag name (urgent, follow_up, resolved, etc.) |
| created_at | timestamp | YES | now() | |

**Constraints:**
- FOREIGN KEY (message_id) REFERENCES admin_messages(id) ON DELETE CASCADE
- INDEX on message_id for fast lookups

**Purpose:** Tag system for admin chat messages

## Table: otp_verifications

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key |
| email | text | NO | null | Email address to verify |
| otp | text | NO | null | 6-digit OTP code |
| expires_at | timestamptz | NO | null | OTP expiration time (10 minutes) |
| verified | boolean | YES | false | Whether OTP has been verified |
| created_at | timestamptz | YES | now() | |

**Constraints:**
- INDEX on email for fast lookups
- INDEX on expires_at for cleanup

**RLS Policies:**
- Service role can manage all OTPs
- Regular users cannot access this table directly

**Purpose:** Store temporary OTP codes for email verification during user registration

## Storage Buckets

### medical-documents
- Public access
- Stores appointment files (appointment_files table)
- Stores treatment result files (treatment_file_url in appointments)

## Important Notes

1. **appointments.status** is enum type with values: 'booked', 'approved', 'completed', 'cancelled', 'rejected'
2. **branch_id** and **department_id** are **integers** in appointments, doctors, departments tables
3. **doctor_id**, **user_id** are **uuid** in appointments
4. **treatment_file_url** stores JSON array string of file URLs
5. **admin_messages** has auto-expire after 60 days
6. **appointment_notifications** tracks SMS reminders sent to users (3 days, 1 day, 6 hours before appointment)
7. **UNIQUE constraint** on (appointment_id, reminder_type) prevents duplicate SMS sends
8. **profiles table** - ใช้ `passport_number` แทน `passport_id` (ลบ columns: `address`, `passport_id`)
9. **canned_responses** - ระบบข้อความสำเร็จรูปสำหรับ admin chat
10. **chat_tags** - ระบบแท็กสำหรับ admin messages (urgent, follow_up, resolved, etc.)
11. **otp_verifications** - ระบบยืนยันอีเมลด้วย OTP สำหรับการสมัครสมาชิก (OTP หมดอายุใน 10 นาที)
12. **profiles.notification_preferences** - เก็บการตั้งค่าการแจ้งเตือนแบบ JSONB (email_notifications, sms_notifications)
13. **Supabase Auth Trigger** - มี trigger สร้าง profile อัตโนมัติเมื่อมี user ใหม่ใน auth.users
14. **Registration Flow** - ใช้ `.upsert()` แทน `.insert()` เพื่อหลีกเลี่ยง duplicate key error จาก trigger

---

## 🔧 Admin Commands (For Manual Updates Only - Claude Ignore This Section)

### Update Schema from Supabase

Run this SQL in Supabase Dashboard SQL Editor:

```sql
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

Then export as CSV and update this file.
