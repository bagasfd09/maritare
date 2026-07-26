ALTER TABLE "promos" ADD COLUMN "package_id" uuid;--> statement-breakpoint
ALTER TABLE "promos" ADD COLUMN "allowed_user_ids" uuid[];--> statement-breakpoint
ALTER TABLE "promos" ADD CONSTRAINT "promos_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;