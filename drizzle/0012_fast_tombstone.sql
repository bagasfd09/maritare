CREATE TYPE "public"."guest_group_icon_style" AS ENUM('name', 'avatar');--> statement-breakpoint
ALTER TABLE "guest_groups" ADD COLUMN "icon_style" "guest_group_icon_style" DEFAULT 'name' NOT NULL;