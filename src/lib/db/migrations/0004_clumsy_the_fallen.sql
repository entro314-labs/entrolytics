CREATE TABLE "cli_setup_token" (
	"token_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(128) NOT NULL,
	"user_id" uuid NOT NULL,
	"website_id" uuid NOT NULL,
	"org_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"purpose" varchar(50) DEFAULT 'cli-init' NOT NULL,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	CONSTRAINT "cli_setup_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "onboarding_step" (
	"step_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"step" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	"metadata" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_completed" varchar(5) DEFAULT 'false';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_step" varchar(50) DEFAULT 'welcome';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_skipped" varchar(5) DEFAULT 'false';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "company_size" varchar(50);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "industry" varchar(100);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "use_case" varchar(500);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "referral_source" varchar(100);--> statement-breakpoint
CREATE UNIQUE INDEX "cli_setup_token_token_idx" ON "cli_setup_token" USING btree ("token");--> statement-breakpoint
CREATE INDEX "cli_setup_token_user_id_idx" ON "cli_setup_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cli_setup_token_status_idx" ON "cli_setup_token" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cli_setup_token_expires_at_idx" ON "cli_setup_token" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "cli_setup_token_website_id_idx" ON "cli_setup_token" USING btree ("website_id");--> statement-breakpoint
CREATE INDEX "onboarding_step_user_id_idx" ON "onboarding_step" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "onboarding_step_created_at_idx" ON "onboarding_step" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_onboarding_completed_idx" ON "user" USING btree ("onboarding_completed");