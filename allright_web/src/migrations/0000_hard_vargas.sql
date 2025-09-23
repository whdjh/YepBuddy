CREATE TYPE "public"."location" AS ENUM('remote', 'in-person', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."partner_type" AS ENUM('full-time', 'freelance', 'internship');--> statement-breakpoint
CREATE TYPE "public"."time_range" AS ENUM('00:00 - 02:00', '02:00 - 04:00', '04:00 - 06:00', '06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00', '22:00 - 24:00');--> statement-breakpoint
CREATE TABLE "partners" (
	"partner_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "partners_partner_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"position" text NOT NULL,
	"overview" text NOT NULL,
	"responsibilities" text NOT NULL,
	"qualifications" text NOT NULL,
	"benefits" text NOT NULL,
	"gym_name" text NOT NULL,
	"gym_logo" text NOT NULL,
	"gym_location" text NOT NULL,
	"partner_type" "partner_type" NOT NULL,
	"partner_location" "location" NOT NULL,
	"timeRange" time_range NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
