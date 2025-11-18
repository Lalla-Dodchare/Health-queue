-- ============================================
-- Doctor Reviews and Rating System
-- ============================================

-- Create doctor_reviews table
CREATE TABLE IF NOT EXISTS doctor_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, appointment_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_doctor_id ON doctor_reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_user_id ON doctor_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_rating ON doctor_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_created_at ON doctor_reviews(created_at DESC);

-- ============================================
-- Calculate Doctor Average Rating
-- ============================================

-- Function to calculate doctor's average rating
CREATE OR REPLACE FUNCTION calculate_doctor_rating(p_doctor_id UUID)
RETURNS TABLE(
  average_rating NUMERIC,
  total_reviews INTEGER,
  rating_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(rating)::NUMERIC, 2) as average_rating,
    COUNT(*)::INTEGER as total_reviews,
    jsonb_build_object(
      '5_star', COUNT(*) FILTER (WHERE rating = 5),
      '4_star', COUNT(*) FILTER (WHERE rating = 4),
      '3_star', COUNT(*) FILTER (WHERE rating = 3),
      '2_star', COUNT(*) FILTER (WHERE rating = 2),
      '1_star', COUNT(*) FILTER (WHERE rating = 1)
    ) as rating_breakdown
  FROM doctor_reviews
  WHERE doctor_id = p_doctor_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Add Rating Columns to Doctors Table
-- ============================================

-- Add average_rating and review_count to doctors table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='doctors' AND column_name='average_rating') THEN
    ALTER TABLE doctors ADD COLUMN average_rating NUMERIC(3,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='doctors' AND column_name='review_count') THEN
    ALTER TABLE doctors ADD COLUMN review_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- Trigger to Update Doctor Rating
-- ============================================

-- Function to update doctor's average rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_doctor_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_doctor_id UUID;
  v_avg_rating NUMERIC;
  v_review_count INTEGER;
BEGIN
  -- Get doctor_id from NEW or OLD
  IF TG_OP = 'DELETE' THEN
    v_doctor_id := OLD.doctor_id;
  ELSE
    v_doctor_id := NEW.doctor_id;
  END IF;

  -- Calculate new average and count
  SELECT
    COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0),
    COALESCE(COUNT(*), 0)
  INTO v_avg_rating, v_review_count
  FROM doctor_reviews
  WHERE doctor_id = v_doctor_id;

  -- Update doctors table
  UPDATE doctors
  SET
    average_rating = v_avg_rating,
    review_count = v_review_count
  WHERE id = v_doctor_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_doctor_rating_trigger ON doctor_reviews;
CREATE TRIGGER update_doctor_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON doctor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_rating();

-- ============================================
-- Helper Function: Check if user can review
-- ============================================

CREATE OR REPLACE FUNCTION can_user_review_doctor(p_user_id UUID, p_doctor_id UUID, p_appointment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_appointment_exists BOOLEAN;
  v_appointment_completed BOOLEAN;
  v_already_reviewed BOOLEAN;
BEGIN
  -- Check if appointment exists and belongs to user and doctor
  SELECT EXISTS (
    SELECT 1 FROM appointments
    WHERE id = p_appointment_id
      AND user_id = p_user_id
      AND doctor_id = p_doctor_id
  ) INTO v_appointment_exists;

  IF NOT v_appointment_exists THEN
    RETURN FALSE;
  END IF;

  -- Check if appointment is completed (in the past)
  SELECT (appointment_date < CURRENT_DATE) OR (appointment_date = CURRENT_DATE AND appointment_time < CURRENT_TIME)
  INTO v_appointment_completed
  FROM appointments
  WHERE id = p_appointment_id;

  IF NOT v_appointment_completed THEN
    RETURN FALSE;
  END IF;

  -- Check if user already reviewed this appointment
  SELECT EXISTS (
    SELECT 1 FROM doctor_reviews
    WHERE user_id = p_user_id
      AND appointment_id = p_appointment_id
  ) INTO v_already_reviewed;

  IF v_already_reviewed THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Sample Data (For Testing)
-- ============================================

-- This will be populated by actual user reviews
-- You can insert test data manually if needed

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE doctor_reviews IS 'Stores patient reviews and ratings for doctors';
COMMENT ON COLUMN doctor_reviews.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN doctor_reviews.appointment_id IS 'Optional: Link review to specific appointment';
COMMENT ON FUNCTION calculate_doctor_rating(UUID) IS 'Calculate average rating and breakdown for a doctor';
COMMENT ON FUNCTION update_doctor_rating() IS 'Trigger function to update doctor average_rating and review_count';
COMMENT ON FUNCTION can_user_review_doctor(UUID, UUID, UUID) IS 'Check if user is eligible to review doctor';
