# Entity Relationship Diagram

## Health Queue Management System - Database ERD

---

## 🎯 ภาพรวมระบบ: ระบบประกอบด้วยอะไรบ้าง (System Overview) - **✨ เพิ่มใหม่**

### **1️⃣ ผู้ใช้งานในระบบ (System Users/Actors)**

#### 👤 **ผู้ป่วย/คนไข้ (Patient)**
**ตารางที่เกี่ยวข้อง:** `profiles`

**ทำอะไรได้บ้าง:**
- จองนัดหมาย → `appointments`
- อัพโหลดเอกสาร → `appointment_files`
- รับการแจ้งเตือน SMS → `appointment_notifications`
- รับการแจ้งเตือนในแอป → `notifications`
- รับข้อความจาก admin → `admin_messages`
- ชำระเงิน → `payments`

---

#### 👨‍⚕️ **แพทย์ (Doctor)**
**ตารางที่เกี่ยวข้อง:** `doctors`

**ทำอะไรได้บ้าง:**
- รับนัดหมายจากผู้ป่วย → `appointments`
- มีคิวในแต่ละวัน → `appointment_queue_counters`

**เชื่อมโยงกับ:**
- สังกัดสาขา → `branches`
- สังกัดแผนก → `departments`

---

#### 👨‍💼 **ผู้ดูแลระบบ (Admin)**
**ตารางที่เกี่ยวข้อง:** `admins` + `profiles`

**ทำอะไรได้บ้าง:**
- ส่งข้อความหาผู้ป่วย → `admin_messages`
- จัดการนัดหมาย → `appointments`
- อนุมัติ/ปฏิเสธนัดหมาย → `appointments.status`

---

### **2️⃣ ระบบหลักในโปรแกรม (Core Systems/Modules)**

#### 📅 **ระบบจองคิูนัดหมาย (Appointment Booking System)**
**ตารางที่เกี่ยวข้อง:**
- `appointments` - ตารางหลักเก็บข้อมูลการนัดหมาย
- `appointment_files` - ไฟล์เอกสารแนบ (ใบส่งตัว, ผลแล็บ)
- `appointment_queue_counters` - จัดการหมายเลขคิวของแพทย์แต่ละวัน

**เชื่อมโยงกับ:**
- `profiles` (ผู้จอง)
- `doctors` (แพทย์ที่นัด)
- `branches` (สาขา)
- `departments` (แผนก)

**สถานะการนัดหมาย:** `booked` → `approved` → `completed` (หรือ `cancelled`/`rejected`)

---

#### 🔔 **ระบบแจ้งเตือน (Notification System)**

**A. การแจ้งเตือน SMS อัตโนมัติ**
**ตารางที่เกี่ยวข้อง:** `appointment_notifications`

**กลไก:**
- ส่ง SMS ก่อนนัดหมาย 3 รูปแบบ: `3_days`, `1_day`, `6_hours`
- มี UNIQUE constraint ป้องกันส่งซ้ำ

**เชื่อมโยงกับ:** `appointments`

**B. การแจ้งเตือนในแอป**
**ตารางที่เกี่ยวข้อง:** `notifications`

**เชื่อมโยงกับ:** `profiles`

---

#### 💬 **ระบบข้อความ Admin (Admin Messaging System)**
**ตารางที่เกี่ยวข้อง:** `admin_messages`, `chat_tags`

**คุณสมบัติ:**
- ข้อความระหว่าง admin และผู้ใช้
- มี auto-expire (หมดอายุใน 60 วัน)
- ติดตามสถานะ `is_read`
- ระบบ Tags สำหรับจัดหมวดหมู่ผู้ใช้ (สถานะการนัด, ความต้องการพิเศษ, ประเภทลูกค้า)

**เชื่อมโยงกับ:**
- `admins` (ผู้ส่ง)
- `profiles` (ผู้รับ)
- `chat_tags` (tags สำหรับจัดหมวดหมู่ผู้ใช้)

---

#### 💰 **ระบบชำระเงิน (Payment System)**
**ตารางที่เกี่ยวข้อง:** `payments`

**คุณสมบัติ:**
- รองรับ QR Code
- ติดตามสถานะการชำระเงิน (`pending`, `completed`)

**เชื่อมโยงกับ:**
- `appointments` (ชำระเงินสำหรับนัดหมายไหน)
- `profiles` (ใครชำระ)

---

#### 🏢 **โครงสร้างองค์กร (Organizational Structure)**
**ตารางที่เกี่ยวข้อง:**
- `branches` - สาขาโรงพยาบาล
- `departments` - แผนกต่างๆ (ศัลยกรรม, กุมารเวชศาสตร์, ฯลฯ)
- `branch_departments` - ตารางเชื่อม (Many-to-Many)

