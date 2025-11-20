-- =============================================================================
-- ADMIN CHAT SYSTEM - DEBUGGING GUIDE
-- =============================================================================
-- เอกสารนี้อธิบายปัญหาทั้งหมดที่เจอตอนพัฒนาระบบแชทระหว่าง User และ Admin
-- และวิธีแก้ปัญหาแต่ละข้อ
--
-- Created: 2025-01-20
-- Last Updated: 2025-01-20
-- Authors: Nam (User side), Lalla (Admin side)
-- =============================================================================

-- =============================================================================
-- 1. OVERVIEW - ภาพรวมของปัญหา
-- =============================================================================
/*
ปัญหาหลัก: User ไม่สามารถส่งข้อความถึง Admin ได้
          และ Admin ไม่สามารถตอบกลับ User ได้

สาเหตุหลัก 5 ข้อ:
1. RLS Policies ไม่รองรับการส่งข้อความแบบที่ต้องการ
2. Database Schema ไม่ตรงกับ Code (field names mismatch)
3. Database Constraints ไม่รองรับ AI/System messages
4. ขาด user_id column สำหรับการ group conversations
5. API endpoint ส่ง fields ที่ไม่ตรงกับ schema

Timeline การแก้ปัญหา:
- เริ่มต้น: Admin ไม่เห็นข้อความจาก User (403 Forbidden)
- ระหว่างทาง: User ส่งข้อความไม่ได้ (400 Bad Request)
- ระหว่างทาง: Admin เห็นข้อความแล้ว แต่มี UUID error
- ระหว่างทาง: User ส่งได้แล้ว แต่ Admin ตอบไม่ได้ (500 Internal Error)
- สุดท้าย: ✅ ทุกอย่างใช้งานได้แล้ว
*/

-- =============================================================================
-- 2. DATABASE SCHEMA - โครงสร้าง Database
-- =============================================================================

-- Schema เดิม (มีปัญหา):
/*
CREATE TABLE admin_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id),     -- ❌ ต้อง NOT NULL
  sender_role TEXT CHECK (sender_role IN ('user', 'admin')), -- ❌ ไม่มี 'ai', 'system'
  recipient_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file')), -- ❌ ไม่มี 'system'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
*/

-- Schema ที่แก้ไขแล้ว (ใช้งานได้):
CREATE TABLE IF NOT EXISTS admin_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- FIXED: sender_id ตอนนี้เป็น nullable เพื่อรองรับ AI/System messages
  sender_id UUID REFERENCES auth.users(id),

  -- FIXED: เพิ่ม 'ai', 'system' เข้าไปใน enum
  sender_role TEXT CHECK (sender_role IN ('user', 'admin', 'ai', 'system')),

  recipient_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,

  -- FIXED: เพิ่ม 'system' เข้าไปใน message_type
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'system')),

  -- FIXED: เพิ่ม user_id สำหรับ group conversations
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- เพิ่ม index สำหรับ performance
CREATE INDEX IF NOT EXISTS idx_admin_messages_user_id ON admin_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_sender_id ON admin_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at);

-- =============================================================================
-- 3. PROBLEM #1 - RLS Policy Conflict
-- =============================================================================
/*
ปัญหา: Policy "Users can send messages v2" มีอยู่แล้ว
Error: policy "Users can send messages v2" already exists

สาเหตุ:
- Lalla เคยสร้าง policy นี้ไปแล้ว แต่ไม่สมบูรณ์
- พอจะสร้างใหม่มัน conflict

วิธีแก้:
- เพิ่ม DROP POLICY IF EXISTS ก่อน CREATE POLICY
*/

-- ลบ policies เก่าทิ้ง
DROP POLICY IF EXISTS "Users can send messages" ON public.admin_messages;
DROP POLICY IF EXISTS "Users can send messages v2" ON public.admin_messages;

