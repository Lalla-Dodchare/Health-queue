-- Create otp_verifications table for email OTP verification during registration
-- This table stores temporary OTP codes sent to users' emails

CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index for faster lookups
  CONSTRAINT otp_verifications_email_idx UNIQUE (email, created_at)
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);

-- Create index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON otp_verifications(expires_at);

-- Auto-delete expired OTPs (cleanup function)
-- This function will run periodically to remove expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_verifications
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (Row Level Security)
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do everything (for API routes)
CREATE POLICY "Service role can manage OTPs"
  ON otp_verifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Users cannot access OTP table directly (security)
CREATE POLICY "Users cannot access OTPs"
  ON otp_verifications
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

COMMENT ON TABLE otp_verifications IS 'Stores OTP verification codes for email verification during user registration';
COMMENT ON COLUMN otp_verifications.email IS 'Email address to verify';
COMMENT ON COLUMN otp_verifications.otp IS '6-digit OTP code';
COMMENT ON COLUMN otp_verifications.expires_at IS 'OTP expiration timestamp (typically 10 minutes from creation)';
COMMENT ON COLUMN otp_verifications.verified IS 'Whether this OTP has been verified successfully';