**โครงสร้าง:**
```
Hospital (โรงพยาบาล)
├── Branch 1 (สาขา 1)
│   ├── Department A (แผนก A)
│   │   ├── Doctor 1
│   │   └── Doctor 2
│   └── Department B (แผนก B)
│       └── Doctor 3
└── Branch 2 (สาขา 2)
    └── Department C (แผนก C)
        └── Doctor 4
```

---

### **3️⃣ สรุปตาราง: ส่วนไหนใช้ตารางอะไรบ้าง**

| 🎯 ส่วนของระบบ | 📊 ตารางที่เกี่ยวข้อง | 🔗 ความสัมพันธ์กับตารางอื่น |
|----------------|---------------------|---------------------------|
| **👤 ผู้ป่วย/คนไข้** | `profiles` | → `appointments`, `notifications`, `admin_messages`, `payments` |
| **👨‍⚕️ แพทย์** | `doctors` | → `appointments`, `appointment_queue_counters`, `branches`, `departments` |
| **👨‍💼 Admin** | `admins`, `profiles` | → `admin_messages` |
| **📅 ระบบจองคิว** | `appointments`, `appointment_files`, `appointment_queue_counters` | → `profiles`, `doctors`, `branches`, `departments` |
| **🔔 ระบบแจ้งเตือน SMS** | `appointment_notifications` | → `appointments` |
| **🔔 ระบบแจ้งเตือนในแอป** | `notifications` | → `profiles` |
| **💬 ระบบข้อความ Admin** | `admin_messages`, `chat_tags` | → `admins`, `profiles` |
| **💰 ระบบชำระเงิน** | `payments` | → `appointments`, `profiles` |
| **🏢 โครงสร้างองค์กร** | `branches`, `departments`, `branch_departments` | → `doctors`, `appointments` |

---

## 📐 Entity Relationship Diagram (ERD) - รายละเอียดทั้งหมด

```mermaid
erDiagram
    %% Core User Tables
    profiles ||--o{ appointments : "books"
    profiles ||--o{ admin_messages : "receives"
    profiles ||--o{ chat_tags : "has"
    profiles ||--o{ notifications : "receives"
    profiles ||--o{ payments : "makes"
    profiles ||--o| admins : "can be"

    %% Doctor Tables
    doctors ||--o{ appointments : "assigned to"
    doctors ||--|| branches : "works at"
    doctors ||--|| departments : "belongs to"
    doctors ||--o{ appointment_queue_counters : "has queue"

    %% Branch and Department Tables
    branches ||--o{ departments : "has"
    branches ||--o{ branch_departments : "linked in"
    departments ||--o{ branch_departments : "linked in"

    %% Appointment Related Tables
    appointments ||--|| branches : "at"
    appointments ||--|| departments : "in"
    appointments ||--o{ appointment_files : "has"
    appointments ||--o{ appointment_notifications : "triggers"
    appointments ||--o| payments : "requires"

    %% Admin Messages
    admins ||--o{ admin_messages : "sends"

    %% Table Definitions

    profiles {
        uuid id PK
        string email
        string full_name
        string phone
        string id_card
        string passport_id
        string user_type
        string service_type
        timestamp created_at
    }

    admins {
        uuid id PK
        uuid user_id FK
        string status
        timestamp created_at
    }

    doctors {
        uuid id PK
        string contact_name
        string contact_email
        string contact_type
        string phone
        string line_id
        string specialty
        int branch_id FK
        int department_id FK
        string image_url
        string status
        timestamp created_at
    }

    branches {
        int id PK
        string name
        string address
        string phone
        timestamp created_at
    }

    departments {
        int id PK
        string name
        string code
        int branch_id FK
        timestamp created_at
    }

    branch_departments {
        int id PK
        int branch_id FK
        int department_id FK
        timestamp created_at
    }

    appointments {
        uuid id PK
        uuid user_id FK
        uuid doctor_id FK
        int branch_id FK
        int department_id FK
        date appointment_date
        time appointment_time
        date primary_date
        time primary_time
        boolean primary_flexible
        date secondary_date
        time secondary_time
        boolean secondary_flexible
        date confirmed_date
        time confirmed_time
        string approved_option
        enum status
        string service_type
        date service_date
        int queue_no
        text symptoms
        text notes
        text admin_notes
        text cancel_reason
        timestamp sent_to_doctor_at
        timestamp treatment_completed_at
        timestamp followup_email_sent_at
        text treatment_note
        text treatment_file_url
        timestamp created_at
    }

    appointment_files {
        bigint id PK
        uuid appointment_id FK
        string file_name
        string file_path
        string file_url
        string file_type
        bigint file_size
        timestamp uploaded_at
        timestamp created_at
    }

    appointment_notifications {
        uuid id PK
        uuid appointment_id FK
        string reminder_type
        timestamptz sent_at
        timestamptz created_at
    }

    appointment_queue_counters {
        uuid doctor_id PK_FK
        date service_date PK
        int last_no
    }

    admin_messages {
        uuid id PK
        uuid sender_id FK
        string sender_role
        uuid recipient_id FK
        uuid user_id FK
        text message
        string message_type
        jsonb metadata
        boolean is_read
        timestamp read_at
        timestamp created_at
        timestamp updated_at
        timestamp expires_at
    }

    notifications {
        uuid id PK
        uuid user_id FK
        string title
        text message
        string type
        boolean is_read
        timestamp created_at
    }

    payments {
        uuid id PK
        uuid appointment_id FK
        uuid user_id FK
        numeric amount
        string payment_method
        string payment_status
        text qr_code_data
    }

    chat_tags {
        uuid id PK
        uuid user_id FK
        string tag_name
        string tag_color
        string tag_category
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }
```

