# 📚 คู่มือเข้าใจโปรเจค Health-queue ทั้งหมด

---

## 1️⃣ **Supabase vs Firebase - คุณเลือก Supabase**

### **Supabase คืออะไร:**
- **Backend-as-a-Service (BaaS)** - มีทุกอย่างพร้อมให้ใช้
- ฐานข้อมูล **PostgreSQL** (SQL แบบเต็มรูปแบบ)
- **Authentication** สำเร็จรูป (Email/Password, Google OAuth, etc.)
- **Storage** สำหรับอัปโหลดไฟล์
- **Row Level Security (RLS)** - ความปลอดภัยระดับแถวข้อมูล
- **Realtime subscriptions** - อัปเดตข้อมูลแบบ real-time

### **ทำไมถึงเลือก Supabase:**
- **Open source** (Firebase ปิด)
- ใช้ **SQL** (เรียนรู้ได้ง่าย, มาตรฐาน)
- **ราคาถูกกว่า Firebase** เยอะ
- มี **self-hosting** ได้ (Firebase ไม่ได้)
- ในไทยอาจจะไม่นิยม แต่ในต่างประเทศกำลังฮิตมาก

### **ในโปรเจคคุณใช้ Supabase ทำอะไรบ้าง:**
```
✅ Authentication (auth.users) - Login/Register
✅ Database (16 ตาราง) - profiles, appointments, doctors, etc.
✅ Storage (medical-documents) - อัปโหลดไฟล์เอกสาร
✅ Row Level Security - ป้องกันคนอื่นเห็นข้อมูล
```

---

## 2️⃣ **Google OAuth - Login ด้วย Google**

### **OAuth คืออะไร:**
- ระบบที่ให้ผู้ใช้ **Login ด้วยบัญชี Google** แทนการสร้างรหัสผ่าน
- ปลอดภัยกว่า (Google จัดการ)
- สะดวกกว่า (ไม่ต้องจำรหัสผ่าน)

### **ในโปรเจคคุณ:**
```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Login ด้วย Google
await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

**ตัวอย่างการใช้งาน:**
- ผู้ใช้กดปุ่ม "Login with Google"
- Supabase เปิดหน้า Google Login
- ผู้ใช้ login สำเร็จ → Supabase สร้างบัญชีให้อัตโนมัติ
- ข้อมูลบันทึกใน `auth.users` และ `profiles`

---

## 3️⃣ **Next.js - ใช้ .js แทน .jsx**

### **Next.js คืออะไร:**
- **React Framework** ที่มีฟีเจอร์พร้อมใช้มากกว่า React ธรรมดา
- มี **Server-Side Rendering (SSR)** - โหลดเร็ว, SEO ดี
- มี **App Router** (ใหม่กว่า Pages Router)
- มี **API Routes** - สร้าง Backend ได้ในโปรเจคเดียวกัน

### **ทำไมใช้ .js แทน .jsx:**
- **ทำได้ทั้งคู่!** .js กับ .jsx เหมือนกันเลย
- Next.js รู้จัก JSX ใน .js อยู่แล้ว (ไม่ต้องเปลี่ยน extension)
- **แนวโน้มใหม่:** คนใช้ .js มากขึ้น (เพราะสั้นกว่า)
- TypeScript ก็ใช้ .ts แทน .tsx เหมือนกัน

```javascript
// app/[locale]/login/page.js
export default function LoginPage() {
  return <div>Login</div>  // ← JSX ใน .js ได้ปกติ
}
```

---

## 4️⃣ **i18n (Internationalization) - ระบบหลายภาษา**

### **i18n คืออะไร:**
- **Internationalization** = การทำให้เว็บรองรับหลายภาษา
- ไม่ใช่ logic ธรรมดา แต่เป็น **library เฉพาะทาง**
- ในโปรเจคคุณใช้ **next-intl**

### **ทำไมไม่ใช้ if-else ธรรมดา:**
```javascript
// ❌ วิธีแย่ - Hardcode
{locale === 'th' ? 'สวัสดี' : 'Hello'}

