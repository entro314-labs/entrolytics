-- Migration: Add CLI Access Token table for token revocation tracking
-- Created: 2025-11-28

CREATE TABLE IF NOT EXISTS "cli_access_token" (
  "jti" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "user"("user_id"),
  "clerk_id" varchar(255) NOT NULL,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "revoked_at" timestamp with time zone,
  "ip_address" varchar(45),
  "user_agent" varchar(500),
  "last_used_at" timestamp with time zone
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "cli_access_token_user_id_idx" ON "cli_access_token" ("user_id");
CREATE INDEX IF NOT EXISTS "cli_access_token_clerk_id_idx" ON "cli_access_token" ("clerk_id");
CREATE INDEX IF NOT EXISTS "cli_access_token_expires_at_idx" ON "cli_access_token" ("expires_at");
CREATE INDEX IF NOT EXISTS "cli_access_token_revoked_at_idx" ON "cli_access_token" ("revoked_at");
