# Admin & Hospital Staff Development Guide - Health Queue System

> **คู่มือฉบับสมบูรณ์สำหรับพัฒนาฝั่ง Admin และ Hospital Staff (Doctor, Nurse, Cashier)**
>
> สำหรับ: ลัลลา (Admin-side Developer)
>
> เอกสารนี้รวมทุกข้อมูลที่ต้องรู้เกี่ยวกับการพัฒนาฝั่งโรงพยาบาล

---

## ⚠️ **อ่านนี่ก่อน! - สิ่งที่ทำแล้ว vs ยังไม่ทำ**

### ✅ สิ่งที่เนมทำให้แล้ว (อย่าแก้!)

**1. Database Tables ที่มีใน Supabase แล้ว:**
- `auth.users` - ตาราง identity จาก Supabase Auth (แหล่งหลัก)
- `profiles` - ข้อมูล metadata เสริม (optional)
- `admins` - ตาราง role ของ admin (FK: `user_id` → `auth.users.id`)
- `doctors` - ตาราง role ของหมอ (FK: `user_id` → `auth.users.id`)
- `appointments` - ระบบจองนัดหมาย (มี cancel/reschedule)
- `payments` - ระบบชำระเงิน + QR Code
- `points_history` - ประวัติคะแนนสะสม
- `notifications` - ระบบแจ้งเตือน
- `favorite_doctors` - หมอที่ชอบ
- `doctor_reviews` - รีวิวหมอ
- `admin_messages` - ข้อความจาก admin

**2. Authentication System:**
- ไฟล์: `lib/auth.js`
- ตอนนี้รองรับแค่ **3 roles**: `user`, `admin`, `doctor`
- Function `getUserRole()` ตรวจสอบจาก `admins` และ `doctors` tables
- Function `getRedirectPath()` redirect ไปหน้า dashboard ตาม role

**3. API Endpoints ที่มีแล้ว (ฝั่ง User):**
- `/api/appointments/*` - จอง/ยกเลิก/เปลี่ยนนัด
- `/api/notifications/*` - ระบบแจ้งเตือน
- `/api/favorites/*` - จัดการหมอที่ชอบ
- `/api/doctors/[id]/reviews` - รีวิวหมอ
- `/api/generate-qr` - สร้าง QR code ชำระเงิน

**4. User Features (เสร็จสมบูรณ์):**
- ระบบจองนัด + ชำระเงิน + QR Code
- ระบบคะแนนสะสม (100 บาท = 1 แต้ม)
- รีวิวหมอ + ให้คะแนน
- ค้นหา/กรอง/เรียงลำดับหมอ
- Favorite doctors
- ดูประวัติการนัด
- แชทบอท AI

---

### 🔨 สิ่งที่คุณ (ลัลลา) ต้องทำ

**0. แก้ Bug เร่งด่วน! 🚨**
- ❌ **แก้ RLS Policy ของ `admin_messages` table**
  - ตอนนี้ user ส่งข้อความแล้วได้ `403 (Forbidden)` error
  - **สาเหตุ**: RLS policy บล็อกการ INSERT ข้อความจาก AI/system (sender_id = null)
  - **วิธีแก้**: ไปที่ Supabase Dashboard → SQL Editor แล้วรันคำสั่งนี้:

    ```sql
    -- 1. ลบ policy เดิมที่มีปัญหา
    DROP POLICY IF EXISTS "Users can send messages" ON public.admin_messages;

    -- 2. สร้าง policy ใหม่ที่อนุญาตทั้ง user messages และ AI/system messages
    CREATE POLICY "Users can send messages v2"
    ON public.admin_messages
    FOR INSERT
    WITH CHECK (
      -- Case 1: User sending message (sender_id = auth.uid())
      (auth.uid() = sender_id AND sender_role IN ('user', 'admin'))
      OR
      -- Case 2: System/AI sending message to user (recipient_id = auth.uid())
      (auth.uid() = recipient_id AND sender_role IN ('ai', 'system'))
      OR
      -- Case 3: Authenticated user can insert AI/system messages
      (sender_id IS NULL AND sender_role IN ('ai', 'system') AND auth.uid() IS NOT NULL)
    );
    ```

  - **เสร็จแล้วทดสอบ**: ให้เนมลองส่งข้อความใหม่ใน chat - ไม่ควรมี 403 error อีก
  - **และ** สร้าง Admin Dashboard เพื่ออ่านข้อความจาก `admin_messages` table
  - **และ** เพิ่ม API endpoint: `/api/admin/messages` สำหรับ admin อ่านข้อความ

**1. เพิ่ม 2 Roles ใหม่:**
- ❌ **nurse** (พยาบาล) - ยังไม่มี
- ❌ **cashier** (แคชเชียร์) - ยังไม่มี

**2. สร้าง 4 Tables ใหม่:**
- ❌ `nurses` - ข้อมูลพยาบาล
- ❌ `cashiers` - ข้อมูลแคชเชียร์
- ❌ `vital_signs` - บันทึกการวัดสัญญาณชีพ
- ❌ `prescriptions` - ใบสั่งยาจากหมอ

**3. แก้ไข Authentication (`lib/auth.js`):**
- ❌ เพิ่มการตรวจสอบ `nurses` table
- ❌ เพิ่มการตรวจสอบ `cashiers` table
- ❌ อัพเดท `getRedirectPath()` ให้รองรับ 5 roles

**4. สร้าง Admin APIs:**
- ❌ Nurse APIs - บันทึก vital signs, จัดการคิว
- ❌ Doctor APIs - ดู vital signs, สั่งยา, บันทึกการตรวจ
- ❌ Cashier APIs - ดูใบสั่งยา, จ่ายยา, คิดเงิน
- ❌ Admin APIs - จัดการ staff, ดู dashboard, รายงาน

**5. สร้าง 4 Dashboards:**
- ❌ Admin Dashboard - จัดการทุกอย่าง
- ❌ Doctor Dashboard - ตรวจ + สั่งยา
- ❌ Nurse Dashboard - วัด vital signs
- ❌ Cashier Dashboard - จ่ายยา + คิดเงิน

---

### ⚠️ ข้อควรระวัง - Database Constraints

**สำคัญมาก!** ตาราง role ทุกตาราง **ต้องใช้ FK ชี้ไปที่ `auth.users.id`** (ไม่ใช่ `profiles.id`)

เพราะอะไร?
- `auth.users` = แหล่งหลัก (single source of truth) สำหรับ identity
- `profiles` = metadata เสริม (optional) - อาจมีหรือไม่มีก็ได้

ตัวอย่างที่เนมทำไว้แล้ว:
```sql
-- admins table
ALTER TABLE public.admins
  ADD CONSTRAINT admins_user_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)  -- ชี้ไปที่ auth.users!
  ON DELETE CASCADE;

-- doctors table
ALTER TABLE public.doctors
  ADD CONSTRAINT doctors_user_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)  -- ชี้ไปที่ auth.users!
  ON DELETE CASCADE;
```

**คุณต้องทำเหมือนกัน:**
```sql
-- nurses table (คุณต้องสร้าง)
ALTER TABLE public.nurses
  ADD CONSTRAINT nurses_user_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)  -- ชี้ไปที่ auth.users!
  ON DELETE CASCADE;

-- cashiers table (คุณต้องสร้าง)
ALTER TABLE public.cashiers
  ADD CONSTRAINT cashiers_user_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)  -- ชี้ไปที่ auth.users!
  ON DELETE CASCADE;
```

ดูไฟล์ `database-migration.sql` เพื่อดูตัวอย่างเพิ่มเติม

---

### 📊 Timeline (48 ชั่วโมง)

- **Phase 1-3** (Database + Auth): 6-8 ชม.
- **Phase 4-7** (APIs): 12-16 ชม.
- **Phase 8-11** (Dashboards): 16-20 ชม.
- **Phase 12** (Testing): 2-4 ชม.

**รวม: 36-48 ชั่วโมง** (พอดีกับเวลาที่มี!)