// ✅ วิธีดี - ใช้ i18n
import { useTranslations } from 'next-intl'
const t = useTranslations('common')
{t('greeting')} // อ่านจาก messages/th.json หรือ en.json
```

### **โครงสร้าง i18n ในโปรเจค:**

#### **1. Translation files (7 ไฟล์)**
```
messages/
├── th.json    # ไทย
├── en.json    # อังกฤษ
├── ja.json    # ญี่ปุ่น
├── ko.json    # เกาหลี
├── zh.json    # จีน
├── ru.json    # รัสเซีย
└── hi.json    # ฮินดี
```

**ตัวอย่าง messages/th.json:**
```json
{
  "greeting": "สวัสดี",
  "login": {
    "title": "เข้าสู่ระบบ",
    "email": "อีเมล",
    "password": "รหัสผ่าน",
    "submit": "เข้าสู่ระบบ"
  },
  "dashboard": {
    "appointments": "นัดหมายของฉัน",
    "profile": "โปรไฟล์"
  }
}
```

**ตัวอย่าง messages/en.json:**
```json
{
  "greeting": "Hello",
  "login": {
    "title": "Login",
    "email": "Email",
    "password": "Password",
    "submit": "Sign In"
  }
}
```

#### **2. Routing config (i18n/routing.js)**
```javascript
// i18n/routing.js
export const routing = {
  locales: ['en', 'th', 'ja', 'ko', 'zh', 'ru', 'hi'],
  defaultLocale: 'en'
}
```

#### **3. Middleware (middleware.js)**
```javascript
// middleware.js - จัดการ URL อัตโนมัติ
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

// ผลลัพธ์:
// /login → redirect ไป /en/login
// /th/login → โหลดภาษาไทย
// /ja/login → โหลดภาษาญี่ปุ่น
```

#### **4. Dynamic folder structure**
```
app/
└── [locale]/        ← Dynamic route (locale = th, en, ja, ...)
    ├── login/
    │   └── page.js  → URL: /th/login, /en/login, /ja/login
    ├── dashboard/
    │   └── page.js  → URL: /th/dashboard, /en/dashboard
    └── admin/
        └── page.js
```

#### **5. ใช้ใน Component**
```javascript
// app/[locale]/login/page.js
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('login')

  return (
    <div>
      <h1>{t('title')}</h1>
      <input placeholder={t('email')} />
      <input placeholder={t('password')} />
      <button>{t('submit')}</button>
    </div>
  )
}
```

### **i18n เป็น logic ไหม?**
- **ไม่ใช่ logic ธรรมดา** แต่เป็น **pattern/architecture**
- เป็น **best practice** ในการทำเว็บหลายภาษา
- ใช้ **library** ที่ออกแบบมาเฉพาะ

---

## 5️⃣ **Next.js Versions - คุณใช้เวอร์ชันไหน**

### **เวอร์ชันที่คุณใช้:**
```json
{
  "next": "14.0.4",           // Next.js เวอร์ชัน 14 (ล่าสุด)
  "react": "18.2.0",          // React 18
  "next-intl": "4.5.5",       // i18n library
  "@supabase/supabase-js": "2.39.0",  // Supabase client
  "tailwindcss": "3.3.6"      // CSS framework
}
```

### **Next.js 14 มีอะไรใหม่:**
- **App Router** (คุณใช้อันนี้) - ระบบ routing แบบใหม่
- **Server Components** - Component ที่รันฝั่ง server
- **Turbopack** - Build tool เร็วกว่า Webpack
- **Metadata API** - จัดการ SEO ง่ายขึ้น

### **App Router vs Pages Router:**
```
App Router (ใหม่ - คุณใช้):
app/
└── [locale]/
    └── login/
        └── page.js       ← ไฟล์ชื่อ page.js

Pages Router (เก่า):
pages/
└── login.js             ← ไฟล์ชื่อตาม route
```

---

## 6️⃣ **ฝั่ง User vs ฝั่ง Admin - แยกแต่ใช้ร่วมกัน**

### **โครงสร้างที่แยก:**
```
app/[locale]/
├── dashboard/           ← ฝั่ง USER (10+ หน้า)
│   ├── page.js
│   ├── profile/
│   ├── appointments/
│   └── book-appointment/
│
└── admin/              ← ฝั่ง ADMIN (12 หน้า)
    ├── dashboard/
    ├── users/
    ├── appointments/
    ├── chat/
    └── settings/
