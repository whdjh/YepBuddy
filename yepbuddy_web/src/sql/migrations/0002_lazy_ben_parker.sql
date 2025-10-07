CREATE TYPE "public"."level" AS ENUM('high', 'mid', 'low');--> statement-breakpoint
CREATE TABLE "body_parts" (
	"body_part_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "body_parts_body_part_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diary_entries" (
	"diary_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "diary_entries_diary_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"profile_id" uuid NOT NULL,
	"date" date NOT NULL,
	"sleep_level" "level" DEFAULT 'mid' NOT NULL,
	"condition_level" "level" DEFAULT 'mid' NOT NULL,
	"activity_level" "level" DEFAULT 'mid' NOT NULL,
	"comment" text,
	"signature_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diary_exercise_sets" (
	"set_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "diary_exercise_sets_set_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"exercise_id" bigint NOT NULL,
	"weight" text NOT NULL,
	"reps" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diary_exercises" (
	"exercise_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "diary_exercises_exercise_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"diary_id" bigint NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diary_selected_body_parts" (
	"diary_id" bigint NOT NULL,
	"body_part_id" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_exercise_sets" ADD CONSTRAINT "diary_exercise_sets_exercise_id_diary_exercises_exercise_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."diary_exercises"("exercise_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_exercises" ADD CONSTRAINT "diary_exercises_diary_id_diary_entries_diary_id_fk" FOREIGN KEY ("diary_id") REFERENCES "public"."diary_entries"("diary_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_selected_body_parts" ADD CONSTRAINT "diary_selected_body_parts_diary_id_diary_entries_diary_id_fk" FOREIGN KEY ("diary_id") REFERENCES "public"."diary_entries"("diary_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_selected_body_parts" ADD CONSTRAINT "diary_selected_body_parts_body_part_id_body_parts_body_part_id_fk" FOREIGN KEY ("body_part_id") REFERENCES "public"."body_parts"("body_part_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_body_parts_name" ON "body_parts" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_diary_profile_date" ON "diary_entries" USING btree ("profile_id","date");--> statement-breakpoint
CREATE INDEX "idx_sets_exercise" ON "diary_exercise_sets" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "idx_exercises_diary" ON "diary_exercises" USING btree ("diary_id");--> statement-breakpoint
CREATE INDEX "pk_diary_bodypart" ON "diary_selected_body_parts" USING btree ("diary_id","body_part_id");--> statement-breakpoint
CREATE INDEX "idx_diary_bodypart_diary" ON "diary_selected_body_parts" USING btree ("diary_id");--> statement-breakpoint
CREATE INDEX "idx_diary_bodypart_part" ON "diary_selected_body_parts" USING btree ("body_part_id");