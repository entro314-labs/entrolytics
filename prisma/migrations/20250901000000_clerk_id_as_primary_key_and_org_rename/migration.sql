-- Migration: Use Clerk ID as Primary Key and Rename Org to Org
-- This migration transitions from dual UUID/clerkId system to using Clerk IDs directly as primary keys
-- Also renames Org/OrgUser models to Org/OrgUser to align with Clerk conventions

BEGIN;

-- Step 1: Drop foreign key constraints that reference user.user_id
ALTER TABLE "website" DROP CONSTRAINT IF EXISTS "website_user_id_fkey";
ALTER TABLE "website" DROP CONSTRAINT IF EXISTS "website_created_by_fkey";
ALTER TABLE "org_user" DROP CONSTRAINT IF EXISTS "org_user_user_id_fkey";
ALTER TABLE "report" DROP CONSTRAINT IF EXISTS "report_user_id_fkey";
ALTER TABLE "link" DROP CONSTRAINT IF EXISTS "link_user_id_fkey";
ALTER TABLE "pixel" DROP CONSTRAINT IF EXISTS "pixel_user_id_fkey";

-- Step 2: Create temporary mapping table to store UUID -> ClerkId mappings
CREATE TEMPORARY TABLE user_id_mapping AS 
SELECT user_id as old_uuid_id, clerk_id as new_clerk_id 
FROM "user";

-- Step 3: Update all foreign key references to use clerk_id values
UPDATE "website" SET user_id = (
  SELECT new_clerk_id FROM user_id_mapping WHERE old_uuid_id = "website".user_id::text
) WHERE user_id IS NOT NULL;

UPDATE "website" SET created_by = (
  SELECT new_clerk_id FROM user_id_mapping WHERE old_uuid_id = "website".created_by::text
) WHERE created_by IS NOT NULL;

UPDATE "org_user" SET user_id = (
  SELECT new_clerk_id FROM user_id_mapping WHERE old_uuid_id = "org_user".user_id::text
);

UPDATE "report" SET user_id = (
  SELECT new_clerk_id FROM user_id_mapping WHERE old_uuid_id = "report".user_id::text
);

UPDATE "link" SET user_id = (
  SELECT new_clerk_id FROM user_id_mapping WHERE old_uuid_id = "link".user_id::text
) WHERE user_id IS NOT NULL;

UPDATE "pixel" SET user_id = (
  SELECT new_clerk_id FROM user_id_mapping WHERE old_uuid_id = "pixel".user_id::text
) WHERE user_id IS NOT NULL;

-- Step 4: Update User table structure
-- First, rename the old primary key column
ALTER TABLE "user" RENAME COLUMN user_id TO old_user_id;

-- Set clerk_id as the new primary key
ALTER TABLE "user" DROP CONSTRAINT "user_pkey";
ALTER TABLE "user" ADD CONSTRAINT "user_pkey" PRIMARY KEY (clerk_id);

-- Rename clerk_id column to user_id (it's now the primary key)
ALTER TABLE "user" RENAME COLUMN clerk_id TO user_id;

-- Drop the old UUID column and clerk_id unique constraint
ALTER TABLE "user" DROP COLUMN old_user_id;
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_clerk_id_key";

-- Step 5: Update foreign key column types from UUID to VARCHAR(255)
ALTER TABLE "website" ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE "website" ALTER COLUMN created_by TYPE VARCHAR(255);
ALTER TABLE "org_user" ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE "report" ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE "link" ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE "pixel" ALTER COLUMN user_id TYPE VARCHAR(255);

-- Step 6: Rename Org table to Org
ALTER TABLE "org" RENAME TO "org";
ALTER TABLE "org" RENAME COLUMN org_id TO org_id;

-- Update indexes and constraints for org table
ALTER INDEX "org_pkey" RENAME TO "org_pkey";
ALTER INDEX "org_access_code_key" RENAME TO "org_access_code_key";
ALTER INDEX "org_access_code_idx" RENAME TO "org_access_code_idx";

-- Step 7: Rename OrgUser table to OrgUser and update references
ALTER TABLE "org_user" RENAME TO "org_user";
ALTER TABLE "org_user" RENAME COLUMN org_user_id TO org_user_id;
ALTER TABLE "org_user" RENAME COLUMN org_id TO org_id;

-- Update indexes for org_user table
ALTER INDEX "org_user_pkey" RENAME TO "org_user_pkey";
ALTER INDEX "org_user_org_id_idx" RENAME TO "org_user_org_id_idx";
ALTER INDEX "org_user_user_id_idx" RENAME TO "org_user_user_id_idx";

-- Step 8: Update org_id references in other tables
ALTER TABLE "website" RENAME COLUMN org_id TO org_id;
ALTER TABLE "link" RENAME COLUMN org_id TO org_id;
ALTER TABLE "pixel" RENAME COLUMN org_id TO org_id;

-- Update website indexes
ALTER INDEX "website_org_id_idx" RENAME TO "website_org_id_idx";
ALTER INDEX "link_org_id_idx" RENAME TO "link_org_id_idx";  
ALTER INDEX "pixel_org_id_idx" RENAME TO "pixel_org_id_idx";

-- Step 9: Recreate foreign key constraints with new VARCHAR types
ALTER TABLE "website" ADD CONSTRAINT "website_user_id_fkey" 
  FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE SET NULL;

ALTER TABLE "website" ADD CONSTRAINT "website_created_by_fkey" 
  FOREIGN KEY (created_by) REFERENCES "user"(user_id) ON DELETE SET NULL;

ALTER TABLE "org_user" ADD CONSTRAINT "org_user_user_id_fkey" 
  FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE;

ALTER TABLE "org_user" ADD CONSTRAINT "org_user_org_id_fkey" 
  FOREIGN KEY (org_id) REFERENCES "org"(org_id) ON DELETE CASCADE;

ALTER TABLE "report" ADD CONSTRAINT "report_user_id_fkey" 
  FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE;

ALTER TABLE "link" ADD CONSTRAINT "link_user_id_fkey" 
  FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE SET NULL;

ALTER TABLE "pixel" ADD CONSTRAINT "pixel_user_id_fkey" 
  FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE SET NULL;

ALTER TABLE "website" ADD CONSTRAINT "website_org_id_fkey" 
  FOREIGN KEY (org_id) REFERENCES "org"(org_id) ON DELETE SET NULL;

ALTER TABLE "link" ADD CONSTRAINT "link_org_id_fkey" 
  FOREIGN KEY (org_id) REFERENCES "org"(org_id) ON DELETE SET NULL;

ALTER TABLE "pixel" ADD CONSTRAINT "pixel_org_id_fkey" 
  FOREIGN KEY (org_id) REFERENCES "org"(org_id) ON DELETE SET NULL;

-- Step 10: Clean up temporary table
DROP TABLE user_id_mapping;

COMMIT;

-- Post-migration notes:
-- 1. User.id is now the Clerk user ID (VARCHAR 255)
-- 2. All foreign keys now reference Clerk IDs directly  
-- 3. Org/OrgUser renamed to Org/OrgUser for Clerk alignment
-- 4. No more dual ID conversion logic needed
-- 5. auth.userId can be used directly in queries