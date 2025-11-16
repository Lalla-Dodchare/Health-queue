# Auto-Delete Messages Setup Guide

## 📅 ตั้งค่าลบข้อความอัตโนมัติหลัง 60 วัน

มี 3 วิธีให้เลือก:

---

## ✅ **Option 1: EasyCron (ฟรี, แนะนำ)**

### ขั้นตอน:

1. **เตรียม Environment Variables:**
   ```bash
   # ใน .env.local
   SUPABASE_SERVICE_ROLE_KEY=<ดูใน Supabase Dashboard → Settings → API>
   CLEANUP_SECRET=<สร้าง random string เช่น: abc123xyz789>
   ```

2. **Deploy โปรเจคขึ้น Vercel/Netlify:**
   ```bash
   # ถ้ายังไม่ deploy
   vercel deploy
   # หรือ
   netlify deploy
   ```

3. **ไปที่ https://www.easycron.com/ (ฟรี):**
   - สมัครสมาชิก (Free Plan รัน 1 job ได้)
   - คลิก **Create Cron Job**

4. **ตั้งค่า Cron Job:**
   ```
   URL to call: https://your-domain.vercel.app/api/cleanup-messages

   Cron Expression: 0 2 * * *
   (รันทุกวันเวลา 2 โมงเช้า)

   HTTP Method: POST

   POST Data (JSON):
   {
     "secret": "abc123xyz789"
   }

   Headers:
   Content-Type: application/json
   ```

5. **ทดสอบ:**
   - คลิก **Run Now** ใน EasyCron
   - เช็ค Logs ว่ามี response: `{"success": true, "deletedCount": X}`

---

## ✅ **Option 2: GitHub Actions (ฟรี, อัตโนมัติ)**

### ขั้นตอน:

1. **สร้างไฟล์ GitHub Action:**

สร้าง `.github/workflows/cleanup-messages.yml`:

```yaml
name: Cleanup Expired Messages

on:
  schedule:
    # Run at 2 AM UTC every day
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup expired messages
        run: |
          curl -X POST https://your-domain.vercel.app/api/cleanup-messages \\
            -H "Content-Type: application/json" \\
            -d '{"secret": "${{ secrets.CLEANUP_SECRET }}"}'
```

2. **เพิ่ม Secret ใน GitHub:**
   - ไปที่ GitHub Repository → Settings → Secrets and variables → Actions
   - คลิก **New repository secret**
   - Name: `CLEANUP_SECRET`
   - Value: `<ใส่ค่าเดียวกับใน .env.local>`

3. **Push ไฟล์ขึ้น GitHub:**
   ```bash
   git add .github/workflows/cleanup-messages.yml
   git commit -m "Add auto-cleanup workflow"
   git push
   ```

4. **ทดสอบ:**
   - ไปที่ GitHub → Actions
   - เลือก "Cleanup Expired Messages"
   - คลิก **Run workflow**

---

## ✅ **Option 3: Supabase Edge Function (ทำงานใน Supabase)**

### ขั้นตอน:

1. **ติดตั้ง Supabase CLI:**
   ```bash
   npm install -g supabase
   supabase login
   ```

2. **สร้าง Edge Function:**
   ```bash
   supabase functions new cleanup-messages
   ```

3. **แก้ไขไฟล์** `supabase/functions/cleanup-messages/index.ts`:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete expired messages
    const { data, error } = await supabase
      .from('admin_messages')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select()

    if (error) throw error

    const deletedCount = data?.length || 0

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount,
        timestamp: new Date().toISOString(),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

4. **Deploy Edge Function:**
   ```bash
   supabase functions deploy cleanup-messages
   ```

5. **ตั้งค่า Cron ใน Supabase:**
   - ไปที่ Supabase Dashboard → Database → Extensions
   - Enable **pg_cron** extension
   - ไปที่ SQL Editor รัน:

```sql
SELECT cron.schedule(
  'delete-expired-messages',
  '0 2 * * *', -- 2 AM every day
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/cleanup-messages',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) AS request_id;
  $$
);
```

6. **ตรวจสอบ Cron Jobs:**
```sql
SELECT * FROM cron.job;
```

---

## 🧪 การทดสอบ

### ทดสอบ API Endpoint:

```bash
# ดูจำนวนข้อความที่หมดอายุ (GET)
curl https://your-domain.vercel.app/api/cleanup-messages

# ลบข้อความจริง (POST)
curl -X POST https://your-domain.vercel.app/api/cleanup-messages \\
  -H "Content-Type: application/json" \\
  -d '{"secret": "your-secret-here"}'
```

### ทดสอบใน Dev:

```bash
npm run dev

# ในเบราว์เซอร์:
http://localhost:3001/api/cleanup-messages
```

### สร้างข้อความทดสอบที่หมดอายุ:

```sql
-- ใน Supabase SQL Editor
INSERT INTO admin_messages (sender_id, sender_role, message, expires_at)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'user',
  'Test expired message',
  NOW() - INTERVAL '1 day' -- หมดอายุเมื่อวานแล้ว
);

-- ตรวจสอบ
SELECT COUNT(*) FROM admin_messages WHERE expires_at < NOW();
```

---

## 📊 Monitoring

### Query สำหรับตรวจสอบ:

```sql
-- ข้อความที่จะหมดอายุใน 7 วัน
SELECT COUNT(*)
FROM admin_messages
WHERE expires_at < NOW() + INTERVAL '7 days'
  AND expires_at > NOW();

-- ข้อความทั้งหมดแยกตามสถานะ
SELECT
  CASE
    WHEN expires_at < NOW() THEN 'expired'
    WHEN expires_at < NOW() + INTERVAL '7 days' THEN 'expiring_soon'
    ELSE 'active'
  END AS status,
  COUNT(*) as count
FROM admin_messages
GROUP BY status;
```

---

## 🎯 สรุปการเลือก

| Option | ความยาก | ราคา | แนะนำ |
|--------|---------|------|-------|
| EasyCron | ⭐ ง่าย | ฟรี | ✅ สำหรับ production |
| GitHub Actions | ⭐⭐ ปานกลาง | ฟรี | ✅ ถ้ามี GitHub repo |
| Supabase Edge | ⭐⭐⭐ ยาก | ฟรี | สำหรับคนที่ชอบ Supabase |

---

## ⚠️ สิ่งที่ต้องทำ

1. **เลือกวิธีข้อใดข้อหนึ่ง**
2. **ตั้งค่า SUPABASE_SERVICE_ROLE_KEY** (ดูใน Supabase Dashboard)
3. **สร้าง CLEANUP_SECRET** (random string)
4. **Deploy แล้วทดสอบ**
5. **ตั้ง Cron ให้รันทุกวัน**

---

**แนะนำ:** ใช้ **Option 1 (EasyCron)** เพราะง่ายที่สุด ตั้งค่าครั้งเดียวเสร็จ!
