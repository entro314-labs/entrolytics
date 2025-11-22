CREATE TABLE IF NOT EXISTS "board" (
	"board_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(500),
	"config" json,
	"user_id" uuid,
	"org_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "board_created_at_idx" ON "board" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "board_org_id_idx" ON "board" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "board_user_id_idx" ON "board" USING btree ("user_id");