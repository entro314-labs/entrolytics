-- Migration: Add CLI tokens and onboarding support
-- Created: 2025-11-24
-- Description: Adds tables and fields for CLI token-based setup and onboarding tracking

-- Add onboarding fields to user table
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS onboarding_completed VARCHAR(5) DEFAULT 'false',
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS onboarding_step VARCHAR(50) DEFAULT 'welcome',
  ADD COLUMN IF NOT EXISTS onboarding_skipped VARCHAR(5) DEFAULT 'false',
  ADD COLUMN IF NOT EXISTS company_size VARCHAR(50),
  ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
  ADD COLUMN IF NOT EXISTS use_case VARCHAR(500),
  ADD COLUMN IF NOT EXISTS referral_source VARCHAR(100);

-- Create index for onboarding queries
CREATE INDEX IF NOT EXISTS user_onboarding_completed_idx ON "user"(onboarding_completed);

-- Create CLI setup token table
CREATE TABLE IF NOT EXISTS cli_setup_token (
  token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(128) NOT NULL UNIQUE,

  -- Ownership
  user_id UUID NOT NULL,
  website_id UUID NOT NULL,
  org_id UUID,

  -- Token lifecycle
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  purpose VARCHAR(50) NOT NULL DEFAULT 'cli-init',
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
);

-- Create indexes for CLI token table
CREATE UNIQUE INDEX IF NOT EXISTS cli_setup_token_token_idx ON cli_setup_token(token);
CREATE INDEX IF NOT EXISTS cli_setup_token_user_id_idx ON cli_setup_token(user_id);
CREATE INDEX IF NOT EXISTS cli_setup_token_status_idx ON cli_setup_token(status);
CREATE INDEX IF NOT EXISTS cli_setup_token_expires_at_idx ON cli_setup_token(expires_at);
CREATE INDEX IF NOT EXISTS cli_setup_token_website_id_idx ON cli_setup_token(website_id);

-- Create onboarding step tracking table
CREATE TABLE IF NOT EXISTS onboarding_step (
  step_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  step VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for onboarding step table
CREATE INDEX IF NOT EXISTS onboarding_step_user_id_idx ON onboarding_step(user_id);
CREATE INDEX IF NOT EXISTS onboarding_step_created_at_idx ON onboarding_step(created_at);

-- Add comments for documentation
COMMENT ON TABLE cli_setup_token IS 'Stores CLI setup tokens for secure project initialization';
COMMENT ON TABLE onboarding_step IS 'Tracks user progress through onboarding flow';
COMMENT ON COLUMN "user".onboarding_completed IS 'Whether user has completed onboarding (stored as string for compatibility)';
COMMENT ON COLUMN "user".onboarding_step IS 'Current or last onboarding step';

-- Grant appropriate permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON cli_setup_token TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON onboarding_step TO your_app_user;
