# Health Queue - Components Documentation

## 📦 New Components Created

ระบบ Header และ Chatbot สำหรับ User Dashboard

### 1. **UserHeader Component**
📁 `components/UserHeader.js`

Header component หลักสำหรับผู้ใช้ที่มีฟีเจอร์ครบครัน

**Features:**
- 🔍 Search bar สำหรับค้นหาแพทย์
- 📅 Quick links to Appointments & Medical Records
- 🔔 Notifications with real-time updates
- 🌐 Language switcher (Thai/English)
- 👤 User profile menu
- 📱 Responsive design (mobile-friendly)

**Usage:**
```jsx
import UserHeader from '@/components/UserHeader'

export default function Page() {
  return (
    <div>
      <UserHeader />
      {/* Your content */}
    </div>
  )
}
```

---

### 2. **SearchDoctor Component**
📁 `components/SearchDoctor.js`

Component สำหรับค้นหาแพทย์แบบ real-time

**Features:**
- 🔍 ค้นหาจาก Supabase doctors table
- 🎯 Search by: name, specialty, symptoms
- ⚡ Debounced search (300ms)
- 📋 Results dropdown with doctor info
- 🔗 Click to view doctor profile or book appointment
- 🌐 Multi-language support

**Database Query:**
ค้นหาจากฟิลด์: `full_name`, `name_th`, `name_en`, `specialty_th`, `specialty_en`, `specialization`

**Usage:**
```jsx
import SearchDoctor from '@/components/SearchDoctor'

<SearchDoctor />
```

---

### 3. **NotificationDropdown Component**
📁 `components/NotificationDropdown.js`

Notification system with real-time updates

**Features:**
- 🔔 Unread count badge
- 📬 Dropdown with recent notifications
- ✅ Mark as read functionality
- 🔗 Navigate to related pages on click
- 🕐 Time ago formatting

**Required Database Table:**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT, -- 'appointment', 'test_result', 'message'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB, -- { appointment_id, doctor_id, etc. }
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Usage:**
```jsx
import NotificationDropdown from '@/components/NotificationDropdown'

<NotificationDropdown userId={user.id} />
```

---

### 4. **MedicalChatbot Component**
📁 `components/MedicalChatbot.js`

AI-powered chatbot for symptom checking

**Features:**
- 🤖 AI recommendations based on symptoms
- 💬 Conversation history
- 🏥 Doctor recommendations
- 🌐 Thai/English support
- 🎨 Minimizable floating window
- ⚡ Real-time responses

**API Route:**
📁 `app/api/chatbot/route.js`

**Setup for Production:**
1. Install OpenAI package:
   ```bash
   npm install openai
   ```

2. Add API key to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

3. Uncomment OpenAI code in `app/api/chatbot/route.js`

**Current Implementation:**
- ใช้ rule-based system สำหรับ demo
- Match keywords กับ specialties
- Query doctors จาก Supabase

**Usage:**
```jsx
import MedicalChatbot from '@/components/MedicalChatbot'

// Place at end of your page (floating)
<MedicalChatbot />
```

---

### 5. **Translation System**
📁 `hooks/useTranslation.js` + `lib/translations.js`

ระบบแปลภาษาไทย-อังกฤษ

**Features:**
- 🌐 Toggle between TH/EN
- 💾 Save preference in localStorage
- 🎯 Path-based translation keys

**Usage:**
```jsx
import { useTranslation } from '@/hooks/useTranslation'

export default function Component() {
  const { t, language, toggleLanguage } = useTranslation()

  return (
    <div>
      <h1>{t('header.searchPlaceholder')}</h1>
      <button onClick={toggleLanguage}>
        {language === 'th' ? 'EN' : 'TH'}
      </button>
    </div>
  )
}
```

**Add New Translations:**
Edit `lib/translations.js`:
```js
export const translations = {
  mySection: {
    myKey: {
      th: 'ข้อความไทย',
      en: 'English text',
    },
  },
}

// Use: t('mySection.myKey')
```

---

## 🗄️ Database Requirements

### Required Tables:

1. **doctors** (already exists)
   - `id`, `user_id`, `full_name`, `name_th`, `name_en`
   - `specialty_th`, `specialty_en`, `specialization`
   - `hospital_branch`, `available_days`

