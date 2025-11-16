# Health Queue - Messaging System Documentation

## 📬 สองระบบแชทที่แยกกัน

### 1. **MedicalChatbot** (AI Symptom Checker)
📁 `components/MedicalChatbot.js`

**วัตถุประสงค์:** ตรวจอาการเบื้องต้นและแนะนำแพทย์

**คุณสมบัติ:**
- 🤖 ใช้ OpenAI GPT-4 สำหรับวิเคราะห์อาการ
- 💬 **ไม่เก็บประวัติการสนทนา** (Ephemeral - ข้อความหายไปเมื่อปิด)
- 🏥 แนะนำแพทย์ที่เหมาะสมตามอาการ
- 🌐 รองรับไทย/อังกฤษ
- ⚡ Real-time response

**สีปุ่ม:** น้ำเงิน (Blue 500-700)
**ตำแหน่ง:** ลอยขวาล่าง (bottom: 6, right: 6)

---

### 2. **AdminMessaging** (Contact Admin)
📁 `components/AdminMessaging.js`

**วัตถุประสงค์:** แชทกับเจ้าหน้าที่/แอดมิน

**คุณสมบัติ:**
- 👤 แชทระหว่าง User ↔ Admin
- 💾 **เก็บข้อความ 60 วัน แล้วลบอัตโนมัติ**
- 🔔 Real-time notifications
- 📊 Unread count badge
- 🔒 Row Level Security (RLS)

**สีปุ่ม:** ม่วง (Purple 500-700)
**ตำแหน่ง:** ลอยขวาล่าง (bottom: 24, right: 6) - เหนือ MedicalChatbot

---

## 🗄️ Database Schema

### ตาราง: `admin_messages`

```sql
CREATE TABLE admin_messages (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id),
  sender_role TEXT CHECK (sender_role IN ('user', 'admin')),
  recipient_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 days')
);
```

**ฟิลด์สำคัญ:**
- `expires_at` - ตั้งค่าให้ข้อความหมดอายุหลัง 60 วัน
- `sender_role` - บอกว่าใครเป็นผู้ส่ง (user/admin)
- `is_read` - สถานะอ่านข้อความ
- `metadata` - สำหรับ file attachments (future)

---

## 🔐 Security (Row Level Security)

### Policies:

1. **Users can view own messages:**
   ```sql
   auth.uid() = sender_id OR auth.uid() = recipient_id
   ```

2. **Admins can view all messages:**
   ```sql
   EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
   ```

3. **Users can send messages:**
   ```sql
   auth.uid() = sender_id
   ```

4. **Admins can send messages:**
   ```sql
   EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
   ```

---

## 🔄 Auto-Delete System

### วิธีการลบข้อความอัตโนมัติ:

### Option A: Supabase Cron (ถ้ามี pg_cron extension)
```sql
SELECT cron.schedule(
  'delete-expired-messages',
  '0 2 * * *', -- รันทุก 2 โมงเช้า
  'SELECT delete_expired_admin_messages()'
);
```

### Option B: Supabase Edge Function
สร้าง Edge Function ที่ทำงานทุก 24 ชั่วโมง:

```javascript
// supabase/functions/cleanup-messages/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  const { error } = await supabase
    .from('admin_messages')
    .delete()
    .lt('expires_at', new Date().toISOString())

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }))
})
```

ตั้งค่า Cron ใน Supabase Dashboard:
```
0 2 * * * -- รันทุกวันเวลา 2 โมงเช้า
```

### Option C: Manual Cleanup (สำหรับ development)
```sql
-- รันใน SQL Editor เป็นครั้งคราว
DELETE FROM admin_messages
WHERE expires_at < NOW();
```

---

## 💬 OpenAI Integration

### Setup:

1. **รับ API Key:**
   - ไปที่: https://platform.openai.com/api-keys
   - สร้าง API key ใหม่
   - Copy key

2. **เพิ่มใน `.env.local`:**
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **ทดสอบ:**
   ```bash
   npm run dev
   # ไปที่ http://localhost:3001/dashboard
   # คลิกปุ่มสีน้ำเงิน (Chatbot)
   # พิมพ์ "ปวดหัว" หรือ "headache"
   ```

### API Route:
📁 `app/api/chatbot/route.js`

**Features:**
- ใช้ GPT-4 model
- System prompt แบบ medical assistant
- Temperature: 0.7
- Max tokens: 300
- Fallback ถ้า API ล้ม

**ราคา OpenAI:**
- GPT-4: ~$0.03 per 1000 tokens
- GPT-3.5-Turbo: ~$0.002 per 1000 tokens (ถูกกว่า)

ถ้าต้องการประหยัด แก้ model ใน code:
```javascript
model: 'gpt-3.5-turbo', // แทน 'gpt-4'
```

---

## 📱 Usage Examples

### ฝั่ง User:

