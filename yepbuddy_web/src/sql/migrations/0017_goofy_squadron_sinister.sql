ALTER TABLE "proteins" ALTER COLUMN "url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "protein_prices_daily" ADD COLUMN "url" text;