---

### 🚀 ก่อนเริ่มงาน - สิ่งที่ต้องเช็คก่อน!

**Step 1: ตรวจสอบ Supabase Database**

เปิด Supabase Dashboard → SQL Editor แล้วรันคำสั่งนี้:

```sql
-- ดูว่ามี tables อะไรบ้างแล้ว
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

คุณควรเห็น tables เหล่านี้:
- ✅ `admins`
- ✅ `admin_messages`
- ✅ `appointments`
- ✅ `doctors`
- ✅ `doctor_reviews`
- ✅ `favorite_doctors`
- ✅ `notifications`
- ✅ `payments`
- ✅ `points_history`
- ✅ `profiles`
- ❌ `nurses` (ยังไม่มี - คุณต้องสร้าง)
- ❌ `cashiers` (ยังไม่มี - คุณต้องสร้าง)
- ❌ `vital_signs` (ยังไม่มี - คุณต้องสร้าง)
- ❌ `prescriptions` (ยังไม่มี - คุณต้องสร้าง)

**Step 2: ตรวจสอบ Foreign Keys**

รันคำสั่งนี้เพื่อดู FK constraints:

```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('admins', 'doctors')
ORDER BY tc.table_name;
```

คุณควรเห็น:
- `admins.user_id` → `auth.users.id` ✅
- `doctors.user_id` → `auth.users.id` ✅

**Step 3: Pull Code จาก Git**

```bash
git pull origin main
```

เช็คว่ามีไฟล์เหล่านี้:
- ✅ `lib/auth.js` - Authentication system (คุณจะต้องแก้ไข)
- ✅ `database-migration.sql` - ตัวอย่าง FK setup
- ✅ `ADMIN_DEV_GUIDE.md` - ไฟล์นี้!

**Step 4: เริ่มทำตาม Implementation Checklist (Section 9)**

---

### 💡 Tips สำคัญ

1. **อย่าแก้ของฝั่ง User!** - เนมจะทำ Flutter App ต่อ อย่าไปแก้ไข:
   - ไฟล์ใน `app/(auth)/*` ที่เกี่ยวกับ user
   - API endpoints ที่มี prefix `/api/appointments`, `/api/favorites`
   - Components ฝั่ง user

2. **ใช้ Same Supabase Instance** - เนมกับคุณใช้ database อันเดียวกัน:
   - ตรวจสอบให้แน่ใจว่า FK ชี้ไปที่ `auth.users.id` เสมอ
   - อย่าลบหรือแก้ไข tables ที่มีอยู่แล้ว
   - เพิ่มเฉพาะ tables ใหม่เท่านั้น

3. **Test บ่อยๆ** - หลังทำทุก phase:
   - ทดสอบ API endpoints ด้วย Postman/curl
   - ตรวจสอบ database constraints
   - ลอง login ด้วย role ต่างๆ

4. **Git Coordination**:
   - Pull ก่อนเริ่มงานทุกครั้ง
   - Commit บ่อยๆ (ทุกครั้งที่เสร็จ 1 phase)
   - Push เมื่อทำเสร็จและทดสอบแล้ว
   - อย่า commit ไฟล์ test (nul, test-*.js)

---

## 📋 สารบัญ

1. [ภาพรวมระบบและ Roles](#1-ภาพรวมระบบและ-roles)
2. [Database Schema ที่ต้องเพิ่ม](#2-database-schema-ที่ต้องเพิ่ม)
3. [API Endpoints ที่ต้องสร้าง](#3-api-endpoints-ที่ต้องสร้าง)
4. [Admin Dashboard Features](#4-admin-dashboard-features)
5. [Doctor Dashboard Features](#5-doctor-dashboard-features)
6. [Nurse Dashboard Features](#6-nurse-dashboard-features)
7. [Cashier Dashboard Features](#7-cashier-dashboard-features)
8. [Complete Workflow](#8-complete-workflow)
9. [Implementation Checklist](#9-implementation-checklist)

---

## 1. ภาพรวมระบบและ Roles

### 1.1 ฝั่งที่เนมทำแล้ว (User Side) ✅

**เนมทำฝั่ง User (คนไข้) เสร็จแล้ว:**
- จองนัดหมาย
- ชำระเงิน
- ดูประวัติการนัดหมาย
- รีวิวแพทย์
- ค้นหา/กรองแพทย์
- Favorite doctors
- แชท AI Chatbot

**คุณไม่ต้องยุ่ง!** เนมจะไปทำ Flutter App ต่อ

---

### 1.2 ฝั่งที่คุณ (ลัลลา) ต้องทำ (Hospital Side) 🔨

**ระบบมี 5 Roles ทั้งหมด:**

| Role | ผู้รับผิดชอบ | หน้าที่ |
|------|-------------|---------|
| **user** | เนม ✅ | คนไข้ - จองนัด, ชำระเงิน, รีวิว |
| **admin** | ลัลลา 🔨 | ผู้ดูแลระบบ - จัดการทุกอย่าง |
| **doctor** | ลัลลา 🔨 | หมอ - ตรวจ, วินิจฉัย, สั่งยา |
| **nurse** | ลัลลา 🔨 | พยาบาล - วัดความดัน, เก็บข้อมูล vital signs |
| **cashier** | ลัลลา 🔨 | แคชเชียร์ - เก็บเงิน, จ่ายยา |

**คุณต้องทำ 4 roles: admin, doctor, nurse, cashier**

---

### 1.3 Workflow สมบูรณ์

```
👤 User (เนมทำแล้ว):
   - จองนัดหมาย
   - ชำระค่าตรวจล่วงหน้า (ผ่าน PromptPay)

   ↓

🩺 Nurse (คุณทำ):
   - ตรวจสอบการนัดหมาย
   - เรียกคิว
   - วัด vital signs (ความดัน, น้ำหนัก, อุณหภูมิ, ชีพจร)
   - บันทึกอาการเบื้องต้น

   ↓

👨‍⚕️ Doctor (คุณทำ):
   - ดูข้อมูล vital signs ที่ nurse บันทึก
   - ตรวจผู้ป่วย
   - วินิจฉัยโรค (diagnosis)
   - สั่งยา (prescription)
   - บันทึก medical record

   ↓

💰 Cashier (คุณทำ):
   - ดูรายการยาที่ doctor สั่ง
   - คิดเงินยา
   - รับชำระเงิน (ถ้ามีค่ายา)
   - จ่ายยาตามใบสั่ง
   - ทำเครื่องหมายว่า "จ่ายยาแล้ว"

   ↓

👤 User: รับยา → เสร็จสิ้น ✅
```

---

## 2. Database Schema ที่ต้องเพิ่ม

### 2.1 เพิ่ม Roles ใหม่

ตอนนี้ระบบมี roles อยู่แล้ว:
- ✅ `users` table
- ✅ `admins` table
- ✅ `doctors` table

**ต้องเพิ่ม 2 tables:**

#### 📊 Table: `nurses`
```sql
CREATE TABLE IF NOT EXISTS nurses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  license_number TEXT UNIQUE,
  specialization TEXT, -- e.g., "ER", "Pediatric", "General"
  years_of_experience INTEGER,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nurses IS 'Nurses working at the hospital';
CREATE INDEX idx_nurses_user_id ON nurses(user_id);
```

#### 📊 Table: `cashiers`
```sql
CREATE TABLE IF NOT EXISTS cashiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  employee_id TEXT UNIQUE,
  shift TEXT, -- "morning", "afternoon", "night"
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE cashiers IS 'Cashiers handling payments and medicine dispensing';
CREATE INDEX idx_cashiers_user_id ON cashiers(user_id);
```

---

### 2.2 Vital Signs Table

#### 📊 Table: `vital_signs`
```sql
CREATE TABLE IF NOT EXISTS vital_signs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  nurse_id UUID REFERENCES nurses(id) NOT NULL,

  -- Measurements
  blood_pressure_systolic INTEGER, -- mmHg
  blood_pressure_diastolic INTEGER, -- mmHg
  heart_rate INTEGER, -- bpm
  temperature DECIMAL(4,1), -- Celsius
  weight DECIMAL(5,2), -- kg
  height DECIMAL(5,2), -- cm
  oxygen_saturation INTEGER, -- SpO2 percentage

  -- Additional info
  chief_complaint TEXT, -- อาการสำคัญที่มาพบ
  notes TEXT, -- บันทึกเพิ่มเติมจากพยาบาล

  measured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(appointment_id) -- 1 appointment = 1 vital signs record
);

COMMENT ON TABLE vital_signs IS 'Vital signs measured by nurses before doctor examination';
CREATE INDEX idx_vital_signs_appointment ON vital_signs(appointment_id);
CREATE INDEX idx_vital_signs_nurse ON vital_signs(nurse_id);
```

---

### 2.3 Prescriptions Table

#### 📊 Table: `prescriptions`
```sql
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  doctor_id UUID REFERENCES doctors(id) NOT NULL,

  -- Prescription details
  medications JSONB NOT NULL, -- Array of {name, dosage, frequency, duration, instructions}
  /*
    Example:
    [
      {
        "name": "Paracetamol 500mg",
        "quantity": 10,
        "dosage": "1 tablet",
        "frequency": "3 times daily",
        "duration": "3 days",
        "instructions": "Take after meals"
      }
    ]
  */

  diagnosis TEXT NOT NULL, -- การวินิจฉัย
  additional_notes TEXT, -- คำแนะนำเพิ่มเติม

  -- Dispensing info
  dispensed_by UUID REFERENCES cashiers(id), -- แคชเชียร์ที่จ่ายยา
  dispensed_at TIMESTAMPTZ, -- เวลาที่จ่ายยา
  medicine_cost DECIMAL(10,2) DEFAULT 0, -- ค่ายา
  is_dispensed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(appointment_id) -- 1 appointment = 1 prescription
);

