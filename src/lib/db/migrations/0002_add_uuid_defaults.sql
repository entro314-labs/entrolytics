ALTER TABLE "event_data" ALTER COLUMN "event_data_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "link" ALTER COLUMN "link_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "org" ALTER COLUMN "org_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "website" ALTER COLUMN "website_id" SET DEFAULT gen_random_uuid();