-- ============================================
-- Favorite Doctors System
-- ============================================

-- Create favorite_doctors table
CREATE TABLE IF NOT EXISTS favorite_doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, doctor_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_favorite_doctors_user_id ON favorite_doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_doctors_doctor_id ON favorite_doctors(doctor_id);
CREATE INDEX IF NOT EXISTS idx_favorite_doctors_created_at ON favorite_doctors(created_at DESC);

-- ============================================
-- Helper Functions
-- ============================================

-- Function to toggle favorite (add or remove)
CREATE OR REPLACE FUNCTION toggle_favorite_doctor(p_user_id UUID, p_doctor_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_existing_id UUID;
  v_result JSONB;
BEGIN
  -- Check if already favorited
  SELECT id INTO v_existing_id
  FROM favorite_doctors
  WHERE user_id = p_user_id AND doctor_id = p_doctor_id;

  IF v_existing_id IS NOT NULL THEN
    -- Remove from favorites
    DELETE FROM favorite_doctors WHERE id = v_existing_id;
    v_result := jsonb_build_object(
      'action', 'removed',
      'is_favorite', false,
      'message', 'Doctor removed from favorites'
    );
  ELSE
    -- Add to favorites
    INSERT INTO favorite_doctors (user_id, doctor_id)
    VALUES (p_user_id, p_doctor_id);
    v_result := jsonb_build_object(
      'action', 'added',
      'is_favorite', true,
      'message', 'Doctor added to favorites'
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to check if doctor is favorited by user
CREATE OR REPLACE FUNCTION is_doctor_favorited(p_user_id UUID, p_doctor_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM favorite_doctors
    WHERE user_id = p_user_id AND doctor_id = p_doctor_id
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's favorite doctors count
CREATE OR REPLACE FUNCTION get_user_favorites_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM favorite_doctors
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE favorite_doctors IS 'Stores user favorite doctors for quick access';
COMMENT ON FUNCTION toggle_favorite_doctor(UUID, UUID) IS 'Add or remove doctor from favorites';
COMMENT ON FUNCTION is_doctor_favorited(UUID, UUID) IS 'Check if doctor is in user favorites';
COMMENT ON FUNCTION get_user_favorites_count(UUID) IS 'Get total count of user favorites';
