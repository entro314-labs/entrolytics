-- Migration: Add onboarding tables and user onboarding fields
-- Generated: 2025-11-24

-- Add onboarding fields to user table (if they don't exist)
DO $$
BEGIN
  -- Add onboarding_completed column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='user' AND column_name='onboarding_completed') THEN
    ALTER TABLE "user" ADD COLUMN "onboarding_completed" varchar(5) DEFAULT 'false';
  END IF;

  -- Add onboarding_completed_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='user' AND column_name='onboarding_completed_at') THEN
    ALTER TABLE "user" ADD COLUMN "onboarding_completed_at" timestamp with time zone;
  END IF;

  -- Add onboarding_step column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='user' AND column_name='onboarding_step') THEN
    ALTER TABLE "user" ADD COLUMN "onboarding_step" varchar(50) DEFAULT 'welcome';
  END IF;

  -- Add onboarding_skipped column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='user' AND column_name='onboarding_skipped') THEN
    ALTER TABLE "user" ADD COLUMN "onboarding_skipped" varchar(5) DEFAULT 'false';
  END IF;

  -- Add company_size column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='user' AND column_name='company_size') THEN
    ALTER TABLE "user" ADD COLUMN "company_size" varchar(50);
  END IF;

  -- Add industry column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='user' AND column_name='industry') THEN
    ALTER TABLE "user" ADD COLUMN "industry" varchar(100);
  END IF;

  -- Add use_case column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='user' AND column_name='use_case') THEN
    ALTER TABLE "user" ADD COLUMN "use_case" varchar(500);
  END IF;

  -- Add referral_source column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='user' AND column_name='referral_source') THEN
    ALTER TABLE "user" ADD COLUMN "referral_source" varchar(100);
  END IF;
END $$;
--> statement-breakpoint

-- Create cli_setup_token table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS "cli_setup_token" (
  "token_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "token" varchar(128) NOT NULL UNIQUE,
  "user_id" uuid NOT NULL,
  "website_id" uuid NOT NULL,
  "org_id" uuid,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "used_at" timestamp with time zone,
  "purpose" varchar(50) DEFAULT 'cli-init' NOT NULL,
  "ip_address" varchar(45),
  "user_agent" varchar(500),
  "status" varchar(20) DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint

-- Create onboarding_step table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS "onboarding_step" (
  "step_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "step" varchar(50) NOT NULL,
  "action" varchar(50) NOT NULL,
  "metadata" json,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint

-- Create indexes for cli_setup_token (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cli_setup_token_token_idx') THEN
    CREATE UNIQUE INDEX "cli_setup_token_token_idx" ON "cli_setup_token" ("token");
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cli_setup_token_user_id_idx') THEN
    CREATE INDEX "cli_setup_token_user_id_idx" ON "cli_setup_token" ("user_id");
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cli_setup_token_status_idx') THEN
    CREATE INDEX "cli_setup_token_status_idx" ON "cli_setup_token" ("status");
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cli_setup_token_expires_at_idx') THEN
    CREATE INDEX "cli_setup_token_expires_at_idx" ON "cli_setup_token" ("expires_at");
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cli_setup_token_website_id_idx') THEN
    CREATE INDEX "cli_setup_token_website_id_idx" ON "cli_setup_token" ("website_id");
  END IF;
END $$;
--> statement-breakpoint

-- Create indexes for onboarding_step (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'onboarding_step_user_id_idx') THEN
    CREATE INDEX "onboarding_step_user_id_idx" ON "onboarding_step" ("user_id");
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'onboarding_step_created_at_idx') THEN
    CREATE INDEX "onboarding_step_created_at_idx" ON "onboarding_step" ("created_at");
  END IF;
END $$;
--> statement-breakpoint

-- Create index for user.onboarding_completed (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_onboarding_completed_idx') THEN
    CREATE INDEX "user_onboarding_completed_idx" ON "user" ("onboarding_completed");
  END IF;
END $$;
