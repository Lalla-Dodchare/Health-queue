-- Create canned_responses table for quick message templates
-- Allows admins to save and reuse common messages in chat

CREATE TABLE IF NOT EXISTS public.canned_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, -- Short title/name for the response
  message TEXT NOT NULL, -- The actual message content
  category TEXT CHECK (category IN ('greeting', 'inquiry', 'confirmation', 'document_request', 'general', 'other')),
  shortcut TEXT, -- Optional keyboard shortcut (e.g., "/hello", "/confirm")
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0 -- Track how often this response is used
);

-- Create indexes for faster queries
CREATE INDEX idx_canned_responses_category ON public.canned_responses(category);
CREATE INDEX idx_canned_responses_created_by ON public.canned_responses(created_by);
CREATE INDEX idx_canned_responses_shortcut ON public.canned_responses(shortcut) WHERE shortcut IS NOT NULL;

-- Create unique constraint for shortcuts (if provided)
CREATE UNIQUE INDEX idx_canned_responses_shortcut_unique ON public.canned_responses(shortcut) WHERE shortcut IS NOT NULL;

-- Enable RLS
ALTER TABLE public.canned_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin can view all canned responses
CREATE POLICY "Admins can view all canned responses"
  ON public.canned_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admin can insert canned responses
CREATE POLICY "Admins can insert canned responses"
  ON public.canned_responses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admin can update canned responses
CREATE POLICY "Admins can update canned responses"
  ON public.canned_responses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admin can delete canned responses
CREATE POLICY "Admins can delete canned responses"
  ON public.canned_responses
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_canned_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER canned_responses_updated_at
  BEFORE UPDATE ON public.canned_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_canned_responses_updated_at();

-- Insert some default canned responses as examples
INSERT INTO public.canned_responses (title, message, category, shortcut) VALUES
  -- Greetings
  ('สวัสดีครับ', 'สวัสดีครับ ยินดีให้บริการครับ มีอะไรให้ช่วยไหมครับ?', 'greeting', '/hello'),
  ('สวัสดีตอนเช้า', 'สวัสดีตอนเช้าครับ หวังว่าวันนี้จะเป็นวันที่ดีนะครับ', 'greeting', '/morning'),

  -- Inquiry
  ('ถามอาการ', 'ขอทราบอาการเบื้องต้นได้ไหมครับ? จะได้จัดการนัดหมายให้เหมาะสมครับ', 'inquiry', '/symptoms'),
  ('ถามแพทย์ที่ต้องการ', 'มีแพทย์ท่านใดที่ต้องการพบเป็นพิเศษหรือไม่ครับ?', 'inquiry', '/doctor'),

  -- Confirmation
  ('ยืนยันนัด', 'ยืนยันการนัดหมายเรียบร้อยแล้วครับ เราจะส่งรายละเอียดให้ทางอีเมลและ SMS ครับ', 'confirmation', '/confirm'),
  ('รับทราบ', 'รับทราบครับ ขอบคุณสำหรับข้อมูลครับ', 'confirmation', '/noted'),

  -- Document Request
  ('ขอใบส่งตัว', 'กรุณาส่งใบส่งตัวจากแพทย์มาด้วยครับ สามารถถ่ายรูปหรือสแกนส่งมาได้เลยครับ', 'document_request', '/referral'),
  ('ขอผลแล็บ', 'หากมีผลตรวจแล็บล่าสุด กรุณาส่งมาด้วยครับ จะได้ให้แพทย์พิจารณาประกอบการรักษาครับ', 'document_request', '/lab'),

  -- General
  ('เวลาทำการ', 'เวลาทำการของเรา: จันทร์-ศุกร์ 08:00-17:00 น., เสาร์ 08:00-12:00 น. (ปิดทำการวันอาทิตย์)', 'general', '/hours'),
  ('ขอบคุณ', 'ขอบคุณที่ใช้บริการครับ หากมีข้อสงสัยเพิ่มเติมสามารถสอบถามได้ตลอดเวลาครับ', 'general', '/thanks')

ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.canned_responses IS 'Quick message templates for admin chat responses';
COMMENT ON COLUMN public.canned_responses.category IS 'Categories: greeting, inquiry, confirmation, document_request, general, other';
COMMENT ON COLUMN public.canned_responses.shortcut IS 'Optional keyboard shortcut (e.g., /hello) for quick access';
COMMENT ON COLUMN public.canned_responses.usage_count IS 'Tracks how many times this response has been used';
