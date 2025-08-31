-- Migration: Complete transition to Clerk authentication
-- This migration removes legacy JWT authentication and migrates to Clerk-only

BEGIN;

-- Add new Clerk-specific columns
ALTER TABLE "user" ADD COLUMN "clerk_id" VARCHAR(255) NOT NULL DEFAULT 'temp_' || gen_random_uuid()::text;
ALTER TABLE "user" ADD COLUMN "email" VARCHAR(255) NOT NULL DEFAULT 'migration@entrolytics.temp';
ALTER TABLE "user" ADD COLUMN "first_name" VARCHAR(255);
ALTER TABLE "user" ADD COLUMN "last_name" VARCHAR(255);
ALTER TABLE "user" ADD COLUMN "image_url" VARCHAR(2183);

-- Add default role for existing users
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user';

-- Remove legacy authentication columns
ALTER TABLE "user" DROP COLUMN "username";
ALTER TABLE "user" DROP COLUMN "password";
ALTER TABLE "user" DROP COLUMN "logo_url";

-- Create unique constraint for clerk_id
CREATE UNIQUE INDEX "user_clerk_id_key" ON "user"("clerk_id");

-- Create index on email for faster lookups
CREATE INDEX "user_email_idx" ON "user"("email");

-- Remove the temporary defaults after adding constraints
ALTER TABLE "user" ALTER COLUMN "clerk_id" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "email" DROP DEFAULT;

COMMIT;

-- Note: After this migration, all authentication must go through Clerk
-- Existing users will need to be synced with Clerk user data