2. **notifications** (need to create)
   ```sql
   CREATE TABLE notifications (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     type TEXT NOT NULL,
     title TEXT NOT NULL,
     message TEXT NOT NULL,
     is_read BOOLEAN DEFAULT FALSE,
     metadata JSONB,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE INDEX idx_notifications_user ON notifications(user_id);
   CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
   ```

3. **appointments** (already exists)
   - Used for loading upcoming appointments

---

## 🎨 Styling

ใช้ **Tailwind CSS** ทั้งหมด

**Color Scheme:**
- Primary: `blue-500`, `blue-600`
- Success: `green-500`
- Warning: `orange-500`
- Danger: `red-500`

**Common Classes:**
- Buttons: `rounded-lg`, `hover:shadow-md`, `transition-all`
- Cards: `rounded-xl`, `shadow-sm`, `border`
- Inputs: `rounded-full`, `focus:border-blue-500`

---

## 🚀 Installation

1. **ติดตั้ง dependencies ที่จำเป็น:**
   ```bash
   npm install lucide-react  # Already installed
   npm install openai        # For production chatbot (optional)
   ```

2. **สร้างตาราง notifications:**
   - ไปที่ Supabase Dashboard → SQL Editor
   - Run SQL script ด้านบน

3. **ตั้งค่า .env.local:**
   ```bash
   cp .env.example .env.local
   # แก้ไขค่า OPENAI_API_KEY (ถ้าต้องการใช้ AI จริง)
   ```

4. **Update Dashboard:**
   - Dashboard ใหม่อยู่ที่ `app/dashboard/page.js` แล้ว
   - ใช้ `UserHeader` และ `MedicalChatbot`

---

## 📱 Responsive Design

**Breakpoints:**
- Mobile: `< 768px` - Hamburger menu, stacked layout
- Tablet: `768px - 1024px` - 2 columns
- Desktop: `> 1024px` - Full header with all features

**Mobile Features:**
- Hamburger menu
- Full-width search
- Bottom navigation (optional)
- Collapsible chatbot

---

## 🔒 Security Notes

1. **API Routes:**
   - ตรวจสอบ authentication ทุกครั้ง
   - Validate input จาก users
   - Rate limiting สำหรับ chatbot API

2. **Supabase:**
   - Enable RLS (Row Level Security)
   - ตรวจสอบ permissions

3. **OpenAI:**
   - เก็บ API key ใน environment variables
   - ห้าม expose ใน client-side code
   - Set usage limits

---

## 🐛 Troubleshooting

### Search ไม่ทำงาน:
- ตรวจสอบว่ามีข้อมูลใน `doctors` table
- เช็ค Supabase connection
- ดู console errors

### Chatbot error:
- ถ้ายังไม่มี OpenAI key → ใช้ rule-based system (default)
- ถ้ามี error 429 → API quota exceeded
- ถ้ามี error 500 → check API route logs

### Translation ไม่เปลี่ยน:
- localStorage อาจ cached → clear browser data
- ตรวจสอบว่า key ใน `translations.js` ถูกต้อง

### Notifications ไม่แสดง:
- สร้างตาราง `notifications` ใน Supabase
- เช็ค RLS policies
- ตรวจสอบ `user_id` FK

---

## 📚 Next Steps

1. **Implement Appointment Booking:**
   - สร้างหน้า `/dashboard/appointments/new`
   - Form สำหรับเลือกแพทย์ + เวลา
   - Integration กับ `doctor_available_times` table

2. **Medical Records:**
   - Upload files to Supabase Storage
   - Display history
   - Download/preview files

3. **Real-time Notifications:**
   - Supabase Realtime subscriptions
   - Push notifications (optional)

4. **Payment Integration:**
   - Stripe/Omise for appointment fees
   - QR code payment (PromptPay)

---

## 🎯 Component Checklist

✅ UserHeader - Fully functional
✅ SearchDoctor - With Supabase integration
✅ NotificationDropdown - Database ready
✅ MedicalChatbot - Rule-based (upgradable to AI)
✅ Translation System - TH/EN support
✅ Dashboard Integration - Updated
✅ Mobile Responsive - All breakpoints
✅ Error Handling - Loading states

---

**Created by:** Claude Code
**Date:** 2025-11-15
**Version:** 1.0.0
**Next.js:** 14.0.4
**React:** 18.2.0