```

### **ส่วนที่ใช้ร่วมกัน (คุณต้องรู้!):**

#### **1. lib/ - Core libraries (ใช้ทั้ง User + Admin)**
```
lib/
├── supabase.js          ← Supabase client (ทั้ง 2 ฝั่งใช้)
├── auth.js              ← ระบบ Login/Logout (ทั้ง 2 ฝั่งใช้)
├── notifications.js     ← ระบบแจ้งเตือน (ทั้ง 2 ฝั่งใช้)
├── email.js             ← ส่งอีเมล (Admin ส่งหา User)
└── sms.js               ← ส่ง SMS (Admin ส่งหา User)
```

#### **2. API Routes (Backend - ทั้ง 2 ฝั่งเรียกใช้)**
```
app/api/
├── appointments/        ← User จอง, Admin อนุมัติ
├── notifications/       ← ทั้ง 2 ฝั่งอ่าน
├── profile/             ← User แก้ไข, Admin ดู
├── admin/               ← Admin เท่านั้น
└── chat/                ← Admin คุยกับ User
```

#### **3. Components (บางตัวใช้ร่วมกัน)**
```
components/
├── NotificationBell.js  ← ทั้ง 2 ฝั่งใช้
├── LanguageSelector.js  ← ทั้ง 2 ฝั่งใช้
├── DatePicker.js        ← ทั้ง 2 ฝั่งใช้
└── admin/               ← Admin เท่านั้น
    ├── Sidebar.js
    └── TagBadge.js
```

#### **4. Database (ใช้ร่วมกัน 100%)**
```
ตาราง profiles:
- User แก้ไขโปรไฟล์ตัวเอง
- Admin ดูและแก้ไขได้ทุกคน

ตาราง appointments:
- User สร้างนัดหมาย
- Admin อนุมัติ/ปฏิเสธ

ตาราง notifications:
- Admin สร้างการแจ้งเตือน
- User อ่านการแจ้งเตือน
```

---

## 7️⃣ **การ Import ในแต่ละไฟล์ - ทำไมต้องมีเยอะ**

### **วิเคราะห์ Import ในไฟล์ dashboard/page.js:**

```javascript
// ========== Line 1 ==========
'use client'
// ← บอก Next.js ว่านี่คือ Client Component (รันในเบราว์เซอร์)
// เพราะใช้ useState, useEffect

// ========== React Hooks ==========
import { useEffect, useState } from 'react'
// useEffect → รันโค้ดหลัง render (เช่น fetch data)
// useState → เก็บข้อมูลที่เปลี่ยนแปลงได้ (state)

// ========== Next.js Navigation ==========
import { useRouter } from 'next/navigation'
// useRouter → เปลี่ยนหน้า (router.push('/login'))

// ========== Custom Functions (lib/) ==========
import { getCurrentUser } from '@/lib/auth'
// ← ฟังก์ชันเช็คว่า user login อยู่ไหม

import { supabase } from '@/lib/supabase'
// ← Supabase client สำหรับดึงข้อมูลจาก database

// ========== Custom Hooks ==========
import { useTranslation } from '@/hooks/useTranslation'
// ← Hook สำหรับแปลภาษา (i18n)

// ========== Components ==========
import UserHeader from '@/components/UserHeader'
// ← Header ของหน้า user

import Footer from '@/components/Footer'
// ← Footer

import UnifiedChatbot from '@/components/UnifiedChatbot'
// ← AI Chatbot

