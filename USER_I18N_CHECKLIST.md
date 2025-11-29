# 🌍 User i18n Audit Checklist

## วัตถุประสงค์
ตรวจสอบและแก้ไขปัญหา i18n (next-intl) ในส่วน User ทุกภาษา (TH, EN, JA, KO, ZH, RU, HI)

## ปัญหาที่พบ
- ข้อความแสดงเป็น key แทนที่จะเป็นข้อความจริง เช่น "profiles.ac102" แทน "นพ.สุทธิพง"
- Missing translation keys
- Hardcoded text ที่ไม่ได้ใช้ i18n

---

## 📋 ไฟล์ที่ต้องอ่านและตรวจสอบ

### 1️⃣ เอกสารพื้นฐาน (3 ไฟล์)

```
✅ DATABASE_SCHEMA.md   - เข้าใจโครงสร้างข้อมูล
✅ .env.local           - Configuration
✅ package.json         - ดู next-intl version
```

---

### 2️⃣ ไฟล์ภาษา (Translation Files) - 7 ภาษา

```
✅ messages/th.json     - ภาษาไทย (หลัก)
✅ messages/en.json     - ภาษาอังกฤษ
✅ messages/ja.json     - ภาษาญี่ปุ่น
✅ messages/ko.json     - ภาษาเกาหลี
✅ messages/zh.json     - ภาษาจีน
✅ messages/ru.json     - ภาษารัสเซีย
✅ messages/hi.json     - ภาษาฮินดี
```

**สิ่งที่ต้องเช็ค:**
- ทุก key ใน th.json ต้องมีใน 6 ภาษาอื่น
- ไม่มี key ที่ซ้ำกัน
- ไม่มี key ที่ไม่ได้ใช้งาน
- format ถูกต้อง (valid JSON)

---

### 3️⃣ Config i18n (2 ไฟล์)

```
✅ app/[locale]/layout.js   - Layout หลัก + locale setup
✅ next.config.js           - next-intl configuration
```

**สิ่งที่ต้องเช็ค:**
- `NextIntlClientProvider` ครอบทุกหน้า
- `locale` parameter ถูกส่งถูกต้อง
- Default locale = 'th'
- Supported locales = ['th', 'en', 'ja', 'ko', 'zh', 'ru', 'hi']

---

### 4️⃣ หน้าฝั่ง User (User Pages) - 15 หน้า

#### Authentication
```
✅ app/[locale]/login/page.js
```

#### Dashboard
```
✅ app/[locale]/dashboard/page.js
✅ app/[locale]/dashboard/profile/page.js
```

#### Appointments
```
✅ app/[locale]/dashboard/appointments/page.js
✅ app/[locale]/dashboard/appointments/[id]/page.js
```

#### Booking Flow (4 Steps)
```
✅ app/[locale]/dashboard/book-appointment/page.js
✅ app/[locale]/dashboard/book-appointment/step-1/page.js
✅ app/[locale]/dashboard/book-appointment/step-2/page.js
✅ app/[locale]/dashboard/book-appointment/step-3/page.js
✅ app/[locale]/dashboard/book-appointment/step-4/page.js
```

#### Doctors & Branches
```
✅ app/[locale]/dashboard/doctors/page.js
✅ app/[locale]/dashboard/doctors/[id]/page.js
✅ app/[locale]/dashboard/branches/page.js
```

#### Other Pages
```
✅ app/[locale]/dashboard/medical-history/page.js
✅ app/[locale]/dashboard/articles/page.js
✅ app/[locale]/dashboard/packages/page.js (ถ้ามี)
```

**สิ่งที่ต้องเช็คในแต่ละหน้า:**
1. มี `const t = useTranslations()` หรือ `const t = useTranslations('namespace')`
2. ข้อความทุกอันใช้ `t('key')` ไม่มี hardcoded text
3. ชื่อจาก database ไม่ควรผ่าน i18n (เช่น ชื่อหมอ, ชื่อสาขา)
4. Labels, placeholders, buttons ต้องใช้ i18n ทั้งหมด
5. Error messages ใช้ i18n
6. Success messages ใช้ i18n

---

### 5️⃣ Components ฝั่ง User - 15 Components

#### Header & Footer
```
✅ components/UserHeader.js
✅ components/UserFooter.js
✅ components/Footer.js
```

#### Notifications
```
✅ components/NotificationBell.js
✅ components/NotificationDropdown.js
```

#### UI Components
```
✅ components/LanguageSelector.js
✅ components/SearchDoctor.js
✅ components/DatePicker.js
✅ components/TimePicker.js
```

#### Doctor Related
```
✅ components/FavoriteButton.js
✅ components/DoctorReviews.js
✅ components/DoctorReviewModal.js
```

#### Appointment
```
✅ components/AppointmentActions.js
```

#### Chat
```
✅ components/AdminMessaging.js
✅ components/MedicalChatbot.js
✅ components/UnifiedChatbot.js
```

**สิ่งที่ต้องเช็คในแต่ละ Component:**
1. Import `useTranslations` จาก 'next-intl'
2. ข้อความทุกอันใช้ `t('key')`
3. Props ที่เป็นข้อความควรรับ translation key มาแทน
4. ไม่มี hardcoded text

---

## 🔍 วิธีการตรวจสอบ

### Step 1: เช็ค Translation Files
```bash
# ดู structure ของ th.json
cat messages/th.json | jq 'keys'

# เปรียบเทียบ keys ระหว่างภาษา
diff <(jq -S 'keys' messages/th.json) <(jq -S 'keys' messages/en.json)
```

