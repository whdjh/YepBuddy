import {
  bigint,
  boolean,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { trainers } from "@/app/trainer/schema";

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
  avatar_file: text(),
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

export const notifications = pgTable("notifications", {
  notification_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  // 다른 사람을 팔로우하는 사람
  source_id: uuid().references(() => profiles.profile_id, {
    onDelete: "cascade",
  }),
  // 팔로우 당하는 사람
  trainer_id: bigint({ mode: "number" }).references(() => trainers.trainer_id, {
    onDelete: "cascade",
  }),
  // 팔로우 당하는 사람
  target_id: uuid()
    .references(() => profiles.profile_id, {
      onDelete: "cascade",
    })
    .notNull(),
  type: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
});

export const messageRooms = pgTable("message_rooms", {
  message_room_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  created_at: timestamp().notNull().defaultNow(),
});

export const messageRoomMembers = pgTable(
  "message_room_members",
  {
    message_room_id: bigint({ mode: "number" }).references(
      () => messageRooms.message_room_id,
      {
        onDelete: "cascade",
      }
    ),
    profile_id: uuid().references(() => profiles.profile_id, {
      onDelete: "cascade",
    }),
    created_at: timestamp().notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.message_room_id, table.profile_id] }),
  ]
);

export const messages = pgTable("messages", {
  message_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  message_room_id: bigint({ mode: "number" }).references(
    () => messageRooms.message_room_id,
    {
      onDelete: "cascade",
    }
  ),
  sender_id: uuid().references(() => profiles.profile_id, {
    onDelete: "cascade",
  }),
  content: text().notNull(),
  seen: boolean().notNull().default(false),
  created_at: timestamp().notNull().defaultNow(),
});