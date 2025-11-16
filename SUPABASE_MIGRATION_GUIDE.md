# คู่มือการอัพเดท Supabase Database Schema
# Supabase Migration Guide for Profile System

## 🎯 สรุปปัญหาที่พบ (Problem Summary)

จากการตรวจสอบระบบโปรไฟล์ พบปัญหาดังนี้:

1. **อีเมลไม่ซิงค์กัน** - อีเมลแสดงในเว็บแต่ใน Supabase เป็น NULL
2. **เพศไม่มีในฟอร์ม** - ใน Supabase มีคอลัมน์ gender แต่ในเว็บไม่มีให้เลือก
3. **กรุ๊ปเลือดไม่จำเป็น** - โรงพยาบาลในไทยไม่ค่อยใช้ (เอาออกแล้ว ✓)
4. **อาการแพ้ยังไม่มีที่เก็บ** - ใน Supabase ยังไม่มีคอลัมน์ allergies
5. **ผู้ติดต่อฉุกเฉินยังไม่มีที่เก็บ** - ใน Supabase ยังไม่มีคอลัมน์สำหรับเก็บข้อมูลนี้

---

## 🔧 สิ่งที่ได้แก้ไขในโค้ดแล้ว (Code Changes Already Made)

### ✅ ไฟล์ที่อัพเดทแล้ว:
- `app/dashboard/profile/page.js` - เพิ่มฟิลด์ gender, เอา blood_type ออก, อัพเดทฟังก์ชัน save

### ✅ การเปลี่ยนแปลง:
1. **เพิ่มฟิลด์เพศ (Gender)** - มี dropdown ให้เลือก ชาย/หญิง/อื่นๆ
2. **เอากรุ๊ปเลือดออก** - ไม่แสดงในฟอร์มอีกต่อไป
3. **ปรับฟังก์ชัน save** - บันทึกข้อมูลทั้งหมดรวม email, gender, allergies, emergency contacts

---

## 📋 SQL Commands ที่ต้องรันใน Supabase

### วิธีรัน SQL ใน Supabase:
1. เข้า **Supabase Dashboard** → เลือก Project ของคุณ
2. ไปที่ **SQL Editor** (เมนูด้านซ้าย)
3. คลิก **New Query**
4. วาง SQL commands ด้านล่างนี้
5. คลิก **Run** หรือกด `Ctrl+Enter`

---

### 🔹 SQL Command 1: เพิ่มคอลัมน์ที่ขาด

```sql
-- เพิ่มคอลัมน์อาการแพ้ยา/อาหาร (allergies)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS allergies TEXT;

-- เพิ่มคอลัมน์ชื่อผู้ติดต่อฉุกเฉิน
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;

-- เพิ่มคอลัมน์เบอร์โทรผู้ติดต่อฉุกเฉิน
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- เพิ่มคอลัมน์การตั้งค่าการแจ้งเตือน (notification preferences)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB
DEFAULT '{"email_notifications": true, "sms_notifications": false, "appointment_reminders": true, "health_tips": false}'::jsonb;

-- สร้าง index สำหรับ email เพื่อเพิ่มความเร็วในการค้นหา
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
```

---

### 🔹 SQL Command 2: ตรวจสอบโครงสร้างตาราง

```sql
-- ดูโครงสร้างตาราง profiles ทั้งหมด
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

---

### 🔹 SQL Command 3: ตรวจสอบข้อมูลที่มี email เป็น NULL

```sql
-- ดูรายการผู้ใช้ที่ email เป็น NULL
SELECT id, full_name, email, phone, created_at
FROM profiles
WHERE email IS NULL;
```

---

## 🔍 การแก้ปัญหาอีเมลที่เป็น NULL

### สาเหตุที่เป็นไปได้:
1. **ระบบสมัครสมาชิกไม่ได้บันทึก email ลง profiles**
2. **RLS Policy บล็อกการ UPDATE**
3. **ข้อมูลอยู่ใน auth.users แต่ไม่ได้ sync มาที่ profiles**

### วิธีแก้:

#### Option 1: Sync email จาก auth.users มาที่ profiles (แนะนำ)

```sql
-- Update email ในตาราง profiles ให้ตรงกับตาราง auth.users
UPDATE profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.id = auth.users.id
  AND profiles.email IS NULL;
```

#### Option 2: สร้าง Trigger ให้ sync อัตโนมัติ

```sql
-- สร้างฟังก์ชันสำหรับ sync email
CREATE OR REPLACE FUNCTION sync_email_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- เมื่อมีการสร้าง user ใหม่ใน auth.users
  -- ให้ insert ข้อมูลเข้า profiles ด้วย
  INSERT INTO profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id)
  DO UPDATE SET email = NEW.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- สร้าง trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_email_to_profile();
