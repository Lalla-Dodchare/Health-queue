-- ============================================
-- Notification System Database Schema
-- ============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success', 'error', 'appointment', 'payment'
  is_read BOOLEAN DEFAULT FALSE,
  related_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  related_payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  action_url TEXT, -- Optional URL for "View Details" button
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- Sample Notification Data (For Testing)
-- ============================================

-- Function to create notification for appointment confirmation
CREATE OR REPLACE FUNCTION create_appointment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- When appointment is confirmed, create notification
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    INSERT INTO notifications (user_id, title, message, type, related_appointment_id, action_url)
    VALUES (
      NEW.user_id,
      'Appointment Confirmed',
      'Your appointment has been confirmed. Please arrive 15 minutes early.',
      'success',
      NEW.id,
      '/dashboard/appointments'
    );
  END IF;

  -- When appointment is cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    INSERT INTO notifications (user_id, title, message, type, related_appointment_id, action_url)
    VALUES (
      NEW.user_id,
      'Appointment Cancelled',
      'Your appointment has been cancelled.',
      'warning',
      NEW.id,
      '/dashboard/appointments'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment notifications
DROP TRIGGER IF EXISTS appointment_notification_trigger ON appointments;
CREATE TRIGGER appointment_notification_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_appointment_notification();

-- Function to create notification for payment verification
CREATE OR REPLACE FUNCTION create_payment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- When payment is verified
  IF NEW.payment_status = 'verified' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'verified') THEN
    INSERT INTO notifications (user_id, title, message, type, related_payment_id, action_url)
    VALUES (
      NEW.user_id,
      'Payment Verified',
      CONCAT('Your payment of ฿', NEW.amount, ' has been verified. You earned ', NEW.points_earned, ' points!'),
      'success',
      NEW.id,
      CONCAT('/dashboard/payment/', NEW.appointment_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment notifications
DROP TRIGGER IF EXISTS payment_notification_trigger ON payments;
CREATE TRIGGER payment_notification_trigger
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION create_payment_notification();

-- ============================================
-- Helper Functions
-- ============================================

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = notification_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to mark all user notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND is_read = FALSE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to delete old read notifications (cleanup)
CREATE OR REPLACE FUNCTION delete_old_notifications(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE is_read = TRUE
    AND read_at < NOW() - INTERVAL '1 day' * days_old;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE notifications IS 'Stores user notifications for appointments, payments, and system messages';
COMMENT ON COLUMN notifications.type IS 'Notification type: info, warning, success, error, appointment, payment';
COMMENT ON COLUMN notifications.action_url IS 'Optional URL for notification action button';
COMMENT ON FUNCTION create_appointment_notification() IS 'Auto-create notifications when appointment status changes';
COMMENT ON FUNCTION create_payment_notification() IS 'Auto-create notifications when payment is verified';
COMMENT ON FUNCTION mark_notification_read(UUID) IS 'Mark a single notification as read';
COMMENT ON FUNCTION mark_all_notifications_read(UUID) IS 'Mark all user notifications as read';
COMMENT ON FUNCTION delete_old_notifications(INTEGER) IS 'Delete read notifications older than specified days (default 30)';
