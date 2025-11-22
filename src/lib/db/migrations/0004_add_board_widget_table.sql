CREATE TABLE IF NOT EXISTS "board_widget" (
	"widget_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_id" uuid NOT NULL,
	"website_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(100),
	"config" json,
	"position" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "board_widget_board_id_idx" ON "board_widget" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "board_widget_website_id_idx" ON "board_widget" USING btree ("website_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "board_widget_board_id_position_idx" ON "board_widget" USING btree ("board_id","position");