### Step 2: ค้นหา Hardcoded Text
```bash
# ค้นหาข้อความไทยที่ไม่ได้ใช้ i18n
grep -r "วัน\|เวลา\|นัด\|แพทย์\|โรงพยาบาล" app/[locale]/dashboard --include="*.js"

# ค้นหา Component ที่ไม่มี useTranslations
grep -L "useTranslations" components/*.js
```

### Step 3: ทดสอบแต่ละภาษา
```bash
# เปิด browser และเปลี่ยนภาษาทีละภาษา
# ตรวจสอบว่าข้อความแสดงผลถูกต้อง ไม่มี key แทน
```

---

## ✅ Checklist การแก้ไข

### Translation Files
- [ ] ทุก key ใน th.json มีครบใน 6 ภาษาอื่น
- [ ] ไม่มี duplicate keys
- [ ] ไม่มี unused keys
- [ ] JSON format ถูกต้อง (valid)
- [ ] ใช้ nested structure ที่เหมาะสม (เช่น `dashboard.title`, `booking.step1.title`)

### Pages
- [ ] Login page - ใช้ i18n ทุกข้อความ
- [ ] Dashboard page - ใช้ i18n ทุกข้อความ
- [ ] Profile page - ใช้ i18n ทุกข้อความ
- [ ] Appointments list - ใช้ i18n ทุกข้อความ
- [ ] Appointment detail - ใช้ i18n ทุกข้อความ
- [ ] Booking step 1-4 - ใช้ i18n ทุกข้อความ
- [ ] Doctors list - ใช้ i18n ทุกข้อความ
- [ ] Doctor detail - ใช้ i18n ทุกข้อความ
- [ ] Branches page - ใช้ i18n ทุกข้อความ
- [ ] Medical history - ใช้ i18n ทุกข้อความ
- [ ] Articles page - ใช้ i18n ทุกข้อความ

### Components
- [ ] UserHeader - ใช้ i18n
- [ ] UserFooter - ใช้ i18n
- [ ] NotificationBell - ใช้ i18n
- [ ] NotificationDropdown - ใช้ i18n
- [ ] LanguageSelector - ใช้ i18n
- [ ] SearchDoctor - ใช้ i18n
- [ ] DatePicker - ใช้ i18n
- [ ] TimePicker - ใช้ i18n
- [ ] FavoriteButton - ใช้ i18n
- [ ] DoctorReviews - ใช้ i18n
- [ ] DoctorReviewModal - ใช้ i18n
- [ ] AppointmentActions - ใช้ i18n
- [ ] AdminMessaging - ใช้ i18n
- [ ] MedicalChatbot - ใช้ i18n
- [ ] UnifiedChatbot - ใช้ i18n

### Testing
- [ ] ทดสอบภาษาไทย (th)
- [ ] ทดสอบภาษาอังกฤษ (en)
- [ ] ทดสอบภาษาญี่ปุ่น (ja)
- [ ] ทดสอบภาษาเกาหลี (ko)
- [ ] ทดสอบภาษาจีน (zh)
- [ ] ทดสอบภาษารัสเซีย (ru)
- [ ] ทดสอบภาษาฮินดี (hi)

---

## 🎯 ตัวอย่างปัญหาที่พบบ่อย

### ❌ ผิด: Hardcoded Text
```javascript
<h1>ยินดีต้อนรับ</h1>
<button>จองนัดหมาย</button>
```

### ✅ ถูก: ใช้ i18n
```javascript
const t = useTranslations('dashboard')

<h1>{t('welcome')}</h1>
<button>{t('bookAppointment')}</button>
```

---

### ❌ ผิด: แสดง Database Data ผ่าน i18n
```javascript
// ❌ ไม่ควรทำ - ชื่อหมอจาก database ไม่ควนผ่าน t()
<h2>{t(doctor.name)}</h2>
```

### ✅ ถูก: แสดง Database Data โดยตรง
```javascript
// ✅ ถูกต้อง - แสดงชื่อหมอโดยตรง
<h2>{doctor.name}</h2>

// Label ใช้ i18n
<label>{t('doctorName')}</label>
```

---

### ❌ ผิด: Missing Translation Key
```javascript
// ถ้า key ไม่มีใน messages/th.json
t('nonExistentKey') // จะแสดง "nonExistentKey" แทน
```

### ✅ ถูก: เพิ่ม Key ใน Translation Files
```json
// messages/th.json
{
  "dashboard": {
    "welcome": "ยินดีต้อนรับ",
    "bookAppointment": "จองนัดหมาย"
  }
}

// messages/en.json
{
  "dashboard": {
    "welcome": "Welcome",
    "bookAppointment": "Book Appointment"
  }
}
```

---

## 🚀 แนวทางการแก้ไข

1. **อ่านไฟล์ทั้งหมดในรายการ**
2. **สร้าง mapping ของ translation keys ที่ใช้จริง**
3. **เปรียบเทียบกับ messages/*.json**
4. **เพิ่ม missing keys**
5. **ลบ unused keys**
6. **แก้ hardcoded text ให้ใช้ t()**
7. **ทดสอบทุกภาษา**

---

## 📝 หมายเหตุ

- ชื่อจาก database (ชื่อหมอ, สาขา, แผนก) ไม่ควรผ่าน i18n
- Labels, buttons, messages ต้องใช้ i18n ทั้งหมด
- ใช้ nested structure ใน JSON เพื่อจัดกลุ่ม (เช่น `dashboard.title`, `booking.step1.title`)
- Default locale = 'th' (ภาษาไทย)
- หาก key ไม่มี จะแสดง key แทนข้อความ (เช่น "profiles.ac102")

---

**สร้างโดย:** Claude (สำหรับ Health Queue Project)
**วันที่:** 2025-01-28
**วัตถุประสงค์:** Audit และแก้ไขปัญหา i18n ในส่วน User ทุกภาษา
