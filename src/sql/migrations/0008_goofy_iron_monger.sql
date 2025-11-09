DROP INDEX IF EXISTS "protein_prices_daily_uniq_per_day_pack";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "protein_prices_daily_uniq_per_day"
  ON "protein_prices_daily" ("protein_id","observed_date");