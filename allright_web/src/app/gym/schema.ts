import {
  bigint,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "../users/[username]/schema";

export const gyms = pgTable("gyms", {
  gym_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  title: text().notNull(),
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