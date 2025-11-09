-- app.users 보강 (재실행 안전)
CREATE SCHEMA IF NOT EXISTS "app";

CREATE TABLE IF NOT EXISTS "app"."users" (
  "id" uuid PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "password_hash" text NOT NULL,
  "email_verified_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_app_users_email"
  ON "app"."users" ("email");

-- ✅ FK 추가 전에 기존 profiles에 맞춰 app.users 백필 (재실행 안전)
INSERT INTO "app"."users" ("id", "email", "password_hash", "created_at", "updated_at")
SELECT
  p."profile_id" AS id,
  ('migrated-' || p."profile_id" || '@placeholder.local') AS email,
  'migrated-placeholder-hash' AS password_hash,
  now(), now()
FROM "public"."profiles" p
LEFT JOIN "app"."users" u ON u."id" = p."profile_id"
WHERE u."id" IS NULL
ON CONFLICT ("id") DO NOTHING;

-- profiles 기본값/NULL 제약 변경
ALTER TABLE "profiles" ALTER COLUMN "role" SET DEFAULT 'member';
ALTER TABLE "profiles" ALTER COLUMN "description" DROP NOT NULL;
ALTER TABLE "profiles" ALTER COLUMN "qualifications" DROP NOT NULL;

-- FK 교체(있으면 드롭 후 재생성)
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_profile_id_users_id_fk";

ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_profile_id_users_id_fk"
  FOREIGN KEY ("profile_id") REFERENCES "app"."users"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;
