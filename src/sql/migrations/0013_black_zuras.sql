CREATE TYPE "public"."machine_category" AS ENUM('back', 'chest', 'arm', 'shoulder', 'leg', 'free', 'cardio', 'etc');--> statement-breakpoint
CREATE TABLE "gyms_machines" (
	"gym_id" bigint NOT NULL,
	"machine_id" bigint NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gyms_machines_gym_id_machine_id_pk" PRIMARY KEY("gym_id","machine_id")
);
--> statement-breakpoint
CREATE TABLE "machines" (
	"machine_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "machines_machine_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"brand" text,
	"category" "machine_category" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gyms_machines" ADD CONSTRAINT "gyms_machines_gym_id_gyms_gym_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("gym_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gyms_machines" ADD CONSTRAINT "gyms_machines_machine_id_machines_machine_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("machine_id") ON DELETE cascade ON UPDATE no action;