-- สร้าง policy ใหม่ที่รองรับทุก case
CREATE POLICY "Users can send messages v2"
ON public.admin_messages
FOR INSERT
WITH CHECK (
  -- Case 1: User/Admin ส่งข้อความ (ต้อง login)
  (auth.uid() = sender_id AND sender_role IN ('user', 'admin'))
  OR
  -- Case 2: AI ส่งข้อความให้ user ที่ login อยู่
  (auth.uid() = recipient_id AND sender_role IN ('ai', 'system'))
  OR
  -- Case 3: System message (sender_id = null) สำหรับ user ที่ login
  (sender_id IS NULL AND sender_role IN ('ai', 'system') AND auth.uid() IS NOT NULL)
);

-- Policy สำหรับ SELECT (อ่านข้อความ)
DROP POLICY IF EXISTS "Users can view their messages" ON public.admin_messages;
CREATE POLICY "Users can view their messages"
ON public.admin_messages
FOR SELECT
USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id OR auth.uid() = user_id
);

-- =============================================================================
-- 4. PROBLEM #2 - Schema Mismatch (sender_role, message_type)
-- =============================================================================
/*
ปัญหา: Code ส่ง sender_role = 'ai' และ message_type = 'system'
       แต่ Database ไม่รองรับ

Error: 400 Bad Request
Details: new row violates check constraint "admin_messages_sender_role_check"

สาเหตุ:
- Database มี CHECK constraint ที่จำกัดค่า
- Code พยายามส่งค่านอก constraint

วิธีแก้:
- ขยาย CHECK constraint ให้รองรับค่าใหม่
*/

-- แก้ sender_role constraint
ALTER TABLE public.admin_messages
DROP CONSTRAINT IF EXISTS admin_messages_sender_role_check;

ALTER TABLE public.admin_messages
ADD CONSTRAINT admin_messages_sender_role_check
CHECK (sender_role IN ('user', 'admin', 'ai', 'system'));

-- แก้ message_type constraint
ALTER TABLE public.admin_messages
DROP CONSTRAINT IF EXISTS admin_messages_message_type_check;

ALTER TABLE public.admin_messages
ADD CONSTRAINT admin_messages_message_type_check
CHECK (message_type IN ('text', 'image', 'file', 'system'));

-- =============================================================================
-- 5. PROBLEM #3 - sender_id NOT NULL Constraint
-- =============================================================================
/*
ปัญหา: AI/System messages ไม่มี sender_id (ควรเป็น null)
       แต่ database บังคับให้ต้องมี

Error: null value in column "sender_id" violates not-null constraint

สาเหตุ:
- Column sender_id ถูกกำหนดเป็น NOT NULL
- AI messages ไม่ควรมี sender_id เพราะไม่ใช่คนส่ง

วิธีแก้:
- เปลี่ยน sender_id ให้เป็น nullable
*/

-- ทำให้ sender_id เป็น nullable
ALTER TABLE public.admin_messages
ALTER COLUMN sender_id DROP NOT NULL;

-- =============================================================================
-- 6. PROBLEM #4 - Missing user_id Column
-- =============================================================================
/*
ปัญหา: ไม่มี column สำหรับ group conversations
Error: Could not find the "user_id" column of "admin_messages"

สาเหตุ:
- Admin หน้าต้องแสดงรายการ conversations แยกตาม user
- แต่ไม่มี field ไหนที่บอกว่า message นี้เป็นของ conversation ไหน
- sender_id/recipient_id ไม่พอเพราะ:
  * AI messages: sender_id = null, recipient_id = user
  * User messages: sender_id = user, recipient_id = null
  * Admin messages: sender_id = admin, recipient_id = user

วิธีแก้:
- เพิ่ม user_id column เพื่อเป็น "conversation owner"
- ทุก message ใน conversation เดียวกันจะมี user_id เดียวกัน
*/

-- เพิ่ม user_id column
ALTER TABLE public.admin_messages
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- สร้าง index สำหรับ query ที่เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_admin_messages_user_id ON public.admin_messages(user_id);

-- =============================================================================
-- 7. PROBLEM #5 - Invalid UUID "undefined" Error
-- =============================================================================
/*
ปัญหา: Admin page พยายาม query profiles ด้วย user_id = "undefined"
Error: invalid input syntax for type uuid: "undefined"

สาเหตุ:
- Code ไม่ได้กรอง messages ที่ user_id = null
- พอเอาไป query profiles มันส่ง undefined ไป

วิธีแก้:
- เพิ่ม filter ใน JavaScript เพื่อข้าม messages ที่ไม่มี user_id
*/

