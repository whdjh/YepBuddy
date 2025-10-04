import {
  bigint,
  check,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { profiles } from "@/app/users/[username]/schema";
import { sql } from "drizzle-orm";

const programs = pgEnum("program", ["1:1 PT", "그룹 PT(2-3인)"]);
const proceeds = pgEnum("proceed", ["센터 방문", "방문 PT"]);


export const trainers = pgTable("trainers", {
  trainer_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  
  avatarFile: text(),
  name: text().notNull(),
  location: text(),

  program: programs().default("1:1 PT").notNull(),
  proceed: proceeds().default("센터 방문").notNull(),
  schedule: text().notNull(),
  intro: text().notNull(),
  description: text().notNull(),
  stats: jsonb().notNull().default({ views: 0, reviews: 0 }),

  profile_id: uuid()
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  category_id: bigint({ mode: "number" }).references(
    () => categories.category_id,
    { onDelete: "set null" }
  ),

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  category_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  name: text().notNull(),
  description: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const trainer_upvotes = pgTable(
  "trainer_upvotes",
  {
    trainer_id: bigint({ mode: "number" }).references(
      () => trainers.trainer_id,
      {
        onDelete: "cascade",
      }
    ),
    profile_id: uuid().references(() => profiles.profile_id, {
      onDelete: "cascade",
    }),
  },
  (table) => [primaryKey({ columns: [table.trainer_id, table.profile_id] })]
);

export const reviews = pgTable(
  "reviews",
  {
    review_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    trainer_id: bigint({ mode: "number" }).references(
      () => trainers.trainer_id,
      {
        onDelete: "cascade",
      }
    ),
    profile_id: uuid().references(() => profiles.profile_id, {
      onDelete: "cascade",
    }),
    rating: integer().notNull(),
    review: text().notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (table) => [check("rating_check", sql`${table.rating} BETWEEN 1 AND 5`)]
);