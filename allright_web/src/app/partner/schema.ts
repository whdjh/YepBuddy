import { bigint, pgTable, pgEnum, text, timestamp } from "drizzle-orm/pg-core"
import { PARTNER_TYPES, LOCATION_TYPES, TIME_RANGE } from "@/constants/partner";

export const partnerTypes = pgEnum(
  "partner_type",
  PARTNER_TYPES.map((t) => t.value) as [string, ...string[]]
);

export const locations = pgEnum(
  "location",
  LOCATION_TYPES.map((t) => t.value) as [string, ...string[]]
);

export const timeRanges = pgEnum("time_range", TIME_RANGE);

export const partners = pgTable("partners", {
  partner_id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  position: text().notNull(),
  overview: text().notNull(),
  responsibilities: text().notNull(),
  qualifications: text().notNull(),
  benefits: text().notNull(),
  gym_name: text().notNull(),
  gym_logo: text().notNull(),
  gym_location: text().notNull(),
  partner_type: partnerTypes().notNull(),
  partner_location: locations().notNull(),
  timeRange: timeRanges().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});