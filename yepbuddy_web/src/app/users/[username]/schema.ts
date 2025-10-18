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
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { trainers } from "@/app/trainer/schema";

const app = pgSchema("app");

export const users = app.table(
  "users",
  {
    id: uuid().primaryKey(),
    email: text().notNull(),
    password_hash: text().notNull(),
    email_verified_at: timestamp(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uq_app_users_email").on(t.email)]
);

export const roles = pgEnum("role", ["trainer", "member"]);

export const profiles = pgTable("profiles", {
  profile_id: uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text().notNull(),
  role: roles().default("member").notNull(),
  description: text(),
  location: text(),
  history: text(),
  qualifications: text(),
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

// refresh_tokens
// 원문 토큰은 쿠키(HttpOnly)에만, DB에는 해시만 저장
// 로테이션/폐기 추적을 위해 jti와 replaced_by/ revoked_at 포함
export const refreshTokens = pgSchema("app").table(
  "refresh_tokens",
  {
    jti: uuid().primaryKey(), // 토큰 식별자 (server-side 생성)
    user_id: uuid().references(() => users.id, { onDelete: "cascade" }),
    token_hash: text().notNull(),            // refresh 토큰 해시(bcryptjs)
    expires_at: timestamp().notNull(),       // 만료 시각
    created_at: timestamp().notNull().defaultNow(),
    revoked_at: timestamp(),                 // 강제 폐기/로그아웃 시각
    replaced_by: uuid(),                     // 로테이션으로 바뀐 다음 jti
    user_agent: text(),                      // 클라이언트 구분용
    ip: text(),                              // 보안 감사용
  },
  (t) => [
    index("idx_refresh_user").on(t.user_id),
    index("idx_refresh_expires").on(t.expires_at),
  ]
);