## ความสัมพันธ์หลักของระบบ (Key Relationships)

### 1. User Management
- **profiles** (users) สามารถเป็น **admins** ได้ (one-to-one optional)
- **profiles** สามารถจอง **appointments** ได้หลายครั้ง (one-to-many)
- **profiles** สามารถรับ **notifications** และ **admin_messages** (one-to-many)
- **profiles** สามารถมี **chat_tags** ได้หลายอัน (one-to-many)

### 2. Medical Service Structure
- **branches** (สาขา) มีหลาย **departments** (แผนก)
- **doctors** (หมอ) สังกัด **branch** หนึ่งแห่งและ **department** หนึ่งแผนก
- **branch_departments** เป็นตารางกลางเชื่อม branches และ departments (many-to-many)

### 3. Appointment System
- **appointments** เชื่อมโยงกับ:
  - **profiles** (ผู้จอง)
  - **doctors** (หมอที่นัด)
  - **branches** (สาขา)
  - **departments** (แผนก)
  - **appointment_files** (เอกสารประกอบ)
  - **appointment_notifications** (SMS reminders)
  - **payments** (การชำระเงิน)

### 4. Queue Management
- **appointment_queue_counters** ติดตามหมายเลขคิวของแต่ละหมอในแต่ละวัน

### 5. Communication
- **admin_messages**: ข้อความระหว่าง admin และ user (มี auto-expire 60 วัน)
- **chat_tags**: tags สำหรับจัดหมวดหมู่ผู้ใช้ในแชท admin (สถานะการนัด, ความต้องการพิเศษ, ประเภทลูกค้า)
- **notifications**: การแจ้งเตือนทั่วไปในระบบ

## สถานะการนัดหมาย (Appointment Status Enum)
- `booked` - จองแล้ว
- `approved` - อนุมัติแล้ว
- `completed` - เสร็จสิ้น
- `cancelled` - ยกเลิก
- `rejected` - ปฏิเสธ

## SMS Reminder Types
- `3_days` - แจ้งเตือน 3 วันก่อนนัด
- `1_day` - แจ้งเตือน 1 วันก่อนนัด
- `6_hours` - แจ้งเตือน 6 ชั่วโมงก่อนนัด

## Chat Tag Categories
- `status` - สถานะการนัด (รอดำเนินการ, รอการชำระเงิน, รอยืนยันเอกสาร, ยืนยันนัดแล้ว, เสร็จสิ้น, ยกเลิก)
- `special_need` - ความต้องการพิเศษ (ต้องการหมอหญิง, แพ้ยา, ต่างชาติ, ต้องการรถเข็น, มาพร้อมเด็ก, ผู้สูงอายุ)
- `customer_type` - ประเภทลูกค้า (VIP, ลูกค้าใหม่, ลูกค้าประจำ, ติดต่อบ่อย, ต้องติดตาม)
- `other` - อื่นๆ (สำหรับ tags ที่ไม่อยู่ในหมวดที่กำหนด)

## Important Data Types
- **UUID**: ids ส่วนใหญ่ (profiles, doctors, appointments, etc.)
- **Integer**: branch_id, department_id
- **Enum**: appointment status
- **JSONB**: metadata fields
- **Timestamp/Date/Time**: temporal data