COMMENT ON TABLE prescriptions IS 'Prescriptions issued by doctors and dispensed by cashiers';
CREATE INDEX idx_prescriptions_appointment ON prescriptions(appointment_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_is_dispensed ON prescriptions(is_dispensed);
```

---

### 2.4 Medical Records (ปรับปรุง)

Medical records table มีอยู่แล้ว แต่ต้องเชื่อมกับ prescriptions:

```sql
-- เพิ่ม column ใน medical_records (ถ้ายังไม่มี)
ALTER TABLE medical_records
ADD COLUMN IF NOT EXISTS prescription_id UUID REFERENCES prescriptions(id);

COMMENT ON COLUMN medical_records.prescription_id IS 'Link to prescription for this visit';
```

---

## 3. API Endpoints ที่ต้องสร้าง

### 3.1 Authentication & Role Management

#### POST `/api/auth/assign-role`
**ให้ admin เพิ่ม role ให้ user**

Request:
```json
{
  "user_id": "uuid",
  "role": "nurse", // or "cashier", "doctor", "admin"
  "additional_data": {
    "license_number": "N12345",
    "specialization": "General"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Role assigned successfully"
}
```

---

### 3.2 Nurse APIs

#### GET `/api/nurse/queue`
**ดึงรายการคิวนัดหมายวันนี้**

Response:
```json
{
  "queue": [
    {
      "id": "uuid",
      "queue_number": 1,
      "user": {
        "full_name": "สมชาย ใจดี",
        "age": 35,
        "gender": "male"
      },
      "appointment_time": "09:00",
      "doctor": {
        "full_name": "นพ.วิชัย",
        "specialty": "อายุรกรรม"
      },
      "symptoms": "ปวดหัว",
      "has_vital_signs": false // ยังไม่วัด vital signs
    }
  ]
}
```

#### POST `/api/nurse/vital-signs`
**บันทึก vital signs**

Request:
```json
{
  "appointment_id": "uuid",
  "blood_pressure_systolic": 120,
  "blood_pressure_diastolic": 80,
  "heart_rate": 72,
  "temperature": 36.5,
  "weight": 65.5,
  "height": 170,
  "oxygen_saturation": 98,
  "chief_complaint": "ปวดหัวมา 2 วัน",
  "notes": "ผู้ป่วยดูอ่อนแรง"
}
```

Response:
```json
{
  "success": true,
  "vital_signs": { /* vital signs object */ },
  "message": "Vital signs recorded successfully"
}
```

#### GET `/api/nurse/vital-signs/:appointmentId`
**ดู vital signs ที่บันทึกไว้**

Response:
```json
{
  "vital_signs": {
    "blood_pressure": "120/80",
    "heart_rate": 72,
    "temperature": 36.5,
    "weight": 65.5,
    "measured_at": "2024-01-15T09:30:00Z",
    "nurse": {
      "full_name": "พยาบาลสมหญิง"
    }
  }
}
```

---

### 3.3 Doctor APIs

#### GET `/api/doctor/appointments`
**ดึงรายการนัดหมายของ doctor**

Query params:
- `date` - วันที่ต้องการดู (default: today)
- `status` - filter ตาม status

Response:
```json
{
  "appointments": [
    {
      "id": "uuid",
      "queue_number": 1,
      "appointment_time": "09:00",
      "status": "confirmed",
      "user": {
        "full_name": "สมชาย ใจดี",
        "age": 35,
        "gender": "male",
        "phone": "0812345678"
      },
      "symptoms": "ปวดหัว",
      "vital_signs": {
        "blood_pressure": "120/80",
        "heart_rate": 72,
        "temperature": 36.5,
        "chief_complaint": "ปวดหัวมา 2 วัน"
      },
      "has_prescription": false
    }
  ]
}
```

#### GET `/api/doctor/patient-history/:userId`
**ดูประวัติการรักษาของผู้ป่วย**

Response:
```json
{
  "patient": {
    "full_name": "สมชาย ใจดี",
    "age": 35,
    "gender": "male",
    "blood_type": "O+"
  },
  "medical_history": [
    {
      "date": "2024-01-10",
      "doctor": "นพ.วิชัย",
      "diagnosis": "หวัด",
      "prescription": [
        {
          "name": "Paracetamol 500mg",
          "dosage": "1 tablet 3 times daily"
        }
      ]
    }
  ]
}
```

#### POST `/api/doctor/prescription`
**สั่งยา**

Request:
```json
{
  "appointment_id": "uuid",
  "diagnosis": "Acute upper respiratory infection (หวัด)",
  "medications": [
    {
      "name": "Paracetamol 500mg",
      "quantity": 10,
      "dosage": "1 tablet",
      "frequency": "3 times daily",
      "duration": "3 days",
      "instructions": "Take after meals"
    },
    {
      "name": "Amoxicillin 500mg",
      "quantity": 15,
      "dosage": "1 capsule",
      "frequency": "3 times daily",
      "duration": "5 days",
      "instructions": "Complete the full course"
    }
  ],
  "additional_notes": "พักผ่อนให้เพียงพอ ดื่มน้ำมากๆ",
  "medicine_cost": 150.00
}
```

Response:
```json
{
  "success": true,
  "prescription": { /* prescription object */ },
  "message": "Prescription created successfully"
}
```

#### PUT `/api/doctor/appointments/:id/complete`
**ปิดการตรวจเสร็จสิ้น**

Request:
```json
{
  "status": "completed"
}
```

---

### 3.4 Cashier APIs

#### GET `/api/cashier/pending-prescriptions`
**ดูรายการใบสั่งยาที่รอจ่าย**

Response:
```json
{
  "prescriptions": [
    {
      "id": "uuid",
      "appointment": {
        "queue_number": 1,
        "appointment_date": "2024-01-15",
        "user": {
          "full_name": "สมชาย ใจดี"
        }
      },
      "doctor": {
        "full_name": "นพ.วิชัย"
      },
      "diagnosis": "หวัด",
      "medications": [
        {
          "name": "Paracetamol 500mg",
          "quantity": 10,
          "dosage": "1 tablet",
          "frequency": "3 times daily",
          "instructions": "Take after meals"
        }
      ],
      "medicine_cost": 150.00,
      "is_dispensed": false,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### POST `/api/cashier/dispense-medicine`
**จ่ายยาและบันทึก**

Request:
```json
{
  "prescription_id": "uuid",
  "medicine_cost": 150.00,
  "payment_method": "cash" // or "qr_code", "card"
}
```

Response:
```json
{
  "success": true,
  "prescription": {
    "is_dispensed": true,
    "dispensed_at": "2024-01-15T10:30:00Z",
    "dispensed_by": "แคชเชียร์สมศรี"
  },
  "message": "Medicine dispensed successfully"
}
```

#### GET `/api/cashier/daily-sales`
**ดูยอดขายวันนี้**

Response:
```json
{
  "date": "2024-01-15",
  "total_sales": 4500.00,
  "total_transactions": 15,
  "payment_methods": {
    "cash": 3000.00,
    "qr_code": 1200.00,
    "card": 300.00
  },
  "dispensed_count": 15
}
```

---

### 3.5 Admin APIs

#### GET `/api/admin/dashboard-stats`
**สถิติภาพรวม**

Response:
```json
{
  "today": {
    "appointments": 25,
    "completed": 18,
    "pending": 7,
    "revenue": 12500.00
  },
  "this_month": {
    "appointments": 450,
    "revenue": 225000.00,
    "new_patients": 85
  },
  "staff": {
    "doctors": 5,
    "nurses": 8,
    "cashiers": 3,
    "online_now": {
      "doctors": 3,
      "nurses": 5,
      "cashiers": 2
    }
  }
}
```

#### GET/POST/PUT/DELETE `/api/admin/doctors`
**จัดการแพทย์**

#### GET/POST/PUT/DELETE `/api/admin/nurses`
**จัดการพยาบาล**

#### GET/POST/PUT/DELETE `/api/admin/cashiers`
**จัดการแคชเชียร์**

#### GET `/api/admin/appointments`
**ดูการนัดหมายทั้งหมด**

#### PUT `/api/admin/appointments/:id`
**แก้ไขการนัดหมาย**

---

## 4. Admin Dashboard Features

### 4.1 หน้าหลัก (Dashboard Overview)

**แสดง:**
- 📊 สถิติวันนี้ (appointments, revenue, patients)
- 📈 กราฟรายได้ 7 วันล่าสุด
- 👥 จำนวน staff online
- ⏰ การนัดหมายที่กำลังจะถึง
- 🔔 Notifications/Alerts

### 4.2 จัดการผู้ใช้ (User Management)

**หน้า: `/admin/users`**

Features:
- ตารางแสดงผู้ใช้ทั้งหมด
- ค้นหา/กรอง users
- เปลี่ยน role (user → doctor/nurse/cashier/admin)
- ระงับ/ปลดระงับ user
- ดูประวัติการใช้งาน

### 4.3 จัดการแพทย์ (Doctor Management)

**หน้า: `/admin/doctors`**

Features:
- CRUD แพทย์
- อัพโหลดรูปโปรไฟล์
- จัดการตารางเวลาทำงาน
- เปิด/ปิดสถานะรับนัด
- ดูสถิติการตรวจของแพทย์

### 4.4 จัดการพยาบาล (Nurse Management)

**หน้า: `/admin/nurses`**

Features:
- CRUD พยาบาล
- กำหนดกะการทำงาน (morning/afternoon/night)
- ดูสถิติการบันทึก vital signs

### 4.5 จัดการแคชเชียร์ (Cashier Management)

**หน้า: `/admin/cashiers`**

Features:
- CRUD แคชเชียร์
- กำหนดกะการทำงาน
- ดูยอดขายของแต่ละคน

### 4.6 จัดการคลินิก (Clinic Management)

**หน้า: `/admin/clinics`**

Features:
- CRUD คลินิก
- จัดการข้อมูล (ที่อยู่, เวลาทำการ)
- อัพโหลดรูปภาพคลินิก

### 4.7 จัดการนัดหมาย (Appointment Management)

**หน้า: `/admin/appointments`**

Features:
- ดูการนัดหมายทั้งหมด
- กรองตามวันที่, สถานะ, แพทย์
- ยกเลิก/แก้ไขนัดหมาย
- พิมพ์รายงาน

### 4.8 รายงานและสถิติ (Reports & Analytics)

**หน้า: `/admin/reports`**

Features:
- รายงานรายได้รายวัน/เดือน/ปี
- รายงานการนัดหมาย
- รายงานยา (ยาที่ใช้บ่อย, ค่าใช้จ่าย)
- สถิติแพทย์ยอดนิยม
- Export เป็น PDF/Excel

---

## 5. Doctor Dashboard Features

### 5.1 หน้าหลัก (My Appointments)

**หน้า: `/doctor/dashboard`**

**แสดง:**
- 📅 รายการนัดหมายวันนี้ (เรียงตาม queue number)
- ⏰ นัดต่อไป (next appointment)
- 📊 สถิติของตัวเอง (patients today, this month)
- ⭐ คะแนนรีวิวล่าสุด

**ตารางนัดหมาย:**
| Queue | Time | Patient | Age | Symptoms | Vitals | Status | Action |
|-------|------|---------|-----|----------|--------|--------|--------|
| 1 | 09:00 | สมชาย | 35 | ปวดหัว | ✅ | รอตรวจ | [ตรวจ] |
| 2 | 09:30 | สมหญิง | 42 | ท้องเสีย | ✅ | รอตรวจ | [ตรวจ] |
| 3 | 10:00 | สมศรี | 28 | ไข้ | ⏳ | รอ nurse | - |

### 5.2 หน้าตรวจผู้ป่วย (Examination)

**หน้า: `/doctor/examine/:appointmentId`**

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  Queue #1 | สมชาย ใจดี (35 ปี, ชาย)        [Back] [Complete]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📋 Patient Information                                       │
│  ┌────────────────────┬────────────────────┐                │
│  │ Name: สมชาย ใจดี    │ Age: 35            │                │
│  │ Gender: Male       │ Blood Type: O+     │                │
│  │ Phone: 081-234-5678│ Allergies: None    │                │
│  └────────────────────┴────────────────────┘                │
│                                                               │
│  🩺 Vital Signs (Recorded by Nurse สมหญิง at 09:25)         │
│  ┌────────────────────────────────────────────────┐         │
│  │ BP: 120/80 mmHg    │ HR: 72 bpm                │         │
│  │ Temp: 36.5°C       │ SpO2: 98%                 │         │
│  │ Weight: 65.5 kg    │ Height: 170 cm            │         │
│  │ Chief Complaint: ปวดหัวมา 2 วัน                │         │
│  │ Notes: ผู้ป่วยดูอ่อนแรง                         │         │
│  └────────────────────────────────────────────────┘         │
│                                                               │
│  📝 Symptoms (from patient)                                  │
│  ปวดหัวด้านซ้าย เป็นๆ หายๆ ปวดเมื่อตื่นนอน                 │
│                                                               │
│  📚 Medical History (Previous Visits)                        │
│  ┌────────────────────────────────────────────────┐         │
│  │ 2023-12-10 | นพ.วิชัย | หวัด                   │         │
│  │ Rx: Paracetamol, Amoxicillin                   │         │
│  └────────────────────────────────────────────────┘         │
│                                                               │
│  ✏️ Examination & Diagnosis                                  │
│  ┌────────────────────────────────────────────────┐         │
│  │ Diagnosis:                                      │         │
│  │ [Tension headache (ปวดหัวจากความเครียด)      ]│         │
│  │                                                 │         │
│  │ Notes:                                          │         │
│  │ [ไม่พบความผิดปกติทางระบบประสาท               ]│         │
│  │ [แนะนำพักผ่อนให้เพียงพอ                       ]│         │
│  └────────────────────────────────────────────────┘         │
│                                                               │
│  💊 Prescription                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │ [+ Add Medicine]                                │         │
│  │                                                 │         │
│  │ 1. Paracetamol 500mg                            │         │
│  │    Quantity: [10] tablets                       │         │
│  │    Dosage: [1] tablet                           │         │
│  │    Frequency: [3 times daily ▼]                │         │
│  │    Duration: [3] days                           │         │
│  │    Instructions: [Take after meals           ]  │         │
│  │    [Remove]                                     │         │
│  │                                                 │         │
│  │ 2. Ibuprofen 400mg                              │         │
│  │    Quantity: [10] tablets                       │         │
│  │    Dosage: [1] tablet                           │         │
│  │    Frequency: [When needed ▼]                  │         │
│  │    Duration: [5] days                           │         │
│  │    Instructions: [Take if headache persists  ]  │         │
│  │    [Remove]                                     │         │
│  │                                                 │         │
│  │ Medicine Cost: ฿[120.00]                        │         │
│  └────────────────────────────────────────────────┘         │
│                                                               │
│  📄 Additional Instructions                                   │
│  ┌────────────────────────────────────────────────┐         │
│  │ [พักผ่อนให้เพียงพอ ดื่มน้ำมากๆ               ]│         │
│  │ [หลีกเลี่ยงความเครียด                         ]│         │
│  │ [นัดติดตามอาการใน 1 สัปดาห์                   ]│         │
│  └────────────────────────────────────────────────┘         │
│                                                               │
│            [Cancel]  [Save Draft]  [Complete & Send to Cashier]│
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- แสดงข้อมูลผู้ป่วยแบบครบถ้วน
- แสดง vital signs ที่ nurse วัด
- แสดงประวัติการรักษาเดิม
- ระบบเพิ่มยาแบบ dynamic (add/remove medicines)
- Auto-calculate medicine cost
- Save draft prescription (สำหรับกรณียังตรวจไม่เสร็จ)

### 5.3 หน้าประวัติผู้ป่วย (Patient History)

**หน้า: `/doctor/patients/:userId`**

แสดง:
- ข้อมูลส่วนตัว
- ประวัติการแพ้ยา
- โรคประจำตัว
- ประวัติการตรวจทั้งหมด (แต่ละครั้ง)
- กราฟแสดง vital signs ข้ามเวลา

---

## 6. Nurse Dashboard Features

### 6.1 หน้าหลัก (Queue Management)

**หน้า: `/nurse/dashboard`**

**แสดง:**
- 🔢 คิวทั้งหมดวันนี้
- ⏰ คิวที่กำลังเรียก
- ✅ คิวที่วัด vitals เสร็จแล้ว
- ⏳ คิวที่รอวัด

**ตารางคิว:**
| Queue | Time | Patient | Age | Doctor | Status | Action |
|-------|------|---------|-----|--------|--------|--------|
| 1 | 09:00 | สมชาย | 35 | นพ.วิชัย | ⏳ รอวัด | [เรียก] |
| 2 | 09:30 | สมหญิง | 42 | นพ.วิชัย | ✅ เสร็จ | [ดู] |
| 3 | 10:00 | สมศรี | 28 | นพ.วิชัย | - | - |

### 6.2 หน้าวัด Vital Signs

**หน้า: `/nurse/vitals/:appointmentId`**

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Queue #1 | สมชาย ใจดี (35 ปี)         [Back] [Save]    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  👤 Patient: สมชาย ใจดี                                  │
│  📞 Phone: 081-234-5678                                  │
│  👨‍⚕️ Doctor: นพ.วิชัย (อายุรกรรม)                        │
│  ⏰ Appointment: 09:00                                    │
│                                                           │
│  🩺 Vital Signs Measurement                              │
│  ┌────────────────────────────────────────────────┐    │
│  │ Blood Pressure (mmHg)                           │    │
│  │ Systolic:  [120]  Diastolic: [80]              │    │
│  │                                                 │    │
│  │ Heart Rate (bpm)                                │    │
│  │ [72]                                            │    │
│  │                                                 │    │
│  │ Temperature (°C)                                │    │
│  │ [36.5]                                          │    │
│  │                                                 │    │
│  │ Oxygen Saturation (%)                           │    │
│  │ [98]                                            │    │
│  │                                                 │    │
│  │ Weight (kg)                                     │    │
│  │ [65.5]                                          │    │
│  │                                                 │    │
│  │ Height (cm)                                     │    │
│  │ [170]                                           │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
│  📝 Chief Complaint (อาการสำคัญ)                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ [ปวดหัวมา 2 วัน เป็นๆ หายๆ                    ]│    │
│  │ [ปวดมากตอนตื่นนอน                              ]│    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
│  🗒️ Nurse Notes (บันทึกเพิ่มเติม)                       │
│  ┌────────────────────────────────────────────────┐    │
│  │ [ผู้ป่วยดูอ่อนแรง สีหน้าซีด                    ]│    │
│  │                                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
│  ⚠️ Alerts                                                │
│  □ High Blood Pressure                                   │
│  □ Fever (>37.5°C)                                       │
│  ☑ Abnormal Heart Rate                                   │
│                                                           │
│              [Clear Form]  [Save & Send to Doctor]       │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- ฟอร์มกรอกข้อมูล vital signs
- Auto-alert ถ้าค่าผิดปกติ
- บันทึกอาการเบื้องต้นจากผู้ป่วย
- บันทึก notes จากพยาบาล
- Validation (ห้ามกรอกค่าที่ไม่สมเหตุสมผล)

---

## 7. Cashier Dashboard Features

### 7.1 หน้าหลัก (Pending Prescriptions)

**หน้า: `/cashier/dashboard`**

**แสดง:**
- 💊 รายการใบสั่งยาที่รอจ่าย
- ✅ ยาที่จ่ายไปแล้ววันนี้
- 💰 ยอดขายวันนี้

**ตารางใบสั่งยา:**
| Queue | Patient | Doctor | Medicines | Cost | Time | Action |
|-------|---------|--------|-----------|------|------|--------|
| 1 | สมชาย | นพ.วิชัย | 2 items | ฿120 | 10:15 | [จ่ายยา] |
| 2 | สมหญิง | นพ.สุดา | 3 items | ฿250 | 10:45 | [จ่ายยา] |

### 7.2 หน้าจ่ายยา (Dispense Medicine)

**หน้า: `/cashier/dispense/:prescriptionId`**

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Queue #1 | สมชาย ใจดี                  [Back] [Dispense]│
├─────────────────────────────────────────────────────────┤
│                                                           │
│  👤 Patient Information                                   │
│  Name: สมชาย ใจดี                                        │
│  Phone: 081-234-5678                                     │
│  Appointment: 15 Jan 2024, 09:00                         │
│                                                           │
│  👨‍⚕️ Prescribed by: นพ.วิชัย (อายุรกรรม)                 │
│  📋 Diagnosis: Tension headache (ปวดหัวจากความเครียด)    │
│                                                           │
│  💊 Prescription Details                                  │
│  ┌────────────────────────────────────────────────┐    │
│  │ 1. ☑ Paracetamol 500mg                          │    │
│  │      Quantity: 10 tablets                       │    │
│  │      Dosage: 1 tablet, 3 times daily            │    │
│  │      Duration: 3 days                           │    │
│  │      Instructions: Take after meals             │    │
│  │      Price: ฿50.00                              │    │
│  │                                                 │    │
│  │ 2. ☑ Ibuprofen 400mg                            │    │
│  │      Quantity: 10 tablets                       │    │
│  │      Dosage: 1 tablet, when needed              │    │
│  │      Duration: 5 days                           │    │
│  │      Instructions: Take if headache persists    │    │
│  │      Price: ฿70.00                              │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
│  📄 Additional Instructions from Doctor                   │
│  "พักผ่อนให้เพียงพอ ดื่มน้ำมากๆ หลีกเลี่ยงความเครียด   │
│   นัดติดตามอาการใน 1 สัปดาห์"                            │
│                                                           │
│  💰 Payment                                               │
│  ┌────────────────────────────────────────────────┐    │
│  │ Medicine Cost:              ฿120.00             │    │
│  │ Additional Charges:         ฿0.00               │    │
│  │ ───────────────────────────────────────        │    │
│  │ Total:                      ฿120.00             │    │
│  │                                                 │    │
│  │ Payment Method: [Cash ▼]                        │    │
│  │ Amount Received: [฿150.00]                      │    │
│  │ Change: ฿30.00                                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
│  📝 Cashier Notes (optional)                             │
│  [ผู้ป่วยมาเองรับยา                                  ]  │
│                                                           │
│         [Print Receipt]  [Dispense Medicine & Print]     │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- แสดงรายละเอียดใบสั่งยาครบถ้วน
- Checklist ยาที่ต้องจ่าย
- คำนวณเงินทอนอัตโนมัติ
- เลือก payment method
- พิมพ์ใบเสร็จ
- พิมพ์ใบสั่งยา (สำหรับผู้ป่วย)

### 7.3 หน้ารายงานยอดขาย (Sales Report)

**หน้า: `/cashier/sales`**

แสดง:
- 📊 ยอดขายวันนี้
- 💳 แยกตาม payment method
- 📈 กราฟยอดขายรายวัน/สัปดาห์
- 💊 รายการยาที่จ่ายทั้งหมด

---

## 8. Complete Workflow

### Scenario: ผู้ป่วยมาตรวจ

#### Step 1: User จองนัด (เนมทำแล้ว ✅)
```
User เข้าแอพ → เลือกแพทย์ → เลือกวันเวลา → ชำระค่าตรวจ (฿500)
Status: confirmed, queue_number: 1
```

#### Step 2: Nurse เตรียมผู้ป่วย
```
Nurse Dashboard → ดูคิววันนี้ → เรียก Queue #1
  ↓
Nurse กดปุ่ม "เรียก" → เปิดหน้าวัด vitals
  ↓
Nurse วัดและบันทึก:
- BP: 120/80
- HR: 72
- Temp: 36.5°C
- Weight: 65.5 kg
- Chief complaint: "ปวดหัวมา 2 วัน"
  ↓
Nurse กด "Save & Send to Doctor"
  ↓
สถานะเปลี่ยนเป็น: has_vital_signs = true
Doctor เห็นในรายการนัดหมายว่าพร้อมตรวจ
```

#### Step 3: Doctor ตรวจ
```
Doctor Dashboard → เห็น Queue #1 พร้อมตรวจ (✅ vitals)
  ↓
Doctor กด "ตรวจ" → เปิดหน้า Examination
  ↓
Doctor ดูข้อมูล:
- Patient info
- Vital signs (จาก nurse)
- Symptoms
- Medical history
  ↓
Doctor ตรวจ → กรอก diagnosis: "Tension headache"
  ↓
Doctor สั่งยา:
1. Paracetamol 500mg x10, 3 times daily, 3 days
2. Ibuprofen 400mg x10, when needed, 5 days
Medicine cost: ฿120
  ↓
Doctor กด "Complete & Send to Cashier"
  ↓
สถานะเปลี่ยนเป็น: status = completed
สร้าง prescription record
Prescription status: is_dispensed = false
```

#### Step 4: Cashier จ่ายยา
```
Cashier Dashboard → เห็นใบสั่งยาใหม่ (Queue #1)
  ↓
Cashier กด "จ่ายยา" → เปิดหน้า Dispense Medicine
  ↓
Cashier ดูรายการยา:
1. ☑ Paracetamol 500mg x10
2. ☑ Ibuprofen 400mg x10
Total: ฿120
  ↓
Cashier เลือก payment method: Cash
Cashier กรอก amount received: ฿150
Change: ฿30
  ↓
Cashier กด "Dispense Medicine & Print"
  ↓
System:
- Update prescription: is_dispensed = true
- Record dispensed_by = cashier_id
- Record dispensed_at = now()
- Print receipt
- Print medicine label
  ↓
Cashier ส่งมอบยาให้ผู้ป่วย พร้อมอธิบายวิธีรับประทาน
```

#### Step 5: เสร็จสิ้น ✅
```
Appointment status: completed
Prescription status: dispensed
User สามารถให้รีวิวแพทย์ได้
```

---

## 9. Implementation Checklist

### Phase 1: Database Setup (2-3 ชั่วโมง)

- [ ] สร้าง SQL migration files
  - [ ] `nurses` table
  - [ ] `cashiers` table
  - [ ] `vital_signs` table
  - [ ] `prescriptions` table
  - [ ] Update `medical_records` table
- [ ] รัน migrations ใน Supabase
- [ ] ทดสอบ foreign keys และ constraints
- [ ] เพิ่ม indexes สำหรับ performance

### Phase 2: Authentication & Role System (2-3 ชั่วโมง)

⚠️ **CRITICAL**: ไฟล์ `lib/auth.js` ถูกใช้โดยฝั่ง user ด้วย! แก้อย่างระวัง:
- อย่าลบหรือแก้ไขฟังก์ชันที่มีอยู่
- เพิ่ม nurse/cashier checks เข้าไปใน `getUserRole()`
- ตรวจสอบว่าการแก้ไขไม่กระทบ user role

```javascript
// ตัวอย่างการแก้ไข lib/auth.js
export const getUserRole = async (userId) => {
  try {
    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (adminData) return 'admin'

    // Check if user is doctor
    const { data: doctorData } = await supabase
      .from('doctors')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (doctorData) return 'doctor'

    // ✨ เพิ่มส่วนนี้ - Check if user is nurse
    const { data: nurseData } = await supabase
      .from('nurses')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (nurseData) return 'nurse'

    // ✨ เพิ่มส่วนนี้ - Check if user is cashier
    const { data: cashierData } = await supabase
      .from('cashiers')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (cashierData) return 'cashier'

    // Default to regular user (อย่าลบ!)
    return 'user'
  } catch (error) {
    console.error('Error getting user role:', error)
    return 'user'
  }
}

// เพิ่ม redirect paths
export const getRedirectPath = (role) => {
  switch (role) {
    case 'user': return '/dashboard'
    case 'admin': return '/admin/dashboard'
    case 'doctor': return '/doctor/dashboard'
    case 'nurse': return '/nurse/dashboard'      // ✨ เพิ่ม
    case 'cashier': return '/cashier/dashboard'  // ✨ เพิ่ม
    default: return '/login'
  }
}
```

**Checklist:**
- [ ] อัพเดท `lib/auth.js` ตามตัวอย่างข้างบน
- [ ] สร้าง API `/api/auth/assign-role` (optional - สำหรับ admin)
- [ ] ทดสอบการ login ด้วย role ทั้ง 5 แบบ
- [ ] สร้าง middleware protection สำหรับแต่ละ role

### Phase 3: Nurse APIs (2-3 ชั่วโมง)

- [ ] `POST /api/nurse/vital-signs`
- [ ] `GET /api/nurse/queue`
- [ ] `GET /api/nurse/vital-signs/:appointmentId`
- [ ] ทดสอบ APIs ด้วย Postman/Thunder Client

### Phase 4: Doctor APIs (2-3 ชั่วโมง)

- [ ] `GET /api/doctor/appointments`
- [ ] `GET /api/doctor/patient-history/:userId`
- [ ] `POST /api/doctor/prescription`
- [ ] `PUT /api/doctor/appointments/:id/complete`
- [ ] ทดสอบ APIs

### Phase 5: Cashier APIs (2-3 ชั่วโมง)

- [ ] `GET /api/cashier/pending-prescriptions`
- [ ] `POST /api/cashier/dispense-medicine`
- [ ] `GET /api/cashier/daily-sales`
- [ ] ทดสอบ APIs

### Phase 6: Admin APIs (2-3 ชั่วโมง)

- [ ] `GET /api/admin/dashboard-stats`
- [ ] CRUD APIs สำหรับ doctors/nurses/cashiers
- [ ] `GET /api/admin/appointments`
- [ ] ทดสอบ APIs

### Phase 7: Nurse Dashboard UI (4-5 ชั่วโมง)

- [ ] `/nurse/dashboard` - Queue list
- [ ] `/nurse/vitals/:appointmentId` - Vital signs form
- [ ] `/nurse/history` - Vital signs history
- [ ] Responsive design
- [ ] ทดสอบ workflow

### Phase 8: Doctor Dashboard UI (4-5 ชั่วโมง)

- [ ] `/doctor/dashboard` - Appointments list
- [ ] `/doctor/examine/:appointmentId` - Examination page
- [ ] `/doctor/patients/:userId` - Patient history
- [ ] Medicine search/autocomplete
- [ ] Print prescription
- [ ] ทดสอบ workflow

### Phase 9: Cashier Dashboard UI (4-5 ชั่วโมง)

- [ ] `/cashier/dashboard` - Pending prescriptions
- [ ] `/cashier/dispense/:prescriptionId` - Dispense page
- [ ] `/cashier/sales` - Sales report
- [ ] Print receipt & medicine label
- [ ] ทดสอบ workflow

### Phase 10: Admin Dashboard UI (4-5 ชั่วโมง)

- [ ] `/admin/dashboard` - Overview & stats
- [ ] `/admin/users` - User management
- [ ] `/admin/doctors` - Doctor management
- [ ] `/admin/nurses` - Nurse management
- [ ] `/admin/cashiers` - Cashier management
- [ ] `/admin/clinics` - Clinic management
- [ ] `/admin/appointments` - Appointment management
- [ ] `/admin/reports` - Reports & analytics

### Phase 11: Integration Testing (2-3 ชั่วโมง)

- [ ] ทดสอบ complete workflow (end-to-end)
- [ ] ทดสอบ edge cases
- [ ] ทดสอบ error handling
- [ ] ทดสอบ permissions

### Phase 12: Bug Fixes & Polish (2-3 ชั่วโมง)

- [ ] แก้ bugs ที่เจอ
- [ ] ปรับปรุง UX/UI
- [ ] เพิ่ม loading states
- [ ] เพิ่ม error messages

---

## 10. สิ่งที่ต้องระวัง

### 10.1 Security

- ✅ ทุก API ต้อง authenticate
- ✅ ตรวจสอบ role permission ก่อนให้เข้าถึงข้อมูล
- ✅ Nurse เห็นแค่คิวของตัวเอง
- ✅ Doctor เห็นแค่นัดหมายของตัวเอง
- ✅ Cashier เห็นแค่ prescription ที่รอจ่าย
- ✅ เฉพาะ Admin เท่านั้นที่เห็นทุกอย่าง

### 10.2 Data Validation

- ✅ Vital signs ต้องอยู่ในช่วงที่สมเหตุสมผล
  - BP: 60-250 / 40-200 mmHg
  - HR: 40-200 bpm
  - Temp: 35-42°C
  - SpO2: 70-100%
- ✅ Medicine quantity > 0
- ✅ Medicine cost >= 0
- ✅ Prescription ต้องมีอย่างน้อย 1 medicine

### 10.3 User Experience

- ✅ Loading states สำหรับทุก async operations
- ✅ Error messages ที่เข้าใจง่าย
- ✅ Confirmation dialogs สำหรับ critical actions
- ✅ Auto-save draft (สำหรับ doctor prescription)
- ✅ Keyboard shortcuts สำหรับ power users

---

## 11. ทดสอบระบบ

### Test Scenario 1: Happy Path

1. User จองนัด ✅ (เนมทำแล้ว)
2. Nurse วัด vitals ✅
3. Doctor ตรวจและสั่งยา ✅
4. Cashier จ่ายยา ✅
5. เสร็จสมบูรณ์ ✅

### Test Scenario 2: Edge Cases

1. Nurse วัด vitals ผิดพลาด → แก้ไขได้
2. Doctor save draft prescription → กลับมาแก้ไขได้
3. Cashier ยังไม่จ่ายยา → prescription ยังแสดงใน queue
4. User ยกเลิกนัดหมาย → prescription ถูก cancel

### Test Scenario 3: Error Handling

1. Network error → แสดง error message
2. Invalid data → validation error
3. Permission denied → redirect to login
4. Duplicate vital signs → แสดง warning

---

## 12. Timeline Summary

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Database Setup | 2-3 ชม. | 🔨 |
| 2 | Auth & Roles | 2-3 ชม. | 🔨 |
| 3 | Nurse APIs | 2-3 ชม. | 🔨 |
| 4 | Doctor APIs | 2-3 ชม. | 🔨 |
| 5 | Cashier APIs | 2-3 ชม. | 🔨 |
| 6 | Admin APIs | 2-3 ชม. | 🔨 |
| 7 | Nurse Dashboard | 4-5 ชม. | 🔨 |
| 8 | Doctor Dashboard | 4-5 ชม. | 🔨 |
| 9 | Cashier Dashboard | 4-5 ชม. | 🔨 |
| 10 | Admin Dashboard | 4-5 ชม. | 🔨 |
| 11 | Integration Test | 2-3 ชม. | 🔨 |
| 12 | Bug Fixes | 2-3 ชม. | 🔨 |
| **Total** | | **36-42 ชม.** | |

**มี 48 ชั่วโมง → เหลือเวลา 6-12 ชม. buffer** ✅

---

## 13. Resources & References

### เอกสารที่เกี่ยวข้อง

- `FLUTTER_DEV_GUIDE.md` - คู่มือของเนม (สำหรับ Flutter)
- `IMPLEMENTATION_GUIDE.md` - User features ที่เนมทำแล้ว
- `database-*.sql` - SQL migrations ที่มีอยู่แล้ว

### Supabase Connection

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Example API Route Structure

```javascript
// app/api/nurse/vital-signs/route.js
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    // 1. Authenticate
    const user = await getCurrentUser()
    if (!user || user.role !== 'nurse') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get data
    const data = await request.json()

    // 3. Validate
    if (!data.appointment_id || !data.blood_pressure_systolic) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 4. Insert to database
    const { data: vitalSigns, error } = await supabase
      .from('vital_signs')
      .insert({
        ...data,
        nurse_id: user.nurse_id,
        user_id: data.user_id
      })
      .select()
      .single()

    if (error) throw error

    // 5. Return success
    return Response.json({ success: true, vital_signs: vitalSigns })
  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

---

## 14. Tips & Best Practices

### 14.1 Component Reusability

สร้าง shared components:
- `<PatientCard />` - แสดงข้อมูลผู้ป่วย
- `<VitalSignsDisplay />` - แสดง vital signs
- `<MedicineList />` - แสดงรายการยา
- `<QueueCard />` - แสดงข้อมูลคิว
- `<StatsCard />` - แสดงสถิติ

### 14.2 State Management

ถ้ามี state ซับซ้อน ให้ใช้:
- React Context สำหรับ global state
- SWR หรือ React Query สำหรับ data fetching
- Zustand สำหรับ client state (ถ้าจำเป็น)

### 14.3 Code Organization

```
app/
├── api/
│   ├── nurse/
│   │   ├── vital-signs/route.js
│   │   └── queue/route.js
│   ├── doctor/
│   │   ├── appointments/route.js
│   │   └── prescription/route.js
│   └── cashier/
│       ├── pending-prescriptions/route.js
│       └── dispense-medicine/route.js
├── nurse/
│   ├── dashboard/page.js
│   └── vitals/[appointmentId]/page.js
├── doctor/
│   ├── dashboard/page.js
│   └── examine/[appointmentId]/page.js
├── cashier/
│   ├── dashboard/page.js
│   └── dispense/[prescriptionId]/page.js
└── admin/
    ├── dashboard/page.js
    ├── doctors/page.js
    ├── nurses/page.js
    └── cashiers/page.js

components/
├── nurse/
│   ├── VitalSignsForm.js
│   └── QueueList.js
├── doctor/
│   ├── PrescriptionForm.js
│   └── PatientHistory.js
├── cashier/
│   ├── DispenseForm.js
│   └── SalesReport.js
└── shared/
    ├── PatientCard.js
    ├── VitalSignsDisplay.js
    └── MedicineList.js
```

---

## 15. คำแนะนำสุดท้าย

1. **เริ่มจาก Database ก่อน** - ถ้า schema ไม่ถูก ทุกอย่างพัง
2. **ทำ APIs ให้เสร็จก่อนทำ UI** - เทส APIs ด้วย Postman ก่อน
3. **ทำทีละ Role** - อย่าพยายามทำทุกอย่างพร้อมกัน
4. **ทดสอบ Workflow บ่อยๆ** - อย่ารอถึงตอนท้าย
5. **ใช้ Mock Data ถ้าต้องการ** - ไม่ต้องรอเนมทำ user side เสร็จ

**ลำดับที่แนะนำ:**
1. Database (2-3 ชม.)
2. Auth & Roles (2-3 ชม.)
3. Nurse (APIs + UI) (6-8 ชม.)
4. Doctor (APIs + UI) (6-8 ชม.)
5. Cashier (APIs + UI) (6-8 ชม.)
6. Admin (APIs + UI) (6-8 ชม.)
7. Testing & Polish (4-6 ชม.)

---

## 16. ⚠️ Conflict Prevention - สิ่งที่ต้องระวังเมื่อทำงานร่วมกับเนม

### 16.1 Files ที่ลัลลาต้องสร้างใหม่ (ไม่มีปัญหา Conflict)

✅ **API Routes** (ไม่มี - สร้างได้เลย):
- `app/api/nurse/**`
- `app/api/cashier/**`
- `app/api/doctor/**` (ยกเว้น reviews ที่เนมทำแล้ว)
- `app/api/admin/**` (ส่วนใหญ่ยังไม่มี)

✅ **Dashboard Pages** (ไม่มี - สร้างได้เลย):
- `app/nurse/**`
- `app/cashier/**`
- `app/doctor/**`
- `app/admin/**` (ระวัง - อาจมีบ้าง ให้เช็คก่อน)

✅ **Components** (สร้างใหม่ได้เลย):
- `components/nurse/**`
- `components/cashier/**`
- `components/doctor/**`
- `components/admin/**`

✅ **Database Tables** (สร้างใหม่ - ไม่กระทบของเดิม):
- `nurses`
- `cashiers`
- `vital_signs`
- `prescriptions`

---

### 16.2 Files ที่มีอยู่แล้ว - ต้องแก้ไขอย่างระวัง ⚠️

**1. `lib/auth.js`** - ⚠️⚠️⚠️ **HIGH RISK**
- ใช้ร่วมกันทั้ง user และ admin side
- เนมใช้ฟังก์ชัน: `getCurrentUser()`, `getUserRole()`, `loginWithEmail()`, `logout()`
- **วิธีแก้ที่ปลอดภัย:**
  - เพิ่มเฉพาะการ check nurse/cashier ใน `getUserRole()`
  - เพิ่มเฉพาะ redirect paths ใน `getRedirectPath()`
  - **อย่าลบ** หรือแก้ไขฟังก์ชันที่มีอยู่
  - **อย่าเปลี่ยน** return type หรือ parameter

**2. `database-migration.sql`** - ⚠️ **MEDIUM RISK**
- มีอยู่แล้ว - อ่านดูเป็นตัวอย่าง
- **อย่ารัน** ไฟล์นี้ซ้ำ (จะ error)
- สร้างไฟล์ใหม่ชื่อ `database-hospital-roles.sql` แทน

**3. API Routes ที่มีแล้ว** - ⚠️ **LOW RISK**
- `/api/appointments/**` - อย่าแก้! (ของเนม)
- `/api/favorites/**` - อย่าแก้! (ของเนม)
- `/api/notifications/**` - อย่าแก้! (ของเนม)
- `/api/doctors/[id]/reviews` - อย่าแก้! (ของเนม)
- `/api/generate-qr` - อย่าแก้! (ของเนม)

---

### 16.3 Git Workflow เพื่อหลีกเลี่ยง Conflict

**ก่อนเริ่มงานทุกครั้ง:**
```bash
git pull origin main
```

**หลังเสร็จแต่ละ Phase:**
```bash
git add .
git commit -m "feat: Add [feature name] for [role]"
git pull origin main  # เช็คว่ามี update จากเนมไหม
# ถ้ามี conflict → แก้ไขก่อน push
git push origin main
```

**ถ้าเจอ Conflict ใน `lib/auth.js`:**
1. อย่าใช้ "Accept Incoming" หรือ "Accept Current" โดยไม่คิด
2. เช็คว่าเนมแก้อะไร (Incoming Changes)
3. เช็คว่าคุณแก้อะไร (Current Changes)
4. รวมทั้งสองส่วนเข้าด้วยกัน (อย่าลบของเนม!)
5. ทดสอบให้แน่ใจว่า user role ยังทำงานได้

**หลีกเลี่ยง Conflict ด้วย Branch:**
```bash
# Option: ทำงานใน branch แยก
git checkout -b lallaa-hospital-staff
# ทำงานใน branch นี้
git commit -m "feat: Add nurse features"
git push origin lallaa-hospital-staff

# เมื่อเสร็จ merge เข้า main
git checkout main
git pull origin main
git merge lallaa-hospital-staff
git push origin main
```

---

### 16.4 ติดต่อสื่อสารกับเนม

**เมื่อไหร่ควรบอกเนม:**
1. ✅ เมื่อจะแก้ไข `lib/auth.js` - แจ้งก่อนแก้
2. ✅ เมื่อเพิ่ม tables ใหม่ - บอกชื่อ tables
3. ✅ เมื่อเจอ bug ในฝั่ง user - รายงานให้เนมแก้
4. ✅ เมื่อต้องการ mock data สำหรับทดสอบ

**สิ่งที่ไม่ต้องบอก:**
- การสร้าง API routes ใหม่ในโฟลเดอร์ nurse/doctor/cashier/admin
- การสร้าง dashboard pages ใหม่
- การสร้าง components ใหม่
- การสร้าง SQL migration files ใหม่

---

### 16.5 Quick Checklist ก่อน Push

ก่อน push ทุกครั้ง ตรวจสอบ:

- [ ] ไม่ได้แก้ไฟล์ใน `app/(auth)/*` ที่เกี่ยวกับ user
- [ ] ไม่ได้ลบหรือแก้ไข API routes ของ user
- [ ] ถ้าแก้ `lib/auth.js` → ทดสอบ login ทั้ง 5 roles
- [ ] ถ้าเพิ่ม tables → ใช้ FK ไปที่ `auth.users.id`
- [ ] ไม่มีไฟล์ test (nul, test-*.js) ใน commit
- [ ] ทดสอบ features ที่เพิ่มเข้ามาแล้ว
- [ ] Git commit message ชัดเจน (feat/fix/refactor)

---

**Good luck! 🚀**

**คู่มือฉบับนี้ออกแบบมาเพื่อให้คุณและเนมทำงานร่วมกันได้อย่างราบรื่น!**

**เอกสารนี้จัดทำโดย: Claude Code & เนม**
**สำหรับ: ลัลลา (Admin-side Developer)**
**วันที่: 19 พ.ย. 2567**
**Version: 2.0 (Updated with Conflict Prevention)**

---

## 📞 ติดต่อ

- **เนม (User-side)**: ดูแล user features, Flutter app
- **ลัลลา (Admin-side)**: ดูแล hospital staff features, Supabase

**Supabase Instance**: ใช้ร่วมกัน (Same database!)
**Git Repository**: ใช้ร่วมกัน (ระวัง conflicts!)

**Happy Coding! 💻**