-- ไฟล์: app/admin/chat/page.js (บรรทัด 82-84)
/*
messages.forEach((msg) => {
  // Skip messages without user_id (AI/system messages)
  if (!msg.user_id) return  // ✅ FIXED: เพิ่มบรรทัดนี้

  if (!grouped[msg.user_id]) {
    grouped[msg.user_id] = { ... }
  }
})
*/

-- =============================================================================
-- 8. PROBLEM #6 - API Route Field Mismatch
-- =============================================================================
/*
ปัญหา: Admin ส่งข้อความกลับ User ไม่ได้ (500 Internal Server Error)
Error: POST /api/chat/send - 500

สาเหตุ:
- API พยายาม INSERT fields ที่ไม่มีใน database:
  * admin_id (ไม่มี column นี้)
  * sender_type (ต้องเป็น sender_role)
  * is_read (ไม่มี column นี้)

- API ไม่ได้ส่ง fields ที่จำเป็น:
  * message_type (required)
  * recipient_id (จำเป็นสำหรับ admin → user)

Code เดิม (ผิด):
{
  user_id: senderType === 'user' ? currentUser.id : recipient_id,
  admin_id: senderType === 'admin' ? currentUser.id : null,  // ❌ ไม่มี column
  message: message.trim(),
  sender_type: senderType,  // ❌ ต้องเป็น sender_role
  is_read: false,  // ❌ ไม่มี column
}

Code ใหม่ (ถูก):
{
  user_id: senderRole === 'user' ? currentUser.id : recipient_id,  // ✅
  sender_id: currentUser.id,  // ✅ เพิ่ม
  sender_role: senderRole,  // ✅ แก้ชื่อ
  recipient_id: senderRole === 'admin' ? recipient_id : null,  // ✅ เพิ่ม
  message: message.trim(),  // ✅
  message_type: 'text',  // ✅ เพิ่ม
}
*/

-- ไฟล์: app/api/chat/send/route.js (บรรทัด 45-57)
-- ดูในไฟล์นั้นสำหรับ implementation ที่แก้ไขแล้ว

-- =============================================================================
-- 9. CODE CHANGES SUMMARY
-- =============================================================================
/*
ไฟล์ที่แก้ไข:

1. Database (Supabase SQL Editor):
   - DROP และ CREATE policies ใหม่
   - ALTER TABLE เพิ่ม user_id column
   - ALTER COLUMN sender_id เป็น nullable
   - DROP และ ADD constraints ใหม่สำหรับ enum values

2. components/UnifiedChatbot.js:
   - เพิ่ม user_id ในทุก INSERT statement (5 จุด)
   - บรรทัด 232, 239: switch to admin mode
   - บรรทัด 271: switch to AI mode
   - บรรทัด 297, 304: AI response
   - บรรทัด 328: admin mode direct message

3. app/admin/chat/page.js:
   - บรรทัด 84: เพิ่ม if (!msg.user_id) return

4. app/api/chat/send/route.js:
   - บรรทัด 43: เปลี่ยน senderType → senderRole
   - บรรทัด 48-55: แก้ INSERT fields ให้ตรงกับ schema
*/

