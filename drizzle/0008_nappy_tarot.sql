ALTER TABLE "guests" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_code_unique" UNIQUE("code");