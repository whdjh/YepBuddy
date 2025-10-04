CREATE TABLE "gyms" (
	"gym_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gyms_gym_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"idea" text NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gyms_likes" (
	"gym_id" bigint,
	"profile_id" uuid,
	CONSTRAINT "gyms_likes_gym_id_profile_id_pk" PRIMARY KEY("gym_id","profile_id")
);
--> statement-breakpoint
ALTER TABLE "gyms_likes" ADD CONSTRAINT "gyms_likes_gym_id_gyms_gym_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("gym_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gyms_likes" ADD CONSTRAINT "gyms_likes_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;