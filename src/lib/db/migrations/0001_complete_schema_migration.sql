-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint

-- CreateTable
CREATE TABLE IF NOT EXISTS "user" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone,
	"deleted_at" timestamp(6) with time zone,
	"display_name" varchar(255),
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"image_url" varchar(2183)
);
--> statement-breakpoint

-- CreateTable
CREATE TABLE IF NOT EXISTS "session" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"website_id" uuid NOT NULL,
	"browser" varchar(20),
	"os" varchar(20),
	"device" varchar(20),
	"screen" varchar(11),
	"language" varchar(35),
	"country" char(2),
	"region" varchar(20),
	"city" varchar(50),
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"distinct_id" varchar(50)
);
--> statement-breakpoint

-- CreateTable
CREATE TABLE IF NOT EXISTS "website" (
	"website_id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"domain" varchar(500),
	"share_id" varchar(50),
	"reset_at" timestamp(6) with time zone,
	"user_id" uuid,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone,
	"deleted_at" timestamp(6) with time zone,
	"created_by" uuid,
	"org_id" uuid
);
--> statement-breakpoint

-- CreateTable
CREATE TABLE IF NOT EXISTS "website_event" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"website_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"url_path" varchar(500) NOT NULL,
	"url_query" varchar(500),
	"referrer_path" varchar(500),
	"referrer_query" varchar(500),
	"referrer_domain" varchar(500),
	"page_title" varchar(500),
	"event_type" integer DEFAULT 1 NOT NULL,
	"event_name" varchar(50),
	"visit_id" uuid NOT NULL,
	"tag" varchar(50),
	"fbclid" varchar(255),
	"gclid" varchar(255),
	"li_fat_id" varchar(255),
	"msclkid" varchar(255),
	"ttclid" varchar(255),
	"twclid" varchar(255),
	"utm_campaign" varchar(255),
	"utm_content" varchar(255),
	"utm_medium" varchar(255),
	"utm_source" varchar(255),
	"utm_term" varchar(255),
	"hostname" varchar(100)
);
--> statement-breakpoint