-- =============================================================================
-- 9.5 FOR LALLA'S CLAUDE - คำแนะนำสำหรับ Claude ของลัลลา
-- =============================================================================
/*
⚠️ สำคัญ! ถ้า Lalla เจอปัญหากับ Admin Chat ให้บอก Claude ของ Lalla ว่า:

"อ่านไฟล์ ADMIN_CHAT_DEBUGGING_GUIDE.sql ให้หน่อย แล้วอธิบายให้ฉันเข้าใจว่าเกิดอะไรขึ้น"

หมายเหตุ:
- Nam จะ push ไฟล์นี้ขึ้น Git แล้ว
- Lalla แค่ pull มา แล้ว Claude ของ Lalla อ่านเพื่อเข้าใจว่า Nam แก้ไขอะไรไปบ้าง
- ไฟล์ทุกอันแก้เสร็จหมดแล้ว ไม่ต้องแก้เพิ่ม (เว้นแต่จะเจอปัญหาใหม่)

=============================================================================
📁 ไฟล์ที่ Lalla (Admin side) ต้องแก้:
=============================================================================

1. ✅ app/admin/chat/page.js
   ที่: บรรทัด 84
   ทำไม: กรองข้อความที่ไม่มี user_id ออก (AI/System messages)
   แก้ยังไง:
   ```javascript
   messages.forEach((msg) => {
     if (!msg.user_id) return  // เพิ่มบรรทัดนี้
     // ... rest of code
   })
   ```

2. ❌ ไม่ต้องแก้ app/api/chat/send/route.js
   เพราะ: Claude ของ Nam แก้ให้แล้ว (shared file)

3. ❌ ไม่ต้องแก้ app/api/chat/messages/route.js
   เพราะ: ไฟล์นี้ใช้งานได้แล้ว

=============================================================================
📁 ไฟล์ที่ Nam (User side) แก้:
=============================================================================

1. ✅ components/UnifiedChatbot.js
   ทำไม: เพิ่ม user_id ในทุก INSERT เพื่อให้ Admin group conversations ได้
   จุดที่แก้: 5 จุด (บรรทัด 232, 239, 271, 297, 304, 328)

=============================================================================
🗄️ Supabase Database (ทั้ง Nam และ Lalla ใช้ร่วมกัน):
=============================================================================

Lalla ต้องรัน SQL ต่อไปนี้ใน Supabase SQL Editor:

-- 1. แก้ RLS Policies
DROP POLICY IF EXISTS "Users can send messages" ON public.admin_messages;
DROP POLICY IF EXISTS "Users can send messages v2" ON public.admin_messages;

CREATE POLICY "Users can send messages v2"
ON public.admin_messages FOR INSERT
WITH CHECK (
  (auth.uid() = sender_id AND sender_role IN ('user', 'admin'))
  OR (auth.uid() = recipient_id AND sender_role IN ('ai', 'system'))
  OR (sender_id IS NULL AND sender_role IN ('ai', 'system') AND auth.uid() IS NOT NULL)
);

DROP POLICY IF EXISTS "Users can view their messages" ON public.admin_messages;
CREATE POLICY "Users can view their messages"
ON public.admin_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id OR auth.uid() = user_id);

-- 2. เพิ่ม user_id column
ALTER TABLE public.admin_messages
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_admin_messages_user_id ON public.admin_messages(user_id);

-- 3. ทำให้ sender_id เป็น nullable
ALTER TABLE public.admin_messages
ALTER COLUMN sender_id DROP NOT NULL;

-- 4. แก้ enum constraints
ALTER TABLE public.admin_messages DROP CONSTRAINT IF EXISTS admin_messages_sender_role_check;
ALTER TABLE public.admin_messages ADD CONSTRAINT admin_messages_sender_role_check
CHECK (sender_role IN ('user', 'admin', 'ai', 'system'));

ALTER TABLE public.admin_messages DROP CONSTRAINT IF EXISTS admin_messages_message_type_check;
ALTER TABLE public.admin_messages ADD CONSTRAINT admin_messages_message_type_check
CHECK (message_type IN ('text', 'image', 'file', 'system'));

=============================================================================
🔍 วิธีการทำงานระหว่าง Claude ของ Nam และ Claude ของ Lalla:
=============================================================================

ทั้งสองตัวทำงานแยกกัน แต่แก้ไฟล์ในโปรเจคเดียวกัน:

Claude ของ Nam (แก้ User side):
├─ components/UnifiedChatbot.js (User chatbot)
├─ app/dashboard/page.js (User dashboard)
└─ app/appointments/page.js (User appointments)

Claude ของ Lalla (แก้ Admin side):
├─ app/admin/chat/page.js (Admin chat interface) ✅ ต้องแก้
├─ app/admin/appointments/page.js (Admin appointments)
└─ components/admin/Sidebar.js (Admin sidebar)

Shared Files (ทั้งคู่ใช้ร่วมกัน):
├─ app/api/chat/send/route.js (API ส่งข้อความ)
├─ app/api/chat/messages/route.js (API ดึงข้อความ)
├─ lib/supabase.js (Supabase client)
└─ Database (Supabase) - ทั้งคู่ใช้ database เดียวกัน

=============================================================================
⚙️ สรุปว่า Supabase จัดการอะไรบ้าง:
=============================================================================

Supabase ทำหน้าที่:

1. 🗄️ Database (PostgreSQL):
   - เก็บ admin_messages table
   - เก็บ profiles table
   - เก็บ appointments table
   - เก็บ admins table

2. 🔐 Authentication:
   - Login/Logout
   - Session management
   - auth.users table
   - JWT tokens

3. 🛡️ Row Level Security (RLS):
   - Policy: "Users can send messages v2"
   - Policy: "Users can view their messages"
   - กันไม่ให้ user ธรรมดาเห็นข้อความของคนอื่น
   - กันไม่ให้ส่งข้อความปลอม

4. ⚡ Real-time Subscriptions:
   - แชทอัพเดททันทีโดยไม่ต้อง refresh
   - ใช้ WebSocket
   - Subscribe ตาม user_id

5. 🔑 API Keys:
   - NEXT_PUBLIC_SUPABASE_ANON_KEY (ใช้ใน frontend)
   - SUPABASE_SERVICE_ROLE_KEY (ใช้ใน backend API - bypass RLS)

=============================================================================
❓ เมื่อไหร่ต้องใช้ Service Role Key:
=============================================================================

ใช้ anon key (ปกติ):
✅ User login
✅ User ส่งข้อความ
✅ User ดูข้อความของตัวเอง
✅ Frontend operations

ใช้ service role key (bypass RLS):
✅ Admin ดูข้อความของ user ทั้งหมด
✅ API routes ที่ต้อง access cross-user data
✅ Background jobs / cleanup
✅ Migration scripts

ตัวอย่างใน app/api/chat/messages/route.js:
```javascript
// ใช้ anon key เพื่อ verify token
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const { data: { user } } = await supabase.auth.getUser(token)

// ใช้ service role เพื่อ bypass RLS และดูข้อมูลทั้งหมด
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
const { data } = await supabaseAdmin.from('admin_messages').select('*')
```

=============================================================================
🐛 Error Codes ที่เจอบ่อย:
=============================================================================

400 Bad Request:
- Schema mismatch (field names ผิด)
- Missing required fields
- Constraint violations (enum values)

401 Unauthorized:
- Token หมดอายุ
- ไม่ได้ส่ง Authorization header
- Token ไม่ valid

403 Forbidden:
- RLS Policy บล็อก
- ไม่มีสิทธิ์ access resource นี้

500 Internal Server Error:
- Code bug
- Database down
- Missing environment variables

=============================================================================
✅ การทดสอบที่ Lalla ควรทำ:
=============================================================================

1. Login เข้า admin panel (/admin/chat)
2. ตรวจสอบว่าเห็น conversations list ไหม
3. คลิกเข้าไปดู conversation
4. ลองส่งข้อความกลับ user
5. ดู console ว่ามี error ไหม
6. ถ้ามี error - อ่านไฟล์นี้แล้วแก้ตามที่บอก

=============================================================================
🚨 ถ้า Lalla เจอปัญหาอื่น:
=============================================================================

1. อ่าน section "PROBLEM #X" ในไฟล์นี้
2. เช็คว่าตรงกับปัญหาที่เจอไหม
3. ถ้าตรง - copy SQL/code ไปแก้
4. ถ้าไม่ตรง - ให้ Claude ของ Lalla อ่านไฟล์นี้แล้วช่วย debug

Happy Coding! 🎉
*/

