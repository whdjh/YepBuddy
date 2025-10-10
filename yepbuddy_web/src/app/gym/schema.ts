import {
  bigint,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  pgEnum
} from "drizzle-orm/pg-core";
import { profiles } from "../users/[username]/schema";

export const machineCategory = pgEnum("machine_category", [
  "back",      // 등
  "chest",     // 가슴
  "arm",       // 팔
  "shoulder",  // 어깨
  "leg",       // 하체
  "free",      // 프리웨이트
  "cardio",    // 유산소
  "etc",       // 기타
]);

export const gyms = pgTable("gyms", {
  gym_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  title: text().notNull(),
  location: text().notNull(),
  views: integer().notNull().default(0),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const gymsLikes = pgTable(
  "gyms_likes",
  {
    gym_id: bigint({ mode: "number" }).references(
      () => gyms.gym_id,
      {
        onDelete: "cascade",
      }
    ),
    profile_id: uuid().references(() => profiles.profile_id, {
      onDelete: "cascade",
    }),
  },
  (table) => [primaryKey({ columns: [table.gym_id, table.profile_id] })]
);

export const machines = pgTable("machines", {
  machine_id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  brand: text(),
  category: machineCategory("category").notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const gymsMachines = pgTable(
  "gyms_machines",
  {
    gym_id: bigint({ mode: "number" }).references(() => gyms.gym_id, {
      onDelete: "cascade",
    }).notNull(),
    machine_id: bigint({ mode: "number" }).references(() => machines.machine_id, {
      onDelete: "cascade",
    }).notNull(),
    quantity: integer().notNull().default(1), // 해당 기구 대수
    notes: text(),                            // 비고 (예: 1~40kg 덤벨 보유, 렉 2개 등)
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.gym_id, t.machine_id] })]
);

/** 댓글 기능 추가시 사용
export const postReplies = pgTable("post_replies", {
  post_reply_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  gym_id: bigint({ mode: "number" }).references(() => posts.gym_id, {
    onDelete: "cascade",
  }),
  parent_id: bigint({ mode: "number" }).references(
    (): AnyPgColumn => postReplies.post_reply_id,
    {
      onDelete: "cascade",
    }
  ),
  profile_id: uuid()
    .references(() => profiles.profile_id, {
      onDelete: "cascade",
    })
    .notNull(),
  reply: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
 */