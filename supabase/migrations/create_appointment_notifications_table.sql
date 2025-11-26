-- สร้างตารางสำหรับ track การส่ง SMS แจ้งเตือน
CREATE TABLE IF NOT EXISTS appointment_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('3_days', '1_day', '6_hours')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Index สำหรับเช็คว่าส่งแล้วหรือยัง
  UNIQUE(appointment_id, reminder_type)
);

-- Index สำหรับ query ที่เร็วขึ้น
CREATE INDEX idx_appointment_notifications_appointment ON appointment_notifications(appointment_id);
CREATE INDEX idx_appointment_notifications_type ON appointment_notifications(reminder_type);
CREATE INDEX idx_appointment_notifications_sent_at ON appointment_notifications(sent_at);

-- Enable RLS
ALTER TABLE appointment_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: ผู้ใช้สามารถดูการแจ้งเตือนของตัวเองได้
CREATE POLICY "Users can view their own appointment notifications"
  ON appointment_notifications
  FOR SELECT
  USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE user_id = auth.uid()
    )
  );

-- Policy: Service role สามารถทำอะไรก็ได้
CREATE POLICY "Service role can manage all notifications"
  ON appointment_notifications
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

COMMENT ON TABLE appointment_notifications IS 'ตารางสำหรับ track การส่ง SMS แจ้งเตือนนัดหมาย เพื่อป้องกันการส่งซ้ำ';
COMMENT ON COLUMN appointment_notifications.reminder_type IS '3_days = แจ้งเตือน 3 วันก่อน, 1_day = 1 วันก่อน, 6_hours = 6 ชั่วโมงก่อน';
