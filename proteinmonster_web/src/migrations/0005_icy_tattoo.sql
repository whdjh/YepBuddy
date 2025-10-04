CREATE TABLE "proteins" (
	"protein_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "proteins_protein_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"weight" text NOT NULL,
	"avatarFile" text NOT NULL,
	"topic" text NOT NULL,
	"taste" text NOT NULL,
	"price" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proteins_likes" (
	"protein_id" bigint,
	"profile_id" uuid,
	CONSTRAINT "proteins_likes_protein_id_profile_id_pk" PRIMARY KEY("protein_id","profile_id")
);
--> statement-breakpoint
ALTER TABLE "gyms" RENAME COLUMN "gym" TO "title";--> statement-breakpoint
ALTER TABLE "proteins_likes" ADD CONSTRAINT "proteins_likes_protein_id_proteins_protein_id_fk" FOREIGN KEY ("protein_id") REFERENCES "public"."proteins"("protein_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proteins_likes" ADD CONSTRAINT "proteins_likes_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;