// ========== Icons จาก lucide-react ==========
import {
  Calendar, Heart, User, Zap, Baby, Stethoscope,
  Activity, Eye, Smile, X, Bone, Camera, Brain,
  Wind, Droplet, Syringe, Pill, FileText, Ear,
  Sparkles, Microscope, ChevronLeft, ChevronRight
} from 'lucide-react'
// ← Icons สำหรับแสดงผล (ปุ่ม, เมนู, ตกแต่ง)
```

### **@ คืออะไร:**
```javascript
import { getCurrentUser } from '@/lib/auth'
//                              ↑
//                       @ = root ของโปรเจค
```

**ตั้งค่าใน jsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**เทียบเท่า:**
```javascript
// แทนที่จะเขียน:
import { getCurrentUser } from '../../../lib/auth'

// เขียนสั้นๆ:
import { getCurrentUser } from '@/lib/auth'
```

---

## 8️⃣ **Routing ใน Next.js App Router**

### **File-based Routing:**
```
app/[locale]/dashboard/page.js
     ↓       ↓        ↓
     |       |        |
  dynamic  folder   page file
  segment   name

URL: /th/dashboard
     ↓   ↓
   locale segment
```

### **ตัวอย่างครบวงจร:**

```
app/
└── [locale]/                    ← Dynamic: th, en, ja, ...
    ├── page.js                  → URL: /th, /en
    ├── login/
    │   └── page.js              → URL: /th/login
    ├── register/
    │   └── page.js              → URL: /th/register
    ├── dashboard/
    │   ├── page.js              → URL: /th/dashboard
    │   ├── profile/
    │   │   └── page.js          → URL: /th/dashboard/profile
    │   └── appointments/
    │       ├── page.js          → URL: /th/dashboard/appointments
    │       └── [id]/
    │           └── page.js      → URL: /th/dashboard/appointments/123
    │                                    (id = 123)
    └── admin/
        ├── dashboard/
        │   └── page.js          → URL: /th/admin/dashboard
        └── users/
            └── page.js          → URL: /th/admin/users
```

### **Dynamic Routes:**
```javascript
// app/[locale]/dashboard/appointments/[id]/page.js
export default function AppointmentDetail({ params }) {
  const { locale, id } = params
  // URL: /th/dashboard/appointments/456
  // locale = 'th'
  // id = '456'
}
```

---

## 9️⃣ **ไฟล์สำคัญที่ต้องรู้ทั้งหมด**

### **A. Config Files (6 ไฟล์)**
```
next.config.js          - ตั้งค่า Next.js + next-intl
middleware.js           - จัดการ URL routing (locale)
jsconfig.json           - ตั้งค่า @ alias
tailwind.config.js      - ตั้งค่า Tailwind CSS
postcss.config.js       - CSS processing
.env.local              - Environment variables (ความลับ)
```

### **B. i18n System (4 ไฟล์ + 7 translations)**
```
i18n/
├── routing.js          - ตั้งค่า locales
└── request.js          - Request configuration

messages/               - Translation files (7 ภาษา)
├── th.json
├── en.json
├── ja.json
├── ko.json
├── zh.json
├── ru.json
└── hi.json

hooks/
└── useTranslation.js   - Custom hook แปลภาษา
```

### **C. Core Libraries (7 ไฟล์)**
```
lib/
├── supabase.js         - Supabase client (ใช้ทุกที่)
├── auth.js             - Login/Logout/getCurrentUser
├── notifications.js    - ระบบแจ้งเตือน
├── email.js            - ส่งอีเมล (Gmail/Resend)
├── sms.js              - ส่ง SMS (Twilio)
├── translations.js     - แปลภาษา (helper functions)
└── pdfGenerator.js     - สร้าง PDF
```

### **D. User Pages (10+ ไฟล์)**
```
app/[locale]/
├── page.js                           - หน้าแรก
├── login/page.js                     - Login
├── register/page.js                  - Register (4 steps)
├── dashboard/
│   ├── page.js                       - Dashboard หลัก
│   ├── profile/page.js               - โปรไฟล์
│   ├── appointments/page.js          - ดูนัดหมาย
│   ├── medical-history/page.js       - ประวัติการรักษา
│   └── book-appointment/
│       ├── new/page.js               - Step 1-3
│       └── step-4/page.js            - Step 4
```

### **E. Admin Pages (12 ไฟล์)**
```
app/[locale]/admin/
├── dashboard/page.js                 - Dashboard
├── users/page.js                     - จัดการ Users
├── appointments/page.js              - จัดการนัดหมาย
├── doctors/page.js                   - จัดการหมอ
├── departments/page.js               - จัดการแผนก
├── chat/page.js                      - แชทกับ User
├── canned-responses/page.js          - ข้อความสำเร็จรูป
├── settings/page.js                  - ตั้งค่า
├── reports/page.js                   - รายงาน
├── notifications/page.js             - การแจ้งเตือน
└── files/page.js                     - จัดการไฟล์
```

### **F. API Routes (35+ ไฟล์)**
```
app/api/
├── appointments/
│   ├── create/route.js
│   ├── send-notification/route.js
│   └── create-approval-notification/route.js
├── notifications/
│   ├── route.js
│   └── mark-all-read/route.js
├── profile/
│   └── route.js
├── admin/
│   ├── users/route.js
│   └── canned-responses/route.js
├── chat/
│   ├── messages/route.js
│   └── send/route.js
└── cron/
    ├── send-appointment-reminders/route.js
    └── send-appointment-email-reminders/route.js
