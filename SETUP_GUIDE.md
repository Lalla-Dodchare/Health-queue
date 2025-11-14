# Health Queue - Setup Guide (Updated - ใช้ Supabase Auth จริง)

## ⚠️ สำคัญ: การใช้งาน Supabase ที่ถูกต้อง

ระบบนี้ใช้ **Supabase Auth** อย่างถูกต้อง **ไม่ใช่** custom authentication ที่เก็บ password ใน public.profiles

### สถาปัตยกรรมที่ถูกต้อง:

1. **Authentication**: ใช้ `auth.users` ของ Supabase (ไม่เก็บ password ใน public.profiles)
2. **Profiles**: ตาราง `public.profiles` เชื่อมโยงกับ `auth.users` แบบ 1:1 ผ่าน `id`
3. **Roles**: ตรวจสอบจากตาราง `admins` และ `doctors`:
   - มี row ใน `admins` → Admin
   - มี row ใน `doctors` → Doctor
   - ไม่มีทั้งสอง → User ทั่วไป

## 🗄️ โครงสร้าง Database (Design B - Corrected)

### ⚠️ สำคัญ: auth.users เป็น Single Source of Truth

```
auth.users                    ← PRIMARY IDENTITY (email/password)
  ↓ (FK: id)
  ├── public.profiles        ← Optional metadata (full_name, phone, etc.)
  ├── public.admins          ← user_id FK → auth.users.id (Admin role)
  └── public.doctors         ← user_id FK → auth.users.id (Doctor role)

appointments                 ← ข้อมูลนัดหมาย
appointment_events           ← Event logs
appointment_queue_counters   ← Queue management
doctor_available_times       ← ตารางเวลาว่างของแพทย์
branches                     ← สาขาโรงพยาบาล
departments                  ← แผนก
notifications                ← การแจ้งเตือน
v_doctor_today_queue        ← View สำหรับคิววันนี้
```

### Design Principles:

1. **Identity = auth.users** (single source of truth)
2. **Metadata = profiles** (optional - ไม่มีก็ใช้งานได้)
3. **Roles = admins/doctors** (FK ชี้ไปที่ auth.users.id โดยตรง)

## 🚀 การตั้งค่าเริ่มต้น

### 0. **ก่อนอื่น - รัน Database Migration!**

**⚠️ สำคัญมาก:** ต้องรัน migration ก่อนเพื่อแก้ไข FK ของ admins/doctors

1. ไปที่ Supabase Dashboard → **SQL Editor**
2. เปิดไฟล์ [database-migration.sql](database-migration.sql)
3. Copy ทั้งหมดแล้ว Paste ใน SQL Editor
4. กด **Run**
5. ตรวจสอบว่า FK ถูกต้อง:
   - `admins.user_id` → `auth.users.id` ✅
   - `doctors.user_id` → `auth.users.id` ✅
   - `profiles.id` → `auth.users.id` ✅

### 1. สร้าง Test Users ด้วยหน้า Register

**ไม่ต้องสร้างใน Supabase Dashboard แล้ว!** ใช้หน้า Register แทน:

1. ไปที่ http://localhost:3001/register
2. สมัครสมาชิก:
   ```
   ชื่อ-นามสกุล: ผู้ใช้ทดสอบ
   อีเมล: user@test.com
   รหัสผ่าน: password123
   ```
3. ระบบจะสร้าง user ใน `auth.users` และ `profiles` อัตโนมัติ

### 2. เพิ่มข้อมูลใน admins/doctors tables (ถ้าต้องการ)

หลังจากสมัครสมาชิกแล้ว ถ้าต้องการให้เป็น Admin/Doctor:

```sql
-- หา user_id ของ user@test.com
SELECT id, email FROM auth.users WHERE email = 'user@test.com';

-- เพิ่มใน admins table (ใช้ id จาก auth.users)
INSERT INTO admins (user_id, created_at)
VALUES ('uuid-จาก-auth-users', NOW());

-- หรือ เพิ่มใน doctors table
INSERT INTO doctors (user_id, full_name, specialization, created_at)
VALUES ('uuid-จาก-auth-users', 'นพ.ทดสอบ', 'ทั่วไป', NOW());
```

**หมายเหตุ**:
- User ที่ไม่มีข้อมูลใน `admins` หรือ `doctors` = User ทั่วไป (default)
- `user_id` ต้องชี้ไปที่ `auth.users.id` (ไม่ใช่ `profiles.id`)

### 3. ตรวจสอบไฟล์ `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. รันโปรเจค

```bash
npm install
npm run dev
```

เปิดที่: **http://localhost:3001**

## 🔐 การเข้าสู่ระบบ

### ขั้นตอน:

1. ไปที่ http://localhost:3001/login
2. กรอก Email และ Password
3. ระบบจะตรวจสอบ role อัตโนมัติจาก database
4. Redirect ไปหน้าที่เหมาะสม:
   - Admin → `/admin/dashboard`
   - Doctor → `/doctor/dashboard`
   - User → `/dashboard`

**ไม่ต้องเลือก Role** - ระบบจะตรวจสอบจาก `admins` และ `doctors` tables เอง