-- =============================================================================
-- 10. TESTING CHECKLIST
-- =============================================================================
/*
การทดสอบที่ผ่าน:
✅ User ส่งข้อความหา AI (normal mode)
✅ User พิมพ์ "คุยกับคน" (switch to admin mode)
✅ System message แสดง "กำลังเชื่อมต่อกับเจ้าหน้าที่..."
✅ User ส่งข้อความหา Admin
✅ Admin เห็นรายการ conversations
✅ Admin คลิกเข้าไปดู conversation
✅ Admin ส่งข้อความกลับ User
✅ User เห็นข้อความจาก Admin
✅ Real-time update ทำงาน (ไม่ต้อง refresh)

ปัญหาที่เหลือ (ไม่เร่งด่วน):
⚠️  Admin ฝั่ง: 400 Bad Request (แต่ส่งได้)
⚠️  User ฝั่ง: 401 Unauthorized จาก notifications API
*/

-- =============================================================================
-- 11. LESSONS LEARNED
-- =============================================================================
/*
บทเรียนจากการ debug:

1. RLS Policies ควรรองรับทุก use case ตั้งแต่แรก
   - User messages
   - Admin messages
   - AI messages
   - System messages

2. Database Schema ควร flexible พอสำหรับ future requirements
   - nullable columns สำหรับ optional data
   - enum constraints ที่ขยายได้
   - proper indexing

3. ควรใช้ field names ที่ consistent
   - sender_role (ไม่ใช่ sender_type)
   - message_type (ไม่ใช่ type)

4. ควรมี column สำหรับ grouping/categorization
   - user_id สำหรับ group conversations
   - ไม่พึ่งพา sender_id/recipient_id อย่างเดียว

5. API routes ควร validate และ match database schema
   - ตรวจสอบ field names
   - ตรวจสอบ required fields
   - ใช้ TypeScript หรือ schema validation

6. Error messages ที่ดีช่วยให้ debug ง่ายขึ้น
   - 400: Bad Request - schema mismatch
   - 401: Unauthorized - auth issue
   - 403: Forbidden - RLS policy
   - 500: Internal Error - code bug

7. ควรแยก concerns ให้ชัดเจน
   - Database schema = source of truth
   - API routes = interface
   - Frontend = presentation
*/