-- CreateTable
CREATE TABLE IF NOT EXISTS "event_data" (
	"event_data_id" uuid PRIMARY KEY NOT NULL,
	"website_id" uuid NOT NULL,
	"website_event_id" uuid NOT NULL,
	"data_key" varchar(500) NOT NULL,
	"string_value" varchar(500),
	"number_value" numeric(19, 4),
	"date_value" timestamp(6) with time zone,
	"data_type" integer NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

-- CreateTable
CREATE TABLE IF NOT EXISTS "org" (
	"org_id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"access_code" varchar(50),
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone,
	"deleted_at" timestamp(6) with time zone,
	"logo_url" varchar(2183)
);
--> statement-breakpoint

-- CreateTable
CREATE TABLE IF NOT EXISTS "org_user" (
	"org_user_id" uuid PRIMARY KEY NOT NULL,
	"org_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone
);
--> statement-breakpoint

-- CreateTable
CREATE TABLE IF NOT EXISTS "session_data" (
	"session_data_id" uuid PRIMARY KEY NOT NULL,
	"website_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"data_key" varchar(500) NOT NULL,
	"string_value" varchar(500),
	"number_value" numeric(19, 4),
	"date_value" timestamp(6) with time zone,
	"data_type" integer NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"distinct_id" varchar(50)
);
--> statement-breakpoint

-- CreateTable
CREATE TABLE IF NOT EXISTS "report" (
	"report_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"website_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" varchar(500) NOT NULL,
	"parameters" jsonb NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone
);
--> statement-breakpoint

-- CreateTable
CREATE TABLE IF NOT EXISTS "segment" (
	"segment_id" uuid PRIMARY KEY NOT NULL,
	"website_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"name" varchar(200) NOT NULL,
	"parameters" jsonb NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone
);
--> statement-breakpoint

-- CreateTable
CREATE TABLE IF NOT EXISTS "revenue" (
	"revenue_id" uuid PRIMARY KEY NOT NULL,
	"website_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"event_name" varchar(50) NOT NULL,
	"currency" varchar(10) NOT NULL,
	"revenue" numeric(19, 4),
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

-- CreateTable
CREATE TABLE IF NOT EXISTS "link" (
	"link_id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"url" varchar(500) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"user_id" uuid,
	"org_id" uuid,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone,
	"deleted_at" timestamp(6) with time zone
);
--> statement-breakpoint

-- CreateTable
CREATE TABLE IF NOT EXISTS "pixel" (
	"pixel_id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"user_id" uuid,
	"org_id" uuid,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone,
	"deleted_at" timestamp(6) with time zone
);
--> statement-breakpoint

-- CreateIndex (User table)
CREATE UNIQUE INDEX IF NOT EXISTS "user_user_id_key" ON "user"("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_clerk_id_key" ON "user"("clerk_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "user"("email");
--> statement-breakpoint

-- CreateIndex (Session table)
CREATE UNIQUE INDEX IF NOT EXISTS "session_session_id_key" ON "session"("session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_created_at_idx" ON "session"("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_website_id_idx" ON "session"("website_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_website_id_created_at_idx" ON "session"("website_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_website_id_created_at_browser_idx" ON "session"("website_id", "created_at", "browser");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_website_id_created_at_os_idx" ON "session"("website_id", "created_at", "os");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_website_id_created_at_device_idx" ON "session"("website_id", "created_at", "device");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_website_id_created_at_screen_idx" ON "session"("website_id", "created_at", "screen");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_website_id_created_at_language_idx" ON "session"("website_id", "created_at", "language");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_website_id_created_at_country_idx" ON "session"("website_id", "created_at", "country");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_website_id_created_at_region_idx" ON "session"("website_id", "created_at", "region");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_website_id_created_at_city_idx" ON "session"("website_id", "created_at", "city");
--> statement-breakpoint

-- CreateIndex (Website table)
CREATE UNIQUE INDEX IF NOT EXISTS "website_website_id_key" ON "website"("website_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "website_share_id_key" ON "website"("share_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_user_id_idx" ON "website"("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_created_at_idx" ON "website"("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_share_id_idx" ON "website"("share_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_org_id_idx" ON "website"("org_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_created_by_idx" ON "website"("created_by");
--> statement-breakpoint

-- CreateIndex (Website Event table)
CREATE INDEX IF NOT EXISTS "website_event_created_at_idx" ON "website_event"("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_event_session_id_idx" ON "website_event"("session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_event_website_id_idx" ON "website_event"("website_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_event_website_id_created_at_idx" ON "website_event"("website_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_event_website_id_session_id_created_at_idx" ON "website_event"("website_id", "session_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_event_website_id_created_at_url_path_idx" ON "website_event"("website_id", "created_at", "url_path");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_event_website_id_created_at_url_query_idx" ON "website_event"("website_id", "created_at", "url_query");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_event_website_id_created_at_referrer_domain_idx" ON "website_event"("website_id", "created_at", "referrer_domain");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_event_website_id_created_at_page_title_idx" ON "website_event"("website_id", "created_at", "page_title");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_event_website_id_created_at_event_name_idx" ON "website_event"("website_id", "created_at", "event_name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_event_visit_id_idx" ON "website_event"("visit_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_event_website_id_visit_id_created_at_idx" ON "website_event"("website_id", "visit_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_event_website_id_created_at_tag_idx" ON "website_event"("website_id", "created_at", "tag");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_event_website_id_created_at_hostname_idx" ON "website_event"("website_id", "created_at", "hostname");
--> statement-breakpoint

-- CreateIndex (Event Data table)
CREATE INDEX IF NOT EXISTS "event_data_created_at_idx" ON "event_data"("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_data_website_id_idx" ON "event_data"("website_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_data_website_event_id_idx" ON "event_data"("website_event_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_data_website_id_created_at_idx" ON "event_data"("website_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_data_website_id_created_at_data_key_idx" ON "event_data"("website_id", "created_at", "data_key");
--> statement-breakpoint

-- CreateIndex (Org table)
CREATE UNIQUE INDEX IF NOT EXISTS "org_org_id_key" ON "org"("org_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "org_access_code_key" ON "org"("access_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_access_code_idx" ON "org"("access_code");
--> statement-breakpoint

-- CreateIndex (Org User table)
CREATE UNIQUE INDEX IF NOT EXISTS "org_user_org_user_id_key" ON "org_user"("org_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_user_org_id_idx" ON "org_user"("org_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_user_user_id_idx" ON "org_user"("user_id");
--> statement-breakpoint

-- CreateIndex (Session Data table)
CREATE INDEX IF NOT EXISTS "session_data_created_at_idx" ON "session_data"("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_data_website_id_idx" ON "session_data"("website_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_data_session_id_idx" ON "session_data"("session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_data_session_id_created_at_idx" ON "session_data"("session_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_data_website_id_created_at_data_key_idx" ON "session_data"("website_id", "created_at", "data_key");
--> statement-breakpoint

-- CreateIndex (Report table)
CREATE UNIQUE INDEX IF NOT EXISTS "report_report_id_key" ON "report"("report_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "report_user_id_idx" ON "report"("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "report_website_id_idx" ON "report"("website_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "report_type_idx" ON "report"("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "report_name_idx" ON "report"("name");
--> statement-breakpoint

-- CreateIndex (Segment table)
CREATE UNIQUE INDEX IF NOT EXISTS "segment_segment_id_key" ON "segment"("segment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "segment_website_id_idx" ON "segment"("website_id");
--> statement-breakpoint

-- CreateIndex (Revenue table)
CREATE UNIQUE INDEX IF NOT EXISTS "revenue_revenue_id_key" ON "revenue"("revenue_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "revenue_website_id_idx" ON "revenue"("website_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "revenue_session_id_idx" ON "revenue"("session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "revenue_website_id_created_at_idx" ON "revenue"("website_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "revenue_website_id_session_id_created_at_idx" ON "revenue"("website_id", "session_id", "created_at");
--> statement-breakpoint

-- CreateIndex (Link table)
CREATE UNIQUE INDEX IF NOT EXISTS "link_link_id_key" ON "link"("link_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "link_slug_key" ON "link"("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "link_slug_idx" ON "link"("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "link_user_id_idx" ON "link"("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "link_org_id_idx" ON "link"("org_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "link_created_at_idx" ON "link"("created_at");
--> statement-breakpoint

-- CreateIndex (Pixel table)
CREATE UNIQUE INDEX IF NOT EXISTS "pixel_pixel_id_key" ON "pixel"("pixel_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pixel_slug_key" ON "pixel"("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pixel_slug_idx" ON "pixel"("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pixel_user_id_idx" ON "pixel"("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pixel_org_id_idx" ON "pixel"("org_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pixel_created_at_idx" ON "pixel"("created_at");
--> statement-breakpoint

-- AddSystemUser (only if not exists)
INSERT INTO "user" (user_id, clerk_id, email, role)
VALUES ('41e2b680-648e-4b09-bcd7-3e2b10c06264', 'admin_clerk_id', 'dominikos.pritis@gmail.com', 'admin')
ON CONFLICT (user_id) DO NOTHING;
