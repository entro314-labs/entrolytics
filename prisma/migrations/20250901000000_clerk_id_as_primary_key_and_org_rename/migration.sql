-- Migration: Clerk Authentication Support with UUID Primary Keys
-- This migration adds Clerk support while maintaining UUID primary keys for stability
-- Keeps clerk_id as a separate unique field for external auth provider integration

BEGIN;

-- Note: This migration reflects the current stable state of the database
-- User table maintains UUID primary key (user_id) for internal relationships
-- clerk_id field stores Clerk user IDs and is unique
-- All foreign keys remain as UUIDs for data integrity

-- The User table structure after previous migration (20250831212228_add_clerk_support):
-- - user_id (UUID) - Primary key for internal database relationships
-- - clerk_id (VARCHAR) - Unique field storing Clerk user ID
-- - email, first_name, last_name, image_url - User profile data from Clerk
--
-- Foreign key relationships:
-- - website.user_id references user.user_id (UUID)
-- - org_user.user_id references user.user_id (UUID)
-- - report.user_id references user.user_id (UUID)
-- - link.user_id references user.user_id (UUID)
-- - pixel.user_id references user.user_id (UUID)

-- This migration is a no-op as the database is already in the correct state

COMMIT;

-- Post-migration notes:
-- 1. User.user_id remains as UUID primary key for stability
-- 2. User.clerk_id stores Clerk user IDs as unique VARCHAR field
-- 3. All foreign keys reference UUID primary keys for data integrity
-- 4. Authentication uses getUserByClerkId() to bridge Clerk IDs to internal UUIDs
-- 5. This design provides better stability and separation of concerns