```jsx
import MedicalChatbot from '@/components/MedicalChatbot'
import AdminMessaging from '@/components/AdminMessaging'

export default function Dashboard() {
  const user = getCurrentUser()

  return (
    <div>
      {/* Your dashboard content */}

      {/* AI Chatbot - No history */}
      <MedicalChatbot />

      {/* Admin Chat - 60 day retention */}
      <AdminMessaging userId={user.id} userRole="user" />
    </div>
  )
}
```

### ฝั่ง Admin:

```jsx
import AdminMessaging from '@/components/AdminMessaging'

export default function AdminDashboard() {
  const admin = getCurrentUser()

  return (
    <div>
      {/* Show all user conversations */}
      <AdminConversationList adminId={admin.id} />

      {/* Or chat with specific user */}
      <AdminMessaging
        userId={admin.id}
        userRole="admin"
      />
    </div>
  )
}
```

---

## 🎨 UI/UX Design

### ปุ่มลอย:

```
Bottom Right Corner:

┌─────────────────────┐
│                     │
│                     │
│                     │
│         🔵 Chatbot  │ ← Blue (bottom: 6rem)
│         🟣 Admin    │ ← Purple (bottom: 1.5rem)
└─────────────────────┘
```

### ขนาดหน้าต่างแชท:
- Width: 384px (96 * 4)
- Height: 600px
- Rounded: 2xl
- Shadow: 2xl

### สี Theme:
- **MedicalChatbot**: Blue (from-blue-500 to-blue-700)
- **AdminMessaging**: Purple (from-purple-500 to-purple-700)

---

## 🔧 Troubleshooting

### Chatbot ไม่ตอบ:
1. ตรวจสอบ `OPENAI_API_KEY` ใน `.env.local`
2. Restart dev server: `npm run dev`
3. เช็ค console errors
4. ถ้ายัง error → ใช้ fallback (keyword matching)

### Admin messages ไม่แสดง:
1. รัน `database-admin-messages.sql` ใน Supabase
2. เช็ค RLS policies
3. ตรวจสอบ `userId` ถูกส่งไปยัง component ไหม
4. ดู Network tab ใน DevTools

### Messages ไม่ถูกลบ:
1. ตั้งค่า Cron job ใน Supabase
2. หรือรัน manual: `DELETE FROM admin_messages WHERE expires_at < NOW()`
3. สร้าง Edge Function สำหรับ auto-cleanup

### Real-time ไม่ทำงาน:
1. เช็ค Supabase Realtime enabled
2. ตรวจสอบ subscription ใน code
3. Enable Realtime ใน Supabase Dashboard → Database → Replication

---

## 📊 Statistics & Monitoring

### Query สำหรับ Admin Dashboard:

```sql
-- Total messages today
SELECT COUNT(*)
FROM admin_messages
WHERE created_at >= CURRENT_DATE;

-- Unread messages per user
SELECT
  recipient_id,
  profiles.full_name,
  COUNT(*) as unread_count
FROM admin_messages
JOIN profiles ON profiles.id = admin_messages.recipient_id
WHERE is_read = FALSE
  AND sender_role = 'user'
GROUP BY recipient_id, profiles.full_name;

-- Messages expiring soon (< 7 days)
SELECT COUNT(*)
FROM admin_messages
WHERE expires_at < NOW() + INTERVAL '7 days'
  AND expires_at > NOW();
```

---

## 🚀 Next Steps

### Future Enhancements:

1. **File Attachments:**
   - Upload images/PDFs
   - Store in Supabase Storage
   - Save URL in `metadata` JSONB

2. **Push Notifications:**
   - FCM/OneSignal integration
   - Send push when admin replies

3. **Typing Indicators:**
   - Show "Admin is typing..."
   - Use Supabase Presence

4. **Voice Messages:**
   - Record audio
   - Upload to Storage
   - Play inline

5. **Admin Dashboard:**
   - View all conversations
   - Assign to specific admin
   - Canned responses

6. **Analytics:**
   - Average response time
   - Message volume by hour
   - Common keywords

---

## ⚠️ Important Notes

### Chatbot (AI):
- ❌ **ไม่เก็บประวัติ** - ทุกการสนทนาเป็น ephemeral
- ✅ ใช้สำหรับ: ตรวจอาการเบื้องต้น, แนะนำแพทย์
- 💰 ใช้ OpenAI credits (มีค่าใช้จ่าย)

### Admin Messages:
- ✅ **เก็บไว้ 60 วัน** - จากนั้นลบอัตโนมัติ
- ✅ ใช้สำหรับ: ติดต่อแอดมิน, support ticket
- 💾 เก็บใน Supabase (ฟรีถึง 500MB)

### Data Retention Policy:
```
AI Chatbot:      0 days (ไม่เก็บเลย)
Admin Messages:  60 days (ลบอัตโนมัติ)
```

---

**Created by:** Claude Code
**Date:** 2025-11-15
**Version:** 1.0.0
