CREATE TABLE "guestbook_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"label" text NOT NULL,
	"code" text NOT NULL,
	"session_nonce" text,
	"last_seen_at" timestamp with time zone,
	"last_device" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "guestbook_tokens_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "guestbook_limit" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "guestbook_tokens" ADD CONSTRAINT "guestbook_tokens_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;