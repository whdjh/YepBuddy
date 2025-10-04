ALTER TABLE "reviews" RENAME COLUMN "product_id" TO "trainer_id";--> statement-breakpoint
ALTER TABLE "trainer_upvotes" RENAME COLUMN "product_id" TO "trainer_id";--> statement-breakpoint
ALTER TABLE "trainers" RENAME COLUMN "product_id" TO "trainer_id";--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_product_id_trainers_product_id_fk";
--> statement-breakpoint
ALTER TABLE "trainer_upvotes" DROP CONSTRAINT "trainer_upvotes_product_id_trainers_product_id_fk";
--> statement-breakpoint
ALTER TABLE "trainer_upvotes" DROP CONSTRAINT "trainer_upvotes_product_id_profile_id_pk";--> statement-breakpoint
ALTER TABLE "trainer_upvotes" ADD CONSTRAINT "trainer_upvotes_trainer_id_profile_id_pk" PRIMARY KEY("trainer_id","profile_id");--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_trainer_id_trainers_trainer_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("trainer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_upvotes" ADD CONSTRAINT "trainer_upvotes_trainer_id_trainers_trainer_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("trainer_id") ON DELETE cascade ON UPDATE no action;