```

---

## ✅ Checklist หลังรัน SQL

หลังจากรัน SQL commands แล้ว ให้ตรวจสอบ:

- [ ] คอลัมน์ `allergies` ถูกเพิ่มแล้ว
- [ ] คอลัมน์ `emergency_contact_name` ถูกเพิ่มแล้ว
- [ ] คอลัมน์ `emergency_contact_phone` ถูกเพิ่มแล้ว
- [ ] คอลัมน์ `notification_preferences` ถูกเพิ่มแล้ว
- [ ] email ทุกแถวไม่เป็น NULL
- [ ] ลองแก้ไขโปรไฟล์ในเว็บดูว่าบันทึกได้
- [ ] ลองเลือกเพศในฟอร์มดูว่าบันทึกได้

---

## 🚀 ทดสอบหลังอัพเดท

1. **รีสตาร์ทเซิร์ฟเวอร์**
   ```bash
   npm run dev
   ```

2. **เข้าหน้าโปรไฟล์** → [http://localhost:3001/dashboard/profile](http://localhost:3001/dashboard/profile)

3. **ทดสอบแก้ไขข้อมูล**:
   - ✅ ชื่อ-นามสกุล
   - ✅ เบอร์โทร
   - ✅ วันเกิด
   - ✅ **เพศ (ใหม่!)**
   - ✅ ที่อยู่
   - ✅ **อาการแพ้ (ใหม่!)**
   - ✅ **ผู้ติดต่อฉุกเฉิน (ใหม่!)**

4. **ตรวจสอบใน Supabase Dashboard**
   - ไปที่ **Table Editor** → `profiles`
   - ตรวจสอบว่าข้อมูลที่แก้ไขถูกบันทึกจริง
   - ตรวจสอบว่า email ไม่เป็น NULL

---

## 📊 โครงสร้างตาราง profiles หลังอัพเดท

| Column Name                  | Type      | Nullable | Description                           |
|------------------------------|-----------|----------|---------------------------------------|
| id                           | UUID      | No       | Primary Key (ผูกกับ auth.users)       |
| full_name                    | TEXT      | Yes      | ชื่อ-นามสกุล                          |
| email                        | TEXT      | Yes      | อีเมล (ซิงค์จาก auth.users)           |
| phone                        | TEXT      | Yes      | เบอร์โทร                              |
| date_of_birth                | DATE      | Yes      | วันเกิด                               |
| gender                       | TEXT      | Yes      | เพศ (male/female/other)               |
| address                      | TEXT      | Yes      | ที่อยู่                               |
| allergies                    | TEXT      | Yes      | **อาการแพ้ยา/อาหาร (ใหม่!)**          |
| emergency_contact_name       | TEXT      | Yes      | **ชื่อผู้ติดต่อฉุกเฉิน (ใหม่!)**      |
| emergency_contact_phone      | TEXT      | Yes      | **เบอร์ผู้ติดต่อฉุกเฉิน (ใหม่!)**    |
| notification_preferences     | JSONB     | Yes      | **การตั้งค่าการแจ้งเตือน (ใหม่!)**     |
| role                         | TEXT      | Yes      | บทบาท (user/doctor/admin)             |
| points                       | INTEGER   | Yes      | คะแนนสะสม                             |
| created_at                   | TIMESTAMP | Yes      | วันที่สร้าง                           |
| updated_at                   | TIMESTAMP | Yes      | วันที่อัพเดทล่าสุด                    |

---

## 🐛 หากพบปัญหา

### ปัญหา: RLS Policy บล็อกการ UPDATE
**วิธีแก้**: ตรวจสอบ RLS Policy

```sql
-- ดู RLS policies ทั้งหมดของตาราง profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';
```

หากไม่มี Policy สำหรับ UPDATE ให้สร้าง:

```sql
-- อนุญาตให้ user อัพเดทข้อมูลของตัวเองได้
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### ปัญหา: Column ไม่ถูกสร้าง
**วิธีแก้**: ตรวจสอบว่ามี permission ในการแก้ไข schema

```sql
-- ตรวจสอบสิทธิ์
SELECT has_table_privilege('profiles', 'UPDATE');
```

---

## 📞 ติดต่อ Support

หากมีปัญหาหรือข้อสงสัย:
1. ตรวจสอบ Console ใน Browser (F12) → Console tab
2. ตรวจสอบ Logs ใน Supabase Dashboard → Logs
3. อ่าน Error message ที่แสดงในหน้าเว็บ

---

## ✨ สรุป

**ก่อนรัน SQL:**
- ❌ อีเมลเป็น NULL
- ❌ ไม่มีที่เก็บอาการแพ้
- ❌ ไม่มีที่เก็บผู้ติดต่อฉุกเฉิน
- ❌ ไม่มีฟิลด์เพศในฟอร์ม

**หลังรัน SQL:**
- ✅ อีเมลซิงค์จาก auth.users
- ✅ มีคอลัมน์ allergies
- ✅ มีคอลัมน์ emergency contacts
- ✅ มีคอลัมน์ notification_preferences
- ✅ ฟอร์มมีฟิลด์เพศให้เลือก
- ✅ ไม่มีฟิลด์กรุ๊ปเลือดอีกต่อไป

**โค้ดที่อัพเดทแล้ว:**
- ✅ [app/dashboard/profile/page.js](app/dashboard/profile/page.js) - ฟอร์มโปรไฟล์ใหม่
- ✅ ฟังก์ชัน handleSaveProfile บันทึกข้อมูลครบทุกฟิลด์
- ✅ เพิ่ม error logging เพื่อ debug ง่ายขึ้น

---

**🎯 Next Step: รัน SQL commands ด้านบน แล้วทดสอบระบบ!**