```

### **G. Components (18 ไฟล์)**
```
components/
├── UserHeader.js
├── UserFooter.js
├── NotificationBell.js
├── LanguageSelector.js
├── MedicalChatbot.js
├── UnifiedChatbot.js
├── DatePicker.js
├── TimePicker.js
└── admin/
    ├── Sidebar.js
    ├── CannedResponsePicker.js
    ├── TagBadge.js
    └── TagSelectorModal.js
```

---

## 🔟 **Data Flow - ข้อมูลไหลยังไง**

### **ตัวอย่าง: User จองนัดหมาย**

```
1. User กรอกฟอร์ม
   ↓
   app/[locale]/dashboard/book-appointment/step-4/page.js

2. กด Submit → เรียก API
   ↓
   fetch('/api/appointments/create', { ... })

3. API บันทึกลง Database
   ↓
   app/api/appointments/create/route.js
   ↓
   lib/supabase.js → Supabase Database
   ↓
   ตาราง: appointments

4. Admin เห็นนัดหมายใหม่
   ↓
   app/[locale]/admin/appointments/page.js
   ↓
   fetch ข้อมูลจาก Supabase

5. Admin อนุมัติ → ส่งการแจ้งเตือน
   ↓
   fetch('/api/appointments/create-approval-notification')
   ↓
   lib/email.js → ส่งอีเมล
   lib/sms.js → ส่ง SMS
   lib/notifications.js → สร้าง in-app notification

6. User เห็นการแจ้งเตือน
   ↓
   components/NotificationBell.js
   ↓
   fetch('/api/notifications')
```

---

## 1️⃣1️⃣ **ส่วนที่ User และ Admin ใช้ร่วมกัน (ต้องรู้!)**

### **1. Authentication (lib/auth.js)**
```javascript
// ทั้ง User และ Admin ใช้ฟังก์ชันเดียวกัน
import { getCurrentUser } from '@/lib/auth'

// ใน User page:
const user = await getCurrentUser()
if (!user) router.push('/login')

// ใน Admin page:
const user = await getCurrentUser()
if (!user?.is_admin) router.push('/login')
```

### **2. Supabase Client (lib/supabase.js)**
```javascript
import { supabase } from '@/lib/supabase'

// User ดึงนัดหมายตัวเอง:
const { data } = await supabase
  .from('appointments')
  .select('*')
  .eq('user_id', user.id)

// Admin ดึงนัดหมายทั้งหมด:
const { data } = await supabase
  .from('appointments')
  .select('*')
```

### **3. Notifications (lib/notifications.js)**
```javascript
// Admin สร้างการแจ้งเตือน:
await createNotification(userId, 'นัดหมายได้รับการอนุมัติ')

// User อ่านการแจ้งเตือน:
const notifications = await getNotifications(userId)
```

### **4. i18n (hooks/useTranslation.js)**
```javascript
// ทั้ง 2 ฝั่งใช้เหมือนกัน:
const { t, locale } = useTranslation()
```

---

## 1️⃣2️⃣ **Environment Variables (.env.local)**

### **Environment Variables ที่คุณใช้:**

```env
# ========== Supabase ==========
NEXT_PUBLIC_SUPABASE_URL=https://ruiglnhjgvvoynhvtugt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...  # Public key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...      # Admin key (อันตราย!)