## 📝 วิธีการทำงานของ Authentication

### Flow:

```
1. User กรอก email/password
   ↓
2. เรียก supabase.auth.signInWithPassword()
   ↓
3. Supabase Auth ตรวจสอบ credentials
   ↓
4. สร้าง session (เก็บใน localStorage)
   ↓
5. Query admins/doctors tables
   ↓
6. ตรวจสอบ role:
   - มี row ใน admins? → role = "admin"
   - มี row ใน doctors? → role = "doctor"
   - ไม่มีทั้งสอง → role = "user"
   ↓
7. Redirect ตาม role
```

### ไฟล์สำคัญ:

**[lib/auth.js](lib/auth.js)**:
- `loginWithEmail()` - Login ด้วย Supabase Auth
- `getUserRole()` - ตรวจสอบ role จาก admins/doctors
- `getCurrentUser()` - ดึงข้อมูล user จาก session
- `logout()` - Logout และ clear session

**[lib/supabase.js](lib/supabase.js)**:
- Supabase client สำหรับ browser
- มี `persistSession: true` เก็บ session ใน localStorage

**[app/login/page.js](app/login/page.js)**:
- หน้า login (ไม่มี role selector)
- เรียก `loginWithEmail()` และ redirect อัตโนมัติ

**[app/dashboard/page.js](app/dashboard/page.js)**:
- User dashboard
- ตรวจสอบ Supabase session
- ถ้า role ไม่ใช่ user → redirect

## 🎨 Features ที่สร้างแล้ว

- ✅ Supabase Auth (auth.users) สำหรับ credentials
- ✅ Auto-detect role จาก admins/doctors tables
- ✅ Session management ด้วย Supabase
- ✅ Login page (ไม่มี role selector)
- ✅ User Dashboard
- ✅ Admin Dashboard
- ✅ Doctor Dashboard
- ✅ Logout functionality
- ✅ Protected routes with session check

## 📋 TODO: Features ยังไม่ได้ทำ

- [ ] Registration Page (ใช้ `supabase.auth.signUp()`)
- [ ] Appointment Booking (ใช้ตาราง appointments + doctor_available_times)
- [ ] Doctor Management CRUD (ดึงจาก doctors table)
- [ ] Queue Management (ใช้ appointment_queue_counters)
- [ ] Medical Records Upload
- [ ] Profile Editing
- [ ] Password Reset
- [ ] Email Verification
- [ ] RLS (Row Level Security) policies

## 🔐 Security Best Practices

### 1. RLS (Row Level Security)

ในอนาคตควรเปิด RLS สำหรับทุกตาราง:

```sql
-- Example RLS policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

### 2. Server-side Validation

สำหรับ admin/doctor operations ควร check role ที่ server:

```javascript
// API Route example
const { data: { user } } = await supabase.auth.getUser()
const role = await getUserRole(user.id)

if (role !== 'admin') {
  return new Response('Unauthorized', { status: 403 })
}
```

### 3. ห้ามพึ่งพา localStorage อย่างเดียว

- localStorage เป็นแค่ UI hint
- ต้องตรวจสอบ Supabase session ทุกครั้ง
- API Routes ต้อง validate JWT token

## 🔧 การพัฒนาต่อ

### เพิ่มฟีเจอร์ Appointment Booking:

1. สร้างหน้า `/dashboard/appointments/new`
2. ดึงรายชื่อแพทย์จาก `doctors` table
3. ดึงเวลาว่างจาก `doctor_available_times`
4. สร้าง appointment ใน `appointments` table
5. อัพเดท `appointment_queue_counters`

### เพิ่ม Registration:

```javascript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: fullName,
    },
  },
})

// Supabase จะสร้าง row ใน auth.users และ profiles อัตโนมัติ
// (ถ้าตั้งค่า trigger ไว้)
```

## ⚠️ สิ่งที่ควรระวัง

1. **อย่าสร้างตาราง profiles ใหม่** - ใช้ตารางที่มีอยู่แล้ว
2. **อย่าเก็บ password ใน public.profiles** - ให้ Supabase Auth จัดการ
3. **อย่า INSERT ใน profiles โดยตรง** - ใช้ `auth.signUp()` แทน
4. **Role ต้องดูจาก admins/doctors** - ไม่ใช่ profiles.role column
5. **ตรวจสอบ session ทุกครั้ง** - ไม่พึ่งพา localStorage

## 🎯 Next Steps

1. ✅ ทดสอบ Login/Logout ทุก role
2. ✅ สร้าง test users ใน Supabase Dashboard
3. 🔜 เพิ่มข้อมูลใน admins/doctors tables
4. 🔜 พัฒนาฟีเจอร์ Appointment Booking
5. 🔜 เปิด RLS policies
6. 🔜 เพิ่ม Server-side API Routes

---

**Note สำหรับ AI ตัวถัดไป**: โปรดอ่านไฟล์นี้ทั้งหมดก่อนแก้ไขระบบ Authentication เพราะมีหลายจุดที่ต้องระวังไม่ให้ทำลายโครงสร้างที่ถูกต้อง
