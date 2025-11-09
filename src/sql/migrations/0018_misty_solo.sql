CREATE TYPE "public"."diary_media_type" AS ENUM('video', 'photo');--> statement-breakpoint
CREATE TABLE "diary_media" (
	"media_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "diary_media_media_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"diary_id" bigint NOT NULL,
	"type" "diary_media_type" NOT NULL,
	"url" text NOT NULL,
	"order_index" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "diary_entries" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "diary_entries" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "diary_exercises" ADD COLUMN "order_index" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "diary_media" ADD CONSTRAINT "diary_media_diary_id_diary_entries_diary_id_fk" FOREIGN KEY ("diary_id") REFERENCES "public"."diary_entries"("diary_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_diary_media_diary" ON "diary_media" USING btree ("diary_id");--> statement-breakpoint
CREATE INDEX "idx_diary_media_order" ON "diary_media" USING btree ("diary_id","order_index");