# ========== Authentication ==========
AUTH_SECRET=your-super-secret-key...
NEXTAUTH_URL=http://localhost:3001

# ========== Google OAuth ==========
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id...

# ========== SMS (Twilio) ==========
TWILIO_ACCOUNT_SID=AC788af85dad648...
TWILIO_AUTH_TOKEN=03d639f417612882...
TWILIO_PHONE_NUMBER=+17622043456
TWILIO_MESSAGING_SERVICE_SID=MG96a0571be78a...

# ========== Email (Gmail) ==========
GMAIL_USER=peerapan.uai@gmail.com
GMAIL_APP_PASSWORD=hbirsxkbmxlekzcy
EMAIL_FROM=Health Queue <peerapan.uai@gmail.com>

# ========== AI Chatbot ==========
OPENAI_API_KEY=sk-proj-5KF_mARm...

# ========== Cron Jobs ==========
CRON_SECRET=3d4e97c4b5762792...
CLEANUP_SECRET=your-random-secret-key...

# ========== App URL ==========
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### **NEXT_PUBLIC_ คืออะไร:**
- **NEXT_PUBLIC_** → เข้าถึงได้จากฝั่ง Client (Browser)
- **ไม่มี prefix** → เข้าถึงได้แค่ฝั่ง Server (API Routes)

```javascript
// ✅ Client Component (Browser)
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL) // ได้

// ❌ Client Component (Browser)
console.log(process.env.GMAIL_APP_PASSWORD) // undefined (ดี!)

// ✅ API Route (Server)
console.log(process.env.GMAIL_APP_PASSWORD) // ได้
```

---

## 1️⃣3️⃣ **สรุปท้ายสุด - สิ่งที่คุณควรรู้สำหรับพรีเซนต์**

### **A. เทคโนโลยีที่ใช้:**
1. **Next.js 14** - React framework (App Router)
2. **Supabase** - Backend (Database + Auth + Storage)
3. **Tailwind CSS** - Styling
4. **next-intl** - i18n (7 ภาษา)
5. **Google Gemini** - AI Chatbot
6. **Nodemailer** - Email
7. **Twilio** - SMS (ถ้ามี)

### **B. ฟีเจอร์หลัก:**
1. ระบบจองนัดหมาย (4 steps)
2. ระบบแจ้งเตือนอัตโนมัติ (Email + SMS + In-app)
3. Admin Dashboard
4. AI Chatbot
5. ระบบแชท Admin-User
6. รองรับ 7 ภาษา
7. Payment (PromptPay QR)

### **C. โครงสร้างโปรเจค:**
- **16 ตาราง** Database
- **35+ API endpoints**
- **22 หน้า** (10 User + 12 Admin)
- **18 Components**
- **7 Core libraries** (lib/)

### **D. ส่วนที่ใช้ร่วมกัน (User + Admin):**
1. **lib/** - supabase.js, auth.js, notifications.js
2. **API Routes** - appointments, notifications, profile
3. **Components** - NotificationBell, LanguageSelector
4. **i18n** - useTranslation hook
5. **Database** - ตารางเดียวกัน แต่ RLS กันไว้

### **E. คำถามที่อาจถูกถาม:**
1. **ทำไมเลือก Supabase?** → Open source, SQL, ราคาถูก
2. **ทำไมใช้ .js แทน .jsx?** → Next.js รู้จัก JSX ใน .js อยู่แล้ว
3. **i18n ทำงานยังไง?** → next-intl + messages/*.json
4. **User กับ Admin แยกยังไง?** → โฟลเดอร์แยก แต่ใช้ lib/ และ database ร่วมกัน
5. **ความปลอดภัย?** → Supabase RLS + Environment Variables

---

**สร้างเมื่อ:** 2025-01-29
**โปรเจค:** Health-queue - ระบบจัดการคิวนัดหมายโรงพยาบาล
