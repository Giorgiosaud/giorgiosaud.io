CREATE TABLE "consent_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"ip_hash" text,
	"consent_analytics" boolean DEFAULT false NOT NULL,
	"consent_marketing" boolean DEFAULT false NOT NULL,
	"consent_version" text NOT NULL,
	"action_type" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "consent_records_session_id_idx" ON "consent_records" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "consent_records_created_at_idx" ON "consent_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "consent_records_ip_hash_idx" ON "consent_records" USING btree ("ip_hash");