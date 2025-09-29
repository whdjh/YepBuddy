import {
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const users = pgSchema("auth").table("users", {
  id: uuid().primaryKey(),
});

export const roles = pgEnum("role", ["trainer", "member"]);

export const profiles = pgTable("profiles", {
  profile_id: uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text().notNull(),
  role: roles().default("trainer").notNull(),
  description: text().notNull(),
  location: text(),
  history: text(),
  qualifications: text().notNull(),
  avatarFile: text(),
  views: jsonb(),
  stats: jsonb().$type<{
    followers: number;
    following: number;
  }>(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const follows = pgTable("follows", {
  follower_id: uuid().references(() => profiles.profile_id, {
    onDelete: "cascade",
  }),
  following_id: uuid().references(() => profiles.profile_id, {
    onDelete: "cascade",
  }),
  created_at: timestamp().notNull().defaultNow(),
});