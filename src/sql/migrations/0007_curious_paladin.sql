-- 1) enum (재실행 안전, DO 블록로 대체)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'protein_topic' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "public"."protein_topic" AS ENUM('wpc','wpi','wpcwpi','creatine','beta-alanine');
  END IF;
END $$;

-- 2) 일별 가격 스냅샷 테이블 (재실행 안전)
CREATE TABLE IF NOT EXISTS "protein_prices_daily" (
  "price_id"      bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "protein_id"    bigint NOT NULL,
  "observed_date" date NOT NULL,
  "price"         integer NOT NULL,
  "available"     boolean NOT NULL DEFAULT true,
  "created_at"    timestamp NOT NULL DEFAULT now()
);

-- 3) 기존 컬럼 정리: proteins.date -> base_date (재실행 안전)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='proteins' AND column_name='date'
  ) THEN
    ALTER TABLE "proteins" RENAME COLUMN "date" TO "base_date";
  END IF;
END $$;

-- proteins_likes PK 재정의 준비 (재실행 안전)
ALTER TABLE "proteins_likes" DROP CONSTRAINT IF EXISTS "proteins_likes_protein_id_profile_id_pk";

-- 4) weight(text) -> weight(integer) 안전 변환 (재실행 안전)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='proteins' AND column_name='weight'
      AND data_type IN ('text','character varying')
  ) THEN
    ALTER TABLE "proteins" RENAME COLUMN "weight" TO "weight_raw";
  END IF;
END $$;

ALTER TABLE "proteins" ADD COLUMN IF NOT EXISTS "weight" integer;

UPDATE "proteins"
SET "weight" = CASE
  WHEN weight_raw ~* '^\s*\d+(\.\d+)?\s*kg\b' THEN
    ROUND( (REGEXP_REPLACE(weight_raw, '[^0-9\.]', '', 'g')::numeric) * 1000 )::int
  WHEN weight_raw ~* '^\s*\d+(\.\d+)?\s*g\b' THEN
    ROUND( REGEXP_REPLACE(weight_raw, '[^0-9\.]', '', 'g')::numeric )::int
  WHEN weight_raw ~* '^\s*\d+(\.\d+)?\s*l(b|bs)\b' THEN
    ROUND( (REGEXP_REPLACE(weight_raw, '[^0-9\.]', '', 'g')::numeric) * 453.59237 )::int
  WHEN weight_raw ~ '^\s*\d+\s*$' THEN
    TRIM(weight_raw)::int
  ELSE NULL
END
WHERE "weight" IS NULL
  AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='proteins' AND column_name='weight_raw'
  );

-- NULL 남아있으면 NOT NULL은 건너뜀 (재실행 안전)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "proteins" WHERE "weight" IS NULL) THEN
    RAISE NOTICE 'Skipping NOT NULL on proteins.weight because some rows are NULL';
  ELSE
    ALTER TABLE "proteins" ALTER COLUMN "weight" SET NOT NULL;
  END IF;
END $$;

-- 백업 컬럼 제거 (재실행 안전)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='proteins' AND column_name='weight_raw'
  ) THEN
    ALTER TABLE "proteins" DROP COLUMN "weight_raw";
  END IF;
END $$;

-- 5) topic을 enum으로 (이미 enum이면 스킵)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='proteins' AND column_name='topic'
      AND (data_type <> 'USER-DEFINED' OR udt_name <> 'protein_topic')
  ) THEN
    ALTER TABLE "proteins"
      ALTER COLUMN "topic" SET DATA TYPE "public"."protein_topic"
      USING "topic"::"public"."protein_topic";
  END IF;
END $$;

-- 6) likes PK 재정의
ALTER TABLE "proteins_likes" ALTER COLUMN "protein_id" SET NOT NULL;
ALTER TABLE "proteins_likes" ALTER COLUMN "profile_id" SET NOT NULL;
ALTER TABLE "proteins_likes"
  ADD CONSTRAINT "proteins_likes_pk" PRIMARY KEY("protein_id","profile_id");

-- 7) 새 컬럼 추가 (재실행 안전)
ALTER TABLE "proteins" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "proteins" ADD COLUMN IF NOT EXISTS "scoop" integer;
ALTER TABLE "proteins" ADD COLUMN IF NOT EXISTS "protein_per_scoop" integer;
ALTER TABLE "proteins" ADD COLUMN IF NOT EXISTS "base_pack_count" integer NOT NULL DEFAULT 1;

-- 8) FK, 인덱스 (재실행 안전)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'protein_prices_daily_protein_id_proteins_protein_id_fk'
  ) THEN
    ALTER TABLE "protein_prices_daily"
      ADD CONSTRAINT "protein_prices_daily_protein_id_proteins_protein_id_fk"
      FOREIGN KEY ("protein_id") REFERENCES "public"."proteins"("protein_id")
      ON DELETE CASCADE;
  END IF;
END $$;

-- (이름 정리) 하루 1건 유니크
DROP INDEX IF EXISTS "protein_prices_daily_uniq_per_day_pack";
CREATE UNIQUE INDEX IF NOT EXISTS "protein_prices_daily_uniq_per_day"
  ON "protein_prices_daily" ("protein_id","observed_date");

-- title 유니크
CREATE UNIQUE INDEX IF NOT EXISTS "proteins_title_unique" ON "proteins" ("title");

-- 9) 기존 price 컬럼 제거 (재실행 안전)
ALTER TABLE "proteins" DROP COLUMN IF EXISTS "price";

-- (선택) 조회 성능 인덱스
CREATE INDEX IF NOT EXISTS "idx_prices_daily_pid_date"
  ON "protein_prices_daily" ("protein_id", "observed_date" DESC);
4