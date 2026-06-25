CREATE TYPE "public"."wedding_member_role" AS ENUM('owner');--> statement-breakpoint
CREATE TABLE "wedding_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "wedding_member_role" DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "weddings" ADD COLUMN "invite_code" text;--> statement-breakpoint
ALTER TABLE "wedding_members" ADD CONSTRAINT "wedding_members_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_members" ADD CONSTRAINT "wedding_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "wedding_members_wedding_user_unique" ON "wedding_members" USING btree ("wedding_id","user_id");--> statement-breakpoint
ALTER TABLE "weddings" ADD CONSTRAINT "weddings_invite_code_unique" UNIQUE("invite_code");--> statement-breakpoint
-- Backfill: seed one owner membership per existing wedding from its creator.
-- Idempotent (re-runnable) via ON CONFLICT — authorization now lives here.
INSERT INTO "wedding_members" ("wedding_id", "user_id", "role")
SELECT "id", "user_id", 'owner' FROM "weddings" WHERE "deleted_at" IS NULL
ON CONFLICT ("wedding_id", "user_id") DO NOTHING;--> statement-breakpoint
-- Backfill: give existing weddings a shareable invite code (6 hex chars). Owners
-- can regenerate a fresh one from Settings; the unique constraint guards collisions.
UPDATE "weddings"
SET "invite_code" = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
WHERE "invite_code" IS NULL AND "deleted_at" IS NULL;