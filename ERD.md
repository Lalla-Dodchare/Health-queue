# Entity Relationship Diagram

## Health Queue Management System - Database ERD

```mermaid
erDiagram
    %% Core User Tables
    profiles ||--o{ appointments : "books"
    profiles ||--o{ admin_messages : "receives"
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
```

## ความสัมพันธ์หลักของระบบ (Key Relationships)

### 1. User Management
- **profiles** (users) สามารถเป็น **admins** ได้ (one-to-one optional)
- **profiles** สามารถจอง **appointments** ได้หลายครั้ง (one-to-many)
- **profiles** สามารถรับ **notifications** และ **admin_messages** (one-to-many)

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

## Important Data Types
- **UUID**: ids ส่วนใหญ่ (profiles, doctors, appointments, etc.)
- **Integer**: branch_id, department_id
- **Enum**: appointment status
- **JSONB**: metadata fields
- **Timestamp/Date/Time**: temporal data
