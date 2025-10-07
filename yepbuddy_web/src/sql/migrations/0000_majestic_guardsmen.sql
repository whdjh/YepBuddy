-- ===== ENUMS (중복이면 무시) =====
DO $$
BEGIN
  CREATE TYPE "public"."role" AS ENUM ('trainer', 'member');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "public"."program" AS ENUM ('1:1 PT', '그룹 PT(2-3인)');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "public"."proceed" AS ENUM ('센터 방문', '방문 PT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ===== TABLES =====
CREATE TABLE "gyms" (
  "gym_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gyms_gym_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
  "title" text NOT NULL,
  "location" text NOT NULL,
  "views" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "gyms_likes" (
  "gym_id" bigint,
  "profile_id" uuid,
  CONSTRAINT "gyms_likes_gym_id_profile_id_pk" PRIMARY KEY("gym_id","profile_id")
);

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

CREATE TABLE "proteins_likes" (
  "protein_id" bigint,
  "profile_id" uuid,
  CONSTRAINT "proteins_likes_protein_id_profile_id_pk" PRIMARY KEY("protein_id","profile_id")
);

CREATE TABLE "categories" (
  "category_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
  "name" text NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "reviews" (
  "review_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reviews_review_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
  "trainer_id" bigint,
  "profile_id" uuid,
  "rating" integer NOT NULL,
  "review" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "rating_check" CHECK ("reviews"."rating" BETWEEN 1 AND 5)
);

CREATE TABLE "trainer_upvotes" (
  "trainer_id" bigint,
  "profile_id" uuid,
  CONSTRAINT "trainer_upvotes_trainer_id_profile_id_pk" PRIMARY KEY("trainer_id","profile_id")
);

CREATE TABLE "trainers" (
  "trainer_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trainers_trainer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
  "avatarFile" text,
  "name" text NOT NULL,
  "location" text,
  "program" "program" DEFAULT '1:1 PT' NOT NULL,
  "proceed" "proceed" DEFAULT '센터 방문' NOT NULL,
  "schedule" text NOT NULL,
  "intro" text NOT NULL,
  "description" text NOT NULL,
  "stats" jsonb DEFAULT '{"views":0,"reviews":0}'::jsonb NOT NULL,
  "profile_id" uuid NOT NULL,
  "category_id" bigint,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "follows" (
  "follower_id" uuid,
  "following_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "profiles" (
  "profile_id" uuid PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "role" "role" DEFAULT 'trainer' NOT NULL,
  "description" text NOT NULL,
  "location" text,
  "history" text,
  "qualifications" text NOT NULL,
  "avatarFile" text,
  "views" jsonb,
  "stats" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ===== FKs =====
ALTER TABLE "gyms_likes"
  ADD CONSTRAINT "gyms_likes_gym_id_gyms_gym_id_fk"
  FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("gym_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "gyms_likes"
  ADD CONSTRAINT "gyms_likes_profile_id_profiles_profile_id_fk"
  FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "proteins_likes"
  ADD CONSTRAINT "proteins_likes_protein_id_proteins_protein_id_fk"
  FOREIGN KEY ("protein_id") REFERENCES "public"."proteins"("protein_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "proteins_likes"
  ADD CONSTRAINT "proteins_likes_profile_id_profiles_profile_id_fk"
  FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "reviews"
  ADD CONSTRAINT "reviews_trainer_id_trainers_trainer_id_fk"
  FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("trainer_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "reviews"
  ADD CONSTRAINT "reviews_profile_id_profiles_profile_id_fk"
  FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "trainer_upvotes"
  ADD CONSTRAINT "trainer_upvotes_trainer_id_trainers_trainer_id_fk"
  FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("trainer_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "trainer_upvotes"
  ADD CONSTRAINT "trainer_upvotes_profile_id_profiles_profile_id_fk"
  FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "trainers"
  ADD CONSTRAINT "trainers_profile_id_profiles_profile_id_fk"
  FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "trainers"
  ADD CONSTRAINT "trainers_category_id_categories_category_id_fk"
  FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "follows"
  ADD CONSTRAINT "follows_follower_id_profiles_profile_id_fk"
  FOREIGN KEY ("follower_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "follows"
  ADD CONSTRAINT "follows_following_id_profiles_profile_id_fk"
  FOREIGN KEY ("following_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_profile_id_users_id_fk"
  FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
