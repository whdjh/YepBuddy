import {
  pgTable,
  bigint,
  text,
  integer,
  timestamp,
  uuid,
  date,
  boolean,
  pgEnum,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { profiles } from "@/app/users/[username]/schema";

export const proteinTopic = pgEnum("protein_topic", [
  "wpc",
  "wpi",
  "wpcwpi",
  "creatine",
  "beta-alanine",
]);

export const flavorTier = pgEnum("flavor_tier", ["T1", "T2", "T3"]);

export const proteins = pgTable(
  "proteins",
  {
    protein_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    title: text().notNull(),
    weight: integer().notNull(),
    avatar_file: text().notNull(),
    topic: proteinTopic().notNull(),
    taste: text().notNull(),
    description: text(),

    scoop: integer(),
    protein_per_scoop: integer(),
    base_pack_count: integer().notNull().default(1),
    base_date: date({ mode: "string" }).notNull(),
    url: text(), // nullable로 변경: 날짜별 URL은 protein_prices_daily에 저장

    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("proteins_title_unique").on(t.title),
  ]
);

export const proteinPricesDaily = pgTable(
  "protein_prices_daily",
  {
    price_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    protein_id: bigint({ mode: "number" })
      .references(() => proteins.protein_id, { onDelete: "cascade" })
      .notNull(),

    observed_date: date({ mode: "string" }).notNull(),
    price: integer().notNull(),
    available: boolean().notNull().default(true),
    sale: integer().notNull().default(1),
    url: text(), // 파트너스 추적 링크 (날짜별로 최신 URL 저장)

    created_at: timestamp().notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("protein_prices_daily_uniq_per_day").on(
      t.protein_id,
      t.observed_date,
    ),
  ]
);

export const proteinsLikes = pgTable(
  "proteins_likes",
  {
    protein_id: bigint({ mode: "number" })
      .references(() => proteins.protein_id, { onDelete: "cascade" })
      .notNull(),
    profile_id: uuid()
      .references(() => profiles.profile_id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.protein_id, t.profile_id], name: "proteins_likes_pk" }),
  ]
);

export const proteinFlavors = pgTable(
  "protein_flavors",
  {
    flavor_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    protein_id: bigint({ mode: "number" })
      .references(() => proteins.protein_id, { onDelete: "cascade" })
      .notNull(),

    name: text().notNull(),
    tier: flavorTier(),
    polarizing: boolean().notNull().default(false),
    note: text(),

    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("protein_flavors_unique_per_protein").on(t.protein_id, t.name),
  ]
);