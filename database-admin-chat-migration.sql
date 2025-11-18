-- =====================================================
-- Admin Chat System - Database Migration
-- =====================================================
-- Create admin_chats table for admin-user communication
-- =====================================================

-- Create admin_chats table
CREATE TABLE IF NOT EXISTS public.admin_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_chats_user_id ON public.admin_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_chats_admin_id ON public.admin_chats(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_chats_created_at ON public.admin_chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_chats_is_read ON public.admin_chats(is_read) WHERE is_read = FALSE;

-- Add comments
COMMENT ON TABLE public.admin_chats IS 'Chat messages between users and admins';
COMMENT ON COLUMN public.admin_chats.user_id IS 'User who is part of the conversation';
COMMENT ON COLUMN public.admin_chats.admin_id IS 'Admin who sent/received the message (NULL if user sent)';
COMMENT ON COLUMN public.admin_chats.sender_type IS 'Who sent the message: user or admin';
COMMENT ON COLUMN public.admin_chats.is_read IS 'Whether the message has been read';

-- Enable Row Level Security
ALTER TABLE public.admin_chats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.admin_chats;
DROP POLICY IF EXISTS "Users can send messages" ON public.admin_chats;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.admin_chats;
DROP POLICY IF EXISTS "Admins can send messages" ON public.admin_chats;
DROP POLICY IF EXISTS "Admins can update messages" ON public.admin_chats;

-- RLS Policies
-- Allow users to read their own messages
CREATE POLICY "Users can view their own chat messages"
  ON public.admin_chats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own messages
CREATE POLICY "Users can send messages"
  ON public.admin_chats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND sender_type = 'user');

-- Allow admins to read all messages
CREATE POLICY "Admins can view all messages"
  ON public.admin_chats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Allow admins to insert messages
CREATE POLICY "Admins can send messages"
  ON public.admin_chats
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
    AND sender_type = 'admin'
  );

-- Allow admins to update messages (mark as read)
CREATE POLICY "Admins can update messages"
  ON public.admin_chats
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_admin_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_admin_chats_updated_at_trigger ON public.admin_chats;
CREATE TRIGGER update_admin_chats_updated_at_trigger
  BEFORE UPDATE ON public.admin_chats
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_chats_updated_at();
