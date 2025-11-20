# Flutter Development Guide - Health Queue System

> **คู่มือฉบับสมบูรณ์สำหรับพัฒนา Flutter App ของระบบ Health Queue**
>
> เอกสารนี้รวมทุกข้อมูลที่ Flutter Developer ต้องรู้เกี่ยวกับระบบ Health Queue Web Application

---

## 📋 สารบัญ

1. [ภาพรวมระบบ (System Overview)](#1-ภาพรวมระบบ-system-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Database Schema](#4-database-schema)
5. [API Endpoints](#5-api-endpoints)
6. [User Features (ฝั่งผู้ใช้)](#6-user-features-ฝั่งผู้ใช้)
7. [Admin Features (ฝั่ง Admin)](#7-admin-features-ฝั่ง-admin)
8. [Business Logic & Rules](#8-business-logic--rules)
9. [Mobile Considerations](#9-mobile-considerations)
10. [Environment Setup](#10-environment-setup)

---

## 1. ภาพรวมระบบ (System Overview)

### 1.1 เกี่ยวกับโปรเจค
**Health Queue** คือระบบจัดการคิวโรงพยาบาล ที่ให้ผู้ใช้สามารถ:
- จองนัดหมายกับแพทย์ออนไลน์
- ชำระเงินผ่านระบบ
- ติดตามสถานะการนัดหมาย
- รีวิวและให้คะแนนแพทย์
- แชทกับ AI Chatbot เกี่ยวกับสุขภาพ

### 1.2 Tech Stack (Web)
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js + Supabase Auth
- **Payment**: PromptPay QR Code
- **AI**: OpenAI GPT-4 (Health Chatbot)
- **SMS**: Twilio (OTP, Notifications)
- **PDF**: jsPDF (Receipt generation)

### 1.3 โครงสร้างโปรเจค
```
Health-queue/
├── app/
│   ├── api/                    # API Routes
│   ├── auth/                   # Authentication pages
│   ├── book/                   # Booking flow (multi-step)
│   ├── dashboard/              # User dashboard
│   └── admin/                  # Admin dashboard (ลัลลาทำ)
├── components/                 # React components
├── lib/                        # Utilities & helpers
├── database-*.sql             # SQL migrations
└── IMPLEMENTATION_GUIDE.md    # Feature implementation guide
```

---

## 2. User Roles & Permissions

### 2.1 User Roles

| Role | Description | ทำอะไรได้บ้าง |
|------|-------------|---------------|
| **user** | ผู้ใช้งานทั่วไป (คนไข้) | จองนัด, ชำระเงิน, รีวิว, แชท AI |
| **admin** | ผู้ดูแลระบบ | จัดการผู้ใช้, แพทย์, คลินิก, การนัดหมาย |
| **hospital_staff** | เจ้าหน้าที่โรงพยาบาล | ยืนยันการชำระเงิน, อัพเดทสถานะนัด |

### 2.2 Permission Matrix

| Feature | user | admin | hospital_staff |
|---------|------|-------|----------------|
| จองนัดหมาย | ✅ | ✅ | ❌ |
| ยกเลิก/เลื่อนนัด | ✅ (เฉพาะของตัวเอง) | ✅ (ทุกนัด) | ✅ |
| ชำระเงิน | ✅ | ❌ | ❌ |
| ยืนยันการชำระเงิน | ❌ | ✅ | ✅ |
| รีวิวแพทย์ | ✅ | ❌ | ❌ |
| จัดการแพทย์/คลินิก | ❌ | ✅ | ❌ |
| ดูประวัติการรักษา | ✅ (ของตัวเอง) | ✅ (ทุกคน) | ✅ |
| แชท AI Chatbot | ✅ | ✅ | ❌ |

---

## 3. Authentication & Authorization

### 3.1 Authentication Flow

```
User Registration/Login
    ↓
NextAuth.js (Credentials Provider)
    ↓
Supabase Auth (verify credentials)
    ↓
Create JWT Token (session)
    ↓
Store in Cookie (http-only)
```

### 3.2 API Authentication

**ทุก API endpoint ต้องมี Authentication:**

```javascript
// Example: How to authenticate API calls
const response = await fetch('/api/appointments', {
  headers: {
    'Content-Type': 'application/json',
    // NextAuth session จะส่ง cookie automatically
  },
  credentials: 'include' // Important for cookies
})
```

**สำหรับ Flutter:**
```dart
// ต้องเก็บ session token และส่งกับทุก request
final response = await http.get(
  Uri.parse('$baseUrl/api/appointments'),
  headers: {
    'Cookie': 'next-auth.session-token=$sessionToken',
  },
);
```

### 3.3 User Object Structure

```typescript
{
  id: "uuid",
  email: "user@example.com",
  full_name: "ชื่อ นามสกุล",
  phone: "0812345678",
  date_of_birth: "1990-01-01",
  gender: "male" | "female" | "other",
  role: "user" | "admin" | "hospital_staff",
  profile_image_url: "https://...",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

---

## 4. Database Schema

### 4.1 Core Tables

#### 📊 **users**
```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  role TEXT DEFAULT 'user',
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### 👨‍⚕️ **doctors**
```sql
doctors (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  clinic_id UUID REFERENCES clinics(id),
  license_number TEXT UNIQUE,
  years_of_experience INTEGER,
  profile_image_url TEXT,
  biography TEXT,
  education TEXT[],
  languages TEXT[] DEFAULT ARRAY['th', 'en'],
  average_rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  consultation_fee DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### 🏥 **clinics**
```sql
clinics (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT,
  province TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  opening_hours JSONB,
  facilities TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### 📅 **appointments**
```sql
appointments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  doctor_id UUID REFERENCES doctors(id) NOT NULL,
  clinic_id UUID REFERENCES clinics(id) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending',
  symptoms TEXT,
  notes TEXT,
  queue_number INTEGER,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES users(id),
  rescheduled_from UUID REFERENCES appointments(id),
  rescheduled_to UUID REFERENCES appointments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Appointment Status:**
- `pending` - รอยืนยัน
- `confirmed` - ยืนยันแล้ว
- `completed` - เสร็จสิ้น
- `cancelled` - ยกเลิก
- `no_show` - ไม่มาตามนัด

#### 💰 **payments**
```sql
payments (
  id UUID PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'promptpay',
  payment_status TEXT DEFAULT 'pending',
  transaction_id TEXT UNIQUE,
  qr_code_url TEXT,
  slip_image_url TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Payment Status:**
- `pending` - รอชำระเงิน
- `paid` - ชำระแล้วรอตรวจสอบ
- `verified` - ตรวจสอบแล้ว
- `failed` - ไม่สำเร็จ
- `refunded` - คืนเงินแล้ว

#### 🔔 **notifications**
```sql
notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  related_appointment_id UUID REFERENCES appointments(id),
  related_payment_id UUID REFERENCES payments(id),
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
)
```

**Notification Types:**
- `info` - ข้อมูลทั่วไป
- `appointment` - เกี่ยวกับนัดหมาย
- `payment` - เกี่ยวกับการชำระเงิน
- `reminder` - การแจ้งเตือน

#### ⭐ **doctor_reviews**
```sql
doctor_reviews (
  id UUID PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, appointment_id)
)
```

#### ❤️ **favorite_doctors**
```sql
favorite_doctors (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  doctor_id UUID REFERENCES doctors(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, doctor_id)
)
```

#### 🏥 **medical_records**
```sql
medical_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  diagnosis TEXT,
  prescription TEXT,
  notes TEXT,
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
)
```

### 4.2 Database Triggers

**Auto-create notifications:**
```sql
-- เมื่อ appointment confirmed → สร้าง notification
-- เมื่อ payment verified → สร้าง notification
-- เมื่อ appointment cancelled → สร้าง notification
```

**Auto-update doctor ratings:**
```sql
-- เมื่อเพิ่ม/แก้ไข review → update average_rating และ review_count ใน doctors table
```

---

## 5. API Endpoints

### 5.1 Authentication APIs

#### POST `/api/auth/register`
**สมัครสมาชิกใหม่**

Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "ชื่อ นามสกุล",
  "phone": "0812345678",
  "date_of_birth": "1990-01-01",
  "gender": "male"
}
```

Response:
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "ชื่อ นามสกุล"
  }
}
```

#### POST `/api/auth/login`
**เข้าสู่ระบบ**

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "user": { /* user object */ },
  "token": "jwt-token-here"
}
```

---

### 5.2 Appointment APIs

#### GET `/api/appointments`
**ดึงรายการนัดหมายทั้งหมดของผู้ใช้**

Response:
```json
{
  "appointments": [
    {
      "id": "uuid",
      "appointment_date": "2024-01-15",
      "appointment_time": "09:00:00",
      "status": "confirmed",
      "queue_number": 5,
      "symptoms": "ปวดหัว",
      "notes": "อาการมา 2 วัน",
      "doctor": {
        "id": "uuid",
        "full_name": "นพ.สมชาย ใจดี",
        "specialty": "อายุรกรรม",
        "profile_image_url": "https://..."
      },
      "clinic": {
        "id": "uuid",
        "name": "คลินิกเฮลท์แคร์",
        "address": "123 ถนน..."
      },
      "payment": {
        "id": "uuid",
        "amount": 500,
        "payment_status": "verified"
      }
    }
  ]
}
```

#### POST `/api/appointments`
**สร้างนัดหมายใหม่**

Request:
```json
{
  "doctor_id": "uuid",
  "clinic_id": "uuid",
  "appointment_date": "2024-01-15",
  "appointment_time": "09:00",
  "symptoms": "ปวดหัว",
  "notes": "อาการมา 2 วัน"
}
```

Response:
```json
{
  "success": true,
  "appointment": { /* appointment object */ },
  "message": "Appointment created successfully"
}
```

#### POST `/api/appointments/[id]/cancel`
**ยกเลิกนัดหมาย**

Request:
```json
{
  "reason": "มีธุระด่วน"
}
```

Response:
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

#### POST `/api/appointments/[id]/reschedule`
**เลื่อนนัดหมาย**

Request:
```json
{
  "new_date": "2024-01-20",
  "new_time": "10:00",
  "reason": "ไม่สะดวกในวันเดิม"
}
```

Response:
```json
{
  "success": true,
  "new_appointment": { /* new appointment object */ },
  "message": "Appointment rescheduled successfully"
}
```

---

### 5.3 Doctor APIs

#### GET `/api/doctors`
**ดึงรายการแพทย์ทั้งหมด (รองรับ search & filter)**

Query Parameters:
- `search` - ค้นหาชื่อหรือความเชี่ยวชาญ
- `specialty` - กรองตามความเชี่ยวชาญ
- `clinic_id` - กรองตามคลินิก
- `min_rating` - คะแนนขั้นต่ำ
- `sort_by` - เรียงตาม (name, rating, experience, price)

Response:
```json
{
  "doctors": [
    {
      "id": "uuid",
      "full_name": "นพ.สมชาย ใจดี",
      "specialty": "อายุรกรรม",
      "years_of_experience": 10,
      "average_rating": 4.5,
      "review_count": 120,
      "consultation_fee": 500,
      "is_available": true,
      "profile_image_url": "https://...",
      "clinic": {
        "id": "uuid",
        "name": "คลินิกเฮลท์แคร์"
      }
    }
  ]
}
```

#### GET `/api/doctors/[id]`
**ดึงข้อมูลแพทย์แบบละเอียด**

Response:
```json
{
  "doctor": {
    "id": "uuid",
    "full_name": "นพ.สมชาย ใจดี",
    "specialty": "อายุรกรรม",
    "license_number": "12345",
    "years_of_experience": 10,
    "biography": "แพทย์ผู้เชี่ยวชาญ...",
    "education": ["จุฬาฯ", "มหิดล"],
    "languages": ["th", "en"],
    "average_rating": 4.5,
    "review_count": 120,
    "consultation_fee": 500,
    "clinic": { /* clinic object */ },
    "available_slots": [
      {
        "date": "2024-01-15",
        "slots": ["09:00", "10:00", "11:00"]
      }
    ]
  }
}
```

#### GET `/api/doctors/[id]/reviews`
**ดึงรีวิวของแพทย์**

Query Parameters:
- `page` - หน้าที่ต้องการ (default: 1)
- `limit` - จำนวนรายการต่อหน้า (default: 10)

Response:
```json
{
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "แพทย์ดูแลดีมาก",
      "user": {
        "full_name": "คนไข้ A",
        "profile_image_url": "https://..."
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "rating_stats": {
    "average": 4.5,
    "total": 120,
    "breakdown": {
      "5": 80,
      "4": 30,
      "3": 8,
      "2": 2,
      "1": 0
    }
  },
  "pagination": {
    "current_page": 1,
    "total_pages": 12,
    "total_reviews": 120
  }
}
```

#### POST `/api/doctors/[id]/reviews`
**เขียนรีวิวแพทย์**

Request:
```json
{
  "appointment_id": "uuid",
  "rating": 5,
  "comment": "แพทย์ดูแลดีมาก"
}
```

Response:
```json
{
  "success": true,
  "review": { /* review object */ },
  "message": "Review submitted successfully"
}
```

---

### 5.4 Payment APIs

#### POST `/api/payments/create`
**สร้างการชำระเงิน (Generate QR Code)**

Request:
```json
{
  "appointment_id": "uuid",
  "amount": 500
}
```

Response:
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "amount": 500,
    "qr_code_url": "https://...",
    "payment_status": "pending"
  }
}
```

#### POST `/api/payments/[id]/upload-slip`
**อัพโหลดสลิปการชำระเงิน**

Request (multipart/form-data):
```
slip_image: File
```

Response:
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "slip_image_url": "https://...",
    "payment_status": "paid"
  },
  "message": "Slip uploaded successfully"
}
```

#### POST `/api/payments/[id]/verify`
**ยืนยันการชำระเงิน (Admin/Staff only)**

Request:
```json
{
  "verified": true
}
```

Response:
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

#### GET `/api/payments/[appointmentId]/receipt`
**ดาวน์โหลดใบเสร็จ (PDF)**

Response: PDF file download

---

### 5.5 Notification APIs

#### GET `/api/notifications`
**ดึงการแจ้งเตือนทั้งหมด**

Response:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "การนัดหมายได้รับการยืนยัน",
      "message": "นัดหมายของคุณวันที่ 15 ม.ค. 2567 เวลา 09:00 ได้รับการยืนยันแล้ว",
      "type": "appointment",
      "is_read": false,
      "related_appointment_id": "uuid",
      "action_url": "/dashboard/appointments/uuid",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "unread_count": 5
}
```

#### POST `/api/notifications/[id]/read`
**ทำเครื่องหมายว่าอ่านแล้ว**

Response:
```json
{
  "success": true
}
```

#### DELETE `/api/notifications/read`
**ลบการแจ้งเตือนที่อ่านแล้วทั้งหมด**

Response:
```json
{
  "success": true,
  "deleted_count": 10
}
```

---

### 5.6 Favorite APIs

#### GET `/api/favorites`
**ดึงรายการแพทย์โปรด**

Response:
```json
{
  "favorites": [
    {
      "id": "uuid",
      "doctor": { /* doctor object */ },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST `/api/favorites/[doctorId]`
**เพิ่ม/ลบแพทย์โปรด (Toggle)**

Response:
```json
{
  "success": true,
  "is_favorite": true,
  "message": "Added to favorites"
}
```

#### GET `/api/favorites/[doctorId]`
**เช็คว่าเป็นแพทย์โปรดหรือไม่**

Response:
```json
{
  "is_favorite": true
}
```

---

### 5.7 Health Chatbot API

#### POST `/api/health-chat`
**แชทกับ AI Health Chatbot**

Request:
```json
{
  "message": "ปวดหัวมาหลายวัน ควรทำอย่างไร",
  "conversation_history": [
    {
      "role": "user",
      "content": "สวัสดีครับ"
    },
    {
      "role": "assistant",
      "content": "สวัสดีค่ะ มีอาการอะไรไหมคะ"
    }
  ]
}
```

Response:
```json
{
  "reply": "ปวดหัวหลายวันอาจมีสาเหตุหลายอย่าง...",
  "intent": "symptom_inquiry",
  "suggested_specialty": "อายุรกรรม",
  "suggested_actions": [
    "พักผ่อนให้เพียงพอ",
    "ดื่มน้ำมากๆ",
    "หากอาการไม่ดีขึ้น ควรพบแพทย์"
  ]
}
```

---

### 5.8 QR Code Generation API

#### POST `/api/generate-qr`
**สร้าง QR Code สำหรับ PromptPay**

Request:
```json
{
  "amount": 500,
  "payment_id": "uuid"
}
```

Response:
```json
{
  "qr_code_url": "data:image/png;base64,..."
}
```

---

## 6. User Features (ฝั่งผู้ใช้)

### 6.1 Priority 1 Features ✅ (ทำเสร็จแล้ว)

#### 1. ยกเลิก/เลื่อนนัดหมาย
- **Path**: `/dashboard/appointments`
- **Component**: `AppointmentActions.js`
- **API**:
  - `POST /api/appointments/[id]/cancel`
  - `POST /api/appointments/[id]/reschedule`
- **Features**:
  - ยกเลิกนัดพร้อมระบุเหตุผล
  - เลื่อนนัดโดยเลือกวันและเวลาใหม่
  - ตรวจสอบว่าไม่สามารถยกเลิก/เลื่อนนัดที่ผ่านมาแล้ว
  - สร้างการแจ้งเตือนอัตโนมัติ

#### 2. ดาวน์โหลดใบเสร็จ (PDF)
- **Path**: `/dashboard/payment/[appointmentId]`
- **Library**: `lib/pdfGenerator.js`
- **API**: `GET /api/payments/[appointmentId]/receipt`
- **Features**:
  - สร้าง PDF ใบเสร็จ
  - รวมข้อมูล: ชื่อ, วันที่, จำนวนเงิน, แพทย์, คลินิก
  - รองรับภาษาไทย/อังกฤษ

#### 3. ระบบการแจ้งเตือน
- **Component**: `NotificationDropdown.js`, `NotificationBell.js`
- **API**: `GET /api/notifications`
- **Features**:
  - แจ้งเตือนเมื่อนัดยืนยัน/ยกเลิก
  - แจ้งเตือนเมื่อชำระเงินสำเร็จ
  - นับจำนวนการแจ้งเตือนที่ยังไม่อ่าน
  - ทำเครื่องหมายว่าอ่านแล้ว
  - Database triggers สร้างการแจ้งเตือนอัตโนมัติ

---

### 6.2 Priority 2 Features ✅ (ทำเสร็จแล้ว)

#### 4. ระบบรีวิวและให้คะแนนแพทย์
- **Path**: `/dashboard/appointments` (หลังเสร็จนัด)
- **Component**: `DoctorReviewModal.js`, `DoctorReviews.js`
- **API**:
  - `POST /api/doctors/[id]/reviews`
  - `GET /api/doctors/[id]/reviews`
- **Features**:
  - ให้คะแนน 1-5 ดาว
  - เขียนคอมเมนต์ (ไม่บังคับ)
  - รีวิวได้เฉพาะนัดที่เสร็จสิ้นแล้ว
  - แสดงคะแนนเฉลี่ยและจำนวนรีวิว
  - แสดง rating breakdown (5 ดาว กี่คน, 4 ดาว กี่คน...)

#### 5. ค้นหาและกรองแพทย์
- **Path**: `/book` (Step 2 - เลือกแพทย์)
- **Features**:
  - ค้นหาตามชื่อแพทย์
  - ค้นหาตามความเชี่ยวชาญ (specialty)
  - กรองตามคะแนนขั้นต่ำ (1-5 ดาว)
  - เรียงลำดับตาม: ชื่อ, คะแนน, ประสบการณ์, ราคา
  - Real-time search (พิมพ์แล้วกรองทันที)

#### 6. บันทึกอาการและหมายเหตุ
- **Path**: `/book` (Step 4 - ยืนยันการจอง)
- **Fields**:
  - `symptoms` - อาการที่พบ (textarea)
  - `notes` - หมายเหตุเพิ่มเติม (textarea)
- **Features**:
  - ตัวนับจำนวนตัวอักษร
  - บันทึกใน appointments table
  - แพทย์สามารถดูได้เมื่อตรวจ

---

### 6.3 Priority 3 Features ✅ (ทำเสร็จแล้ว)

#### 7. รายการแพทย์โปรด
- **Component**: `FavoriteButton.js`
- **Path**: ทุกหน้าที่แสดงรายการแพทย์
- **API**:
  - `POST /api/favorites/[doctorId]` (Toggle)
  - `GET /api/favorites` (ดึงรายการ)
- **Features**:
  - ปุ่มหัวใจสีแดง
  - คลิกเพื่อเพิ่ม/ลบออกจากรายการโปรด
  - Animation เมื่อกด
  - หน้ารายการแพทย์โปรดทั้งหมด

#### 8. Footer สำหรับผู้ใช้
- **Component**: `UserFooter.js`
- **Path**: ทุกหน้าฝั่ง user (ไม่รวม admin)
- **Features**:
  - ข้อมูลบริษัท/โลโก้
  - Quick Links (เกี่ยวกับเรา, บริการ, ติดต่อเรา)
  - รายการบริการ
  - ข้อมูลติดต่อ (เบอร์, อีเมล, ที่อยู่)
  - Social Media Links
  - เวลาทำการ
  - รองรับภาษาไทย/อังกฤษ

---

### 6.4 Additional Features (มีอยู่แล้ว)

#### 9. ระบบจองนัดหมาย (Multi-Step)
- **Path**: `/book`
- **Steps**:
  1. เลือกคลินิก
  2. เลือกแพทย์
  3. เลือกวันและเวลา
  4. กรอกอาการและยืนยัน
- **Features**:
  - Progress bar แสดงขั้นตอน
  - ตรวจสอบ time slot ว่าง
  - สร้าง queue number อัตโนมัติ

#### 10. ระบบชำระเงิน (PromptPay)
- **Path**: `/dashboard/payment/[appointmentId]`
- **Flow**:
  1. Generate QR Code PromptPay
  2. ผู้ใช้สแกน QR และชำระเงิน
  3. อัพโหลดสลิปการชำระเงิน
  4. เจ้าหน้าที่ตรวจสอบและยืนยัน
- **Features**:
  - QR Code generation
  - Upload slip image
  - Payment verification (staff/admin)
  - Download receipt

#### 11. AI Health Chatbot
- **Component**: `UnifiedChatbot.js`
- **Path**: ทุกหน้า (floating button)
- **API**: `POST /api/health-chat`
- **Features**:
  - แชทกับ AI เกี่ยวกับอาการ
  - ให้คำแนะนำเบื้องต้น
  - แนะนำความเชี่ยวชาญแพทย์ที่เหมาะสม
  - Intent detection (ตรวจจับว่าผู้ใช้ต้องการอะไร)
  - รองรับภาษาไทย

#### 12. Dashboard
- **Path**: `/dashboard`
- **Sections**:
  - การนัดหมายที่จะถึง (Upcoming appointments)
  - ประวัติการนัดหมาย (Appointment history)
  - ประวัติการรักษา (Medical history)
  - การแจ้งเตือน (Notifications)

---

## 7. Admin Features (ฝั่ง Admin)

> **Note**: ฝั่ง Admin จะเป็นส่วนที่ลัลลาจะทำต่อ ตอนนี้ยังไม่มี UI แต่มี database schema พร้อมแล้ว

### 7.1 Features ที่ต้องทำ (สำหรับลัลลา)

#### 1. จัดการแพทย์ (Manage Doctors)
- CRUD แพทย์ (เพิ่ม/แก้ไข/ลบ)
- อัพโหลดรูปโปรไฟล์
- จัดการตารางเวลาว่าง
- เปิด/ปิดสถานะพร้อมรับนัด

#### 2. จัดการคลินิก (Manage Clinics)
- CRUD คลินิก
- จัดการข้อมูลคลินิก (ที่อยู่, เบอร์, เวลาทำการ)
- อัพโหลดรูปภาพคลินิก

#### 3. จัดการการนัดหมาย (Manage Appointments)
- ดูการนัดหมายทั้งหมด
- ยืนยัน/ยกเลิกนัด
- เปลี่ยนสถานะนัด
- จัดการ queue number

#### 4. จัดการการชำระเงิน (Manage Payments)
- ตรวจสอบสลิปการชำระเงิน
- ยืนยัน/ปฏิเสธการชำระเงิน
- ดูประวัติการชำระเงิน
- สร้างรายงานรายได้

#### 5. จัดการผู้ใช้ (Manage Users)
- ดูรายชื่อผู้ใช้ทั้งหมด
- แก้ไขข้อมูลผู้ใช้
- เปลี่ยน role (user/admin/hospital_staff)
- ระงับ/ปลดระงับผู้ใช้

#### 6. Dashboard & Analytics
- จำนวนการนัดหมายวันนี้
- รายได้วันนี้/เดือนนี้
- แพทย์ยอดนิยม
- กราฟสถิติต่างๆ

---

## 8. Business Logic & Rules

### 8.1 Appointment Rules

#### การจองนัดหมาย
- ผู้ใช้ต้อง login ก่อนจอง
- เลือกได้เฉพาะวันที่ในอนาคต (ไม่สามารถจองย้อนหลัง)
- เลือกได้เฉพาะเวลาที่แพทย์ว่าง
- 1 time slot = 30 นาที
- แต่ละ slot จองได้ 1 คนเท่านั้น

#### การยกเลิกนัดหมาย
- ยกเลิกได้เฉพาะนัดที่ status = `pending` หรือ `confirmed`
- ไม่สามารถยกเลิกนัดที่ผ่านมาแล้ว
- ต้องระบุเหตุผลการยกเลิก
- เมื่อยกเลิก → status เปลี่ยนเป็น `cancelled`
- สร้างการแจ้งเตือนไปยังแพทย์/คลินิก

#### การเลื่อนนัดหมาย
- เลื่อนได้เฉพาะนัดที่ยังไม่ผ่านมา
- สร้างนัดใหม่และ link กับนัดเดิม
- นัดเดิม → เก็บไว้เป็น history
- `rescheduled_from` และ `rescheduled_to` เก็บความสัมพันธ์

### 8.2 Payment Rules

#### การชำระเงิน
- ต้องชำระเงินก่อนนัดถึง 1 วัน
- ราคา = `doctor.consultation_fee`
- Payment method = PromptPay QR Code
- หลังชำระ → อัพโหลดสลิปเพื่อยืนยัน

#### Payment Status Flow
```
pending (สร้างนัด)
  → paid (อัพโหลดสลิป)
    → verified (เจ้าหน้าที่ตรวจสอบ)
      → appointment confirmed
```

#### การคืนเงิน
- ยกเลิกนัดก่อน 24 ชม. → คืนเงินเต็มจำนวน
- ยกเลิกนัดภายใน 24 ชม. → คืนเงิน 50%
- No show → ไม่คืนเงิน

### 8.3 Review Rules

#### การรีวิวแพทย์
- รีวิวได้เฉพาะนัดที่ status = `completed`
- 1 นัด สามารถรีวิวได้ 1 ครั้ง (UNIQUE constraint)
- Rating: 1-5 ดาว (จำเป็น)
- Comment: ไม่บังคับ
- เมื่อรีวิว → auto-update `average_rating` และ `review_count` ของแพทย์

### 8.4 Notification Rules

#### สร้างการแจ้งเตือนอัตโนมัติเมื่อ:
- นัดหมายได้รับการยืนยัน
- นัดหมายถูกยกเลิก
- นัดหมายถูกเลื่อน
- การชำระเงินได้รับการยืนยัน
- ใกล้ถึงวันนัด (reminder 1 วันก่อน)

### 8.5 Queue Number Rules

- Queue number สร้างอัตโนมัติตามลำดับการจอง
- เรียงตามคลินิก + วันที่
- Reset ทุกวัน (เริ่มใหม่ที่ 1)
- แสดงที่หน้า appointment details

---

## 9. Mobile Considerations

### 9.1 Authentication for Flutter

**สิ่งที่ Flutter ต้องทำ:**

1. **Login Flow**
```dart
// POST /api/auth/login
final response = await http.post(
  Uri.parse('$baseUrl/api/auth/login'),
  headers: {'Content-Type': 'application/json'},
  body: json.encode({
    'email': email,
    'password': password,
  }),
);

// เก็บ session token
final token = response.headers['set-cookie'];
await storage.write(key: 'session_token', value: token);
```

2. **Authenticated Requests**
```dart
// ทุก request ต้องส่ง cookie
final token = await storage.read(key: 'session_token');
final response = await http.get(
  Uri.parse('$baseUrl/api/appointments'),
  headers: {
    'Cookie': token,
  },
);
```

3. **Logout**
```dart
// DELETE token from storage
await storage.delete(key: 'session_token');
```

### 9.2 Image Upload

**สำหรับอัพโหลดสลิป:**
```dart
var request = http.MultipartRequest(
  'POST',
  Uri.parse('$baseUrl/api/payments/$id/upload-slip'),
);
request.files.add(
  await http.MultipartFile.fromPath('slip_image', imagePath),
);
request.headers['Cookie'] = token;
var response = await request.send();
```

### 9.3 Real-time Notifications

**ตัวเลือกสำหรับ Flutter:**

1. **Polling** (ง่ายที่สุด)
```dart
// ทุก 30 วินาที ดึงการแจ้งเตือนใหม่
Timer.periodic(Duration(seconds: 30), (timer) async {
  final notifications = await fetchNotifications();
  // Update UI
});
```

2. **Supabase Realtime** (แนะนำ)
```dart
// Subscribe to notifications table
supabase
  .from('notifications')
  .stream(primaryKey: ['id'])
  .eq('user_id', userId)
  .listen((data) {
    // Update UI in real-time
  });
```

3. **Firebase Cloud Messaging** (ถ้าต้องการ push notifications)

### 9.4 PDF Viewing

**สำหรับดาวน์โหลดและดูใบเสร็จ:**
```dart
// ใช้ package: flutter_cached_pdfview
final url = '$baseUrl/api/payments/$appointmentId/receipt';
PDFView(
  filePath: url,
  enableSwipe: true,
);
```

### 9.5 Local Storage Recommendations

**ข้อมูลที่ควร cache:**
- User profile
- Favorite doctors
- Recent appointments
- Notification history

**ห้าม cache:**
- Payment information
- Medical records (ต้อง fetch ทุกครั้ง)

### 9.6 Error Handling

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (ข้อมูลไม่ถูกต้อง)
- `401` - Unauthorized (ไม่ได้ login)
- `403` - Forbidden (ไม่มีสิทธิ์)
- `404` - Not Found
- `500` - Server Error

**ตัวอย่าง Error Response:**
```json
{
  "error": "Appointment not found",
  "message": "The requested appointment does not exist",
  "status": 404
}
```

---

## 10. Environment Setup

### 10.1 Environment Variables

**Web (.env.local):**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ruiglnhjgvvoynhvtugt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# NextAuth
AUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3001

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Twilio (SMS)
TWILIO_ACCOUNT_SID=AC788af85dad...
TWILIO_AUTH_TOKEN=AC788af85dad...
TWILIO_PHONE_NUMBER=+1234567890
```

**Flutter (.env):**
```bash
API_BASE_URL=http://localhost:3001
# หรือ production URL
# API_BASE_URL=https://health-queue.vercel.app

SUPABASE_URL=https://ruiglnhjgvvoynhvtugt.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

### 10.2 Database Migrations

**ต้องรันตามลำดับนี้ใน Supabase SQL Editor:**

1. `database-notifications.sql`
2. `database-appointment-updates.sql`
3. `database-doctor-reviews.sql`
4. `database-favorite-doctors.sql`
5. `database-payment-system.sql`

**หมายเหตุ:** ไฟล์เหล่านี้อยู่ใน root folder ของโปรเจค

### 10.3 API Base URLs

**Development:**
- Web: `http://localhost:3001`
- API: `http://localhost:3001/api`

**Production:**
- Web: `https://health-queue.vercel.app` (ตัวอย่าง)
- API: `https://health-queue.vercel.app/api`

---

## 11. Common Patterns

### 11.1 Date/Time Format

**Database:**
- Date: `YYYY-MM-DD` (e.g., `2024-01-15`)
- Time: `HH:MM:SS` (e.g., `09:00:00`)
- DateTime: ISO 8601 (e.g., `2024-01-15T09:00:00Z`)

**Display:**
- Thai: `15 ม.ค. 2567 เวลา 09:00 น.`
- English: `Jan 15, 2024 at 09:00 AM`

### 11.2 Multilingual Support

**ภาษาที่รองรับ:**
- Thai (`th`) - ภาษาหลัก
- English (`en`)

**Translation File:**
`lib/translations.js` - รวม translations ทั้งหมด

**ตัวอย่างการใช้:**
```javascript
import { translations } from '@/lib/translations'

const t = translations[language] // language = 'th' or 'en'
console.log(t.appointment.title) // "การนัดหมาย" or "Appointments"
```

### 11.3 Image Handling

**Profile Images:**
- Store in Supabase Storage bucket: `avatars`
- Max size: 5MB
- Formats: JPG, PNG, WebP
- Resize to: 256x256px (thumbnail), 512x512px (full)

**Payment Slips:**
- Store in Supabase Storage bucket: `payment-slips`
- Max size: 10MB
- Formats: JPG, PNG, PDF

### 11.4 Pagination

**Default:**
- Page size: 10 items
- Query params: `?page=1&limit=10`

**Response format:**
```json
{
  "data": [ /* items */ ],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 100,
    "per_page": 10
  }
}
```

---

## 12. Testing Data

### 12.1 Test Users

```sql
-- User (คนไข้)
email: user@test.com
password: password123

-- Admin
email: admin@test.com
password: admin123

-- Hospital Staff
email: staff@test.com
password: staff123
```

### 12.2 Test Doctors

```sql
-- นพ.สมชาย ใจดี (อายุรกรรม)
-- นพ.สมหญิง รักษา (กุมารเวชกรรม)
-- นพ.สมศักดิ์ หมอดี (ศัลยกรรม)
```

### 12.3 Test Clinics

```sql
-- คลินิกเฮลท์แคร์
-- โรงพยาบาลสุขภาพดี
```

---

## 13. Important Notes

### 13.1 Security Considerations

1. **ห้ามเปิดเผย:**
   - Password (เก็บ hash เท่านั้น)
   - API Keys (OPENAI_API_KEY, TWILIO_AUTH_TOKEN)
   - Service Role Key (SUPABASE_SERVICE_ROLE_KEY)

2. **Validate ทุก Input:**
   - Email format
   - Phone number format
   - Date/time ต้องอยู่ในอนาคต
   - File size และ type

3. **Rate Limiting:**
   - AI Chatbot: 20 requests/minute/user
   - OTP: 5 requests/hour/phone

### 13.2 Performance Tips

1. **Caching:**
   - Doctor list (cache 5 minutes)
   - Clinic list (cache 10 minutes)
   - User profile (cache until update)

2. **Lazy Loading:**
   - Load images on demand
   - Paginate long lists
   - Virtual scrolling for large datasets

3. **Optimize Images:**
   - Use WebP format
   - Serve responsive sizes
   - Lazy load below the fold

### 13.3 Known Limitations

1. **AI Chatbot:**
   - ไม่สามารถวินิจฉัยโรคได้ (เป็นเพียงคำแนะนำเบื้องต้น)
   - ควรให้ disclaimer ชัดเจน

2. **Payment:**
   - PromptPay เท่านั้น (ยังไม่รองรับบัตรเครดิต)
   - ต้องอัพโหลดสลิปและรอการยืนยัน (ไม่ real-time)

3. **Notifications:**
   - ไม่มี push notifications (ต้อง poll หรือใช้ Supabase Realtime)

---

## 14. Support & Documentation

### 14.1 เอกสารเพิ่มเติม

- `IMPLEMENTATION_GUIDE.md` - รายละเอียดการทำงานของแต่ละฟีเจอร์
- `README.md` - การติดตั้งและรันโปรเจค
- Database Schema: ดูใน Supabase Dashboard

### 14.2 Contact

- **เนม (User-side Developer)** - ดูแลฝั่ง User Features
- **ลัลลา (Admin-side Developer)** - ดูแลฝั่ง Admin Features

---

## 15. Quick Start for Flutter

### ขั้นตอนเริ่มต้นสำหรับ Flutter Developer:

1. **อ่านเอกสารนี้ทั้งหมด** ✅

2. **ตั้งค่า Environment:**
```dart
// .env
API_BASE_URL=http://localhost:3001
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

3. **ทดสอบ API Endpoints:**
```dart
// ลอง GET /api/doctors
// ลอง POST /api/auth/login
```

4. **สร้าง Models:**
```dart
class User { ... }
class Doctor { ... }
class Appointment { ... }
```

5. **สร้าง API Service:**
```dart
class ApiService {
  static const baseUrl = 'http://localhost:3001/api';

  Future<List<Doctor>> getDoctors() async { ... }
  Future<Appointment> createAppointment(...) async { ... }
}
```

6. **สร้าง UI Screens:**
- Login/Register
- Doctor List
- Booking Flow
- Appointments
- Payment
- Profile

7. **เทสทุกอย่าง!** 🚀

---

## 16. Checklist

### สำหรับ Flutter Developer

- [ ] อ่านเอกสารนี้ครบ
- [ ] เข้าใจ User Roles และ Permissions
- [ ] เข้าใจ Authentication Flow
- [ ] เข้าใจ Database Schema
- [ ] ทดสอบ API Endpoints ทุกตัว
- [ ] สร้าง Models สำหรับทุก entity
- [ ] สร้าง API Service layer
- [ ] Implement Authentication
- [ ] Implement Booking Flow
- [ ] Implement Payment Flow
- [ ] Implement Notifications
- [ ] Test กับ real data
- [ ] Handle errors properly
- [ ] Add loading states
- [ ] Optimize performance

---

**เอกสารนี้จัดทำโดย: Claude Code**
**วันที่อัพเดท: 18 พ.ย. 2567**
**Version: 1.0**

---

ถ้ามีคำถามเพิ่มเติม ติดต่อเนมหรือลัลลาได้เลย! 🚀