-- =============================================================================
-- 12. NEXT STEPS
-- =============================================================================
/*
สิ่งที่ควรทำต่อ:

1. แก้ 401 Unauthorized error จาก notifications API
2. แก้ 400 Bad Request ที่เหลือในฝั่ง Admin
3. เพิ่ม Google OAuth Login สำหรับ User
4. เพิ่ม is_read flag สำหรับแสดง unread badge
5. เพิ่ม typing indicator
6. เพิ่ม message delivery status (sent, delivered, read)
7. เพิ่ม image/file upload support
8. ทำ Flutter app สำหรับ mobile

Security improvements:
- เปลี่ยน AUTH_SECRET, CLEANUP_SECRET ใน .env.local
- ตรวจสอบ RLS policies ให้ tight มากขึ้น
- เพิ่ม rate limiting สำหรับ API endpoints
- เพิ่ม input validation และ sanitization
*/

-- =============================================================================
-- 13. USEFUL QUERIES
-- =============================================================================

-- ดู conversations ทั้งหมดของ user
SELECT * FROM admin_messages
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at ASC;

-- นับจำนวนข้อความแยกตาม sender_role
SELECT sender_role, COUNT(*)
FROM admin_messages
GROUP BY sender_role;

-- หา unread messages (ถ้ามี is_read column)
-- SELECT * FROM admin_messages
-- WHERE recipient_id = 'YOUR_USER_ID'
-- AND is_read = false
-- ORDER BY created_at DESC;

-- ดู conversation groups
SELECT
  user_id,
  COUNT(*) as message_count,
  MAX(created_at) as last_message_at
FROM admin_messages
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY last_message_at DESC;

-- Debug: ดู messages ที่ไม่มี user_id (AI/System messages ที่ไม่ได้ผูกกับ user)
SELECT * FROM admin_messages WHERE user_id IS NULL;

-- =============================================================================
-- END OF DOCUMENTATION
-- =============================================================================
/*
หมายเหตุ:
- เอกสารนี้เขียนสำหรับ Nam และ Lalla อ่านทีหลัง
- ใช้เป็น reference เวลาเจอปัญหาคล้ายๆ กัน
- สามารถ copy SQL statements ไปใช้ได้เลย

Happy Debugging! 🐛🔧
*/
