-- ============================================
-- Payment and Points System Database Schema
-- ============================================
-- This file creates tables and functions for:
-- 1. Payment processing and tracking
-- 2. Points/loyalty rewards system
-- 3. Transaction history
-- ============================================

-- ============================================
-- 1. Add points column to profiles table
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0 CHECK (points >= 0);

COMMENT ON COLUMN profiles.points IS 'Current loyalty points balance (100 baht = 1 point)';

-- ============================================
-- 2. Create payments table
-- ============================================
-- Drop table if exists (for clean install)
DROP TABLE IF EXISTS payments CASCADE;

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL,
  user_id UUID NOT NULL,

  -- Payment details
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  payment_method VARCHAR(50) DEFAULT 'qr_code', -- qr_code, cash, card
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'cancelled')),

  -- QR Code details (for PromptPay)
  qr_code_data TEXT, -- Generated QR code string
  qr_code_ref VARCHAR(50), -- Reference number for payment tracking

  -- Points calculation
  points_earned INTEGER DEFAULT 0 CHECK (points_earned >= 0),
  points_calculation TEXT, -- Formula used: "amount / 100 = points"

  -- Verification (by staff)
  verified_by UUID, -- Staff who verified
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign keys
  CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT payments_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  CONSTRAINT payments_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_verified_by ON payments(verified_by);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

COMMENT ON TABLE payments IS 'Payment records for appointments with QR code and verification';
COMMENT ON COLUMN payments.amount IS 'Total payment amount in Thai Baht';
COMMENT ON COLUMN payments.payment_method IS 'Payment method: qr_code (PromptPay), cash, or card';
COMMENT ON COLUMN payments.payment_status IS 'Status: pending, verified, or cancelled';
COMMENT ON COLUMN payments.points_earned IS 'Points earned from this payment (100 baht = 1 point)';
COMMENT ON COLUMN payments.verified_by IS 'Staff member who verified the payment';

-- ============================================
-- 3. Create points_history table
-- ============================================
-- Drop table if exists (for clean install)
DROP TABLE IF EXISTS points_history CASCADE;

CREATE TABLE points_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,

  -- Transaction details
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'adjusted')),
  points_change INTEGER NOT NULL, -- Positive for earned, negative for redeemed
  points_balance_after INTEGER NOT NULL CHECK (points_balance_after >= 0),

  -- Reference to source
  payment_id UUID, -- If earned from payment
  description TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign keys
  CONSTRAINT points_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT points_history_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_payment_id ON points_history(payment_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at DESC);

COMMENT ON TABLE points_history IS 'Transaction history for points earned and redeemed';
COMMENT ON COLUMN points_history.transaction_type IS 'Type: earned, redeemed, expired, or adjusted';
COMMENT ON COLUMN points_history.points_change IS 'Points added (positive) or deducted (negative)';
COMMENT ON COLUMN points_history.points_balance_after IS 'User points balance after this transaction';

-- ============================================
-- 4. Create function to add points
-- ============================================
CREATE OR REPLACE FUNCTION add_points(
  p_user_id UUID,
  p_payment_id UUID,
  p_points INTEGER,
  p_description TEXT DEFAULT 'Points earned from payment'
)
RETURNS VOID AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Update user's points balance
  UPDATE profiles
  SET points = points + p_points,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING points INTO v_new_balance;

  -- Record transaction in points_history
  INSERT INTO points_history (
    user_id,
    transaction_type,
    points_change,
    points_balance_after,
    payment_id,
    description
  ) VALUES (
    p_user_id,
    'earned',
    p_points,
    v_new_balance,
    p_payment_id,
    p_description
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_points IS 'Add points to user account and record in history';

-- ============================================
-- 5. Create function to verify payment
-- ============================================
CREATE OR REPLACE FUNCTION verify_payment(
  p_payment_id UUID,
  p_verified_by UUID,
  p_verification_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_points INTEGER;
  v_amount DECIMAL(10, 2);
BEGIN
  -- Get payment details
  SELECT user_id, points_earned, amount
  INTO v_user_id, v_points, v_amount
  FROM payments
  WHERE id = p_payment_id;

  -- Update payment status
  UPDATE payments
  SET payment_status = 'verified',
      verified_by = p_verified_by,
      verified_at = NOW(),
      verification_notes = p_verification_notes,
      updated_at = NOW()
  WHERE id = p_payment_id;

  -- Add points to user account
  PERFORM add_points(
    v_user_id,
    p_payment_id,
    v_points,
    'Points earned from payment of ' || v_amount || ' baht'
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION verify_payment IS 'Verify payment and automatically award points to user';

-- ============================================
-- 6. Create trigger to update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Enable Row Level Security (RLS)
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON payments;
DROP POLICY IF EXISTS "Staff can view all payments" ON payments;
DROP POLICY IF EXISTS "Staff can update payments" ON payments;
DROP POLICY IF EXISTS "Users can view their own points history" ON points_history;
DROP POLICY IF EXISTS "System can insert points history" ON points_history;
DROP POLICY IF EXISTS "Admin can view all points history" ON points_history;

-- Enable RLS on payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "Users can create their own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Staff and admin can view all payments
CREATE POLICY "Staff can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('staff', 'admin')
    )
  );

-- Staff and admin can update payments (for verification)
CREATE POLICY "Staff can update payments"
  ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('staff', 'admin')
    )
  );

-- Enable RLS on points_history table
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own points history
CREATE POLICY "Users can view their own points history"
  ON points_history FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert points history (via functions)
CREATE POLICY "System can insert points history"
  ON points_history FOR INSERT
  WITH CHECK (true); -- Will be controlled by functions

-- Admin can view all points history
CREATE POLICY "Admin can view all points history"
  ON points_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- 8. Grant permissions
-- ============================================

-- Grant usage on tables
GRANT SELECT, INSERT ON payments TO authenticated;
GRANT SELECT ON points_history TO authenticated;
GRANT UPDATE ON profiles TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION add_points TO authenticated;
GRANT EXECUTE ON FUNCTION verify_payment TO authenticated;

-- ============================================
-- Success message
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Payment and Points System schema created successfully!';
  RAISE NOTICE '📊 Tables created: payments, points_history';
  RAISE NOTICE '⚡ Functions created: add_points(), verify_payment()';
  RAISE NOTICE '🔒 Row Level Security policies enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test payment creation';
  RAISE NOTICE '2. Test payment verification';
  RAISE NOTICE '3. Verify points are awarded correctly';
END $$;
