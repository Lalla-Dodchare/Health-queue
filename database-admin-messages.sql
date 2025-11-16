-- =====================================================
-- Admin Messaging System
-- =====================================================
-- ระบบแชทระหว่าง User กับ Admin
-- เก็บข้อความไว้ 60 วัน แล้วลบอัตโนมัติ
-- =====================================================

-- 1. สร้างตาราง admin_messages
CREATE TABLE IF NOT EXISTS public.admin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ผู้ส่ง
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'admin')),

  -- ผู้รับ (optional - ถ้าเป็น broadcast จาก admin ไม่ต้องระบุ)
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- เนื้อหา
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),

  -- Metadata
  metadata JSONB, -- { file_url, file_name, image_url, etc. }

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Auto-delete after 60 days
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 days')
);

-- 2. สร้าง indexes
CREATE INDEX idx_admin_messages_sender ON public.admin_messages(sender_id);
CREATE INDEX idx_admin_messages_recipient ON public.admin_messages(recipient_id);
CREATE INDEX idx_admin_messages_created ON public.admin_messages(created_at DESC);
CREATE INDEX idx_admin_messages_expires ON public.admin_messages(expires_at);
CREATE INDEX idx_admin_messages_unread ON public.admin_messages(recipient_id, is_read)
  WHERE is_read = FALSE;

-- 3. สร้าง function สำหรับ auto-delete expired messages
CREATE OR REPLACE FUNCTION delete_expired_admin_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.admin_messages
  WHERE expires_at < NOW();

  RAISE NOTICE 'Deleted expired admin messages';
END;
$$;

-- 4. สร้าง function สำหรับ update read status
CREATE OR REPLACE FUNCTION mark_message_as_read(message_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.admin_messages
  SET
    is_read = TRUE,
    read_at = NOW()
  WHERE id = message_id;
END;
$$;

-- 5. สร้าง trigger สำหรับ updated_at
CREATE OR REPLACE FUNCTION update_admin_message_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_admin_message_updated ON public.admin_messages;

CREATE TRIGGER trigger_admin_message_updated
  BEFORE UPDATE ON public.admin_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_message_timestamp();

-- =====================================================
-- 6. สร้าง View สำหรับ conversation list
-- =====================================================

CREATE OR REPLACE VIEW v_admin_message_conversations AS
SELECT DISTINCT ON (user_id)
  user_id,
  profiles.full_name AS user_name,
  profiles.email AS user_email,
  last_message,
  last_message_at,
  unread_count
FROM (
  SELECT
    CASE
      WHEN sender_role = 'user' THEN sender_id
      ELSE recipient_id
    END AS user_id,
    message AS last_message,
    created_at AS last_message_at,
    (
      SELECT COUNT(*)
      FROM admin_messages m2
      WHERE m2.recipient_id = (
        CASE
          WHEN sender_role = 'admin' THEN sender_id
          ELSE recipient_id
        END
      )
      AND m2.is_read = FALSE
      AND m2.sender_role = 'user'
    ) AS unread_count
  FROM admin_messages
  WHERE expires_at > NOW()
  ORDER BY created_at DESC
) conversations
LEFT JOIN profiles ON profiles.id = conversations.user_id
ORDER BY user_id, last_message_at DESC;

-- =====================================================
-- 7. Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages they sent or received
CREATE POLICY "Users can view own messages"
ON public.admin_messages
FOR SELECT
USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON public.admin_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
);

-- Admins can read all messages
CREATE POLICY "Admins can view all messages"
ON public.admin_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

-- Admins can send messages
CREATE POLICY "Admins can send messages"
ON public.admin_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

-- =====================================================
-- 8. สร้าง cron job สำหรับ auto-delete (ต้องใช้ pg_cron extension)
-- =====================================================

-- ถ้ามี pg_cron extension:
-- SELECT cron.schedule(
--   'delete-expired-messages',
--   '0 2 * * *', -- Run at 2 AM every day
--   'SELECT delete_expired_admin_messages()'
-- );

-- ถ้าไม่มี pg_cron ให้ใช้ Supabase Edge Function หรือ run manual

-- =====================================================
-- ตรวจสอบผลลัพธ์
-- =====================================================

-- ดู indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'admin_messages';

-- ดู RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'admin_messages';

-- =====================================================
-- สำเร็จ!
-- =====================================================

-- Next Steps:
-- 1. รัน script นี้ใน Supabase SQL Editor
-- 2. ตรวจสอบว่า RLS policies ทำงานถูกต้อง
-- 3. ใช้ component AdminMessaging.js สำหรับ frontend
-- 4. ตั้ง cron job หรือ Edge Function สำหรับ auto-delete

COMMENT ON TABLE public.admin_messages IS
'Messages between users and admins. Auto-deleted after 60 days.';

COMMENT ON COLUMN public.admin_messages.expires_at IS
'Messages automatically expire 60 days after creation';
