-- Create chat_tags table for tagging users in admin chat
CREATE TABLE IF NOT EXISTS public.chat_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_color TEXT NOT NULL DEFAULT '#gray',
  tag_category TEXT CHECK (tag_category IN ('status', 'special_need', 'customer_type', 'other')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_chat_tags_user_id ON public.chat_tags(user_id);
CREATE INDEX idx_chat_tags_category ON public.chat_tags(tag_category);

-- Create unique constraint to prevent duplicate tags for same user
CREATE UNIQUE INDEX idx_chat_tags_user_tag ON public.chat_tags(user_id, tag_name);

-- Enable RLS
ALTER TABLE public.chat_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin can view all tags
CREATE POLICY "Admins can view all tags"
  ON public.chat_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admin can insert tags
CREATE POLICY "Admins can insert tags"
  ON public.chat_tags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admin can update tags
CREATE POLICY "Admins can update tags"
  ON public.chat_tags
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admin can delete tags
CREATE POLICY "Admins can delete tags"
  ON public.chat_tags
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER chat_tags_updated_at
  BEFORE UPDATE ON public.chat_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_tags_updated_at();

-- Note: Predefined tags will be managed through the tag templates system
-- No need to insert dummy data here

COMMENT ON TABLE public.chat_tags IS 'Tags for categorizing and labeling users in admin chat';
COMMENT ON COLUMN public.chat_tags.tag_category IS 'Categories: status (appointment status), special_need (special requirements), customer_type (VIP, new, etc.), other';
