ALTER TABLE "guests" ALTER COLUMN "side" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "guests" ALTER COLUMN "side" SET DATA TYPE text USING "side"::text;--> statement-breakpoint
ALTER TABLE "guests" ALTER COLUMN "side" SET DEFAULT 'both';--> statement-breakpoint
DROP TYPE "public"."guest_side";