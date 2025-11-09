CREATE TABLE "app"."refresh_tokens" (
	"jti" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	"replaced_by" uuid,
	"user_agent" text,
	"ip" text
);
--> statement-breakpoint
ALTER TABLE "app"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_refresh_user" ON "app"."refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_expires" ON "app"."refresh_tokens" USING btree ("expires_at");