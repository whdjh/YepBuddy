import {
  bigint,
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { profiles } from "@/app/users/[username]/schema";

export const level = pgEnum("level", ["high", "mid", "low"]);

export const diaryEntries = pgTable(
  "diary_entries",
  {
    diary_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    profile_id: uuid()
      .references(() => profiles.profile_id, { onDelete: "cascade" })
      .notNull(),

    date: date({ mode: "string" }).notNull(),

    sleep_level: level().notNull().default("mid"),
    condition_level: level().notNull().default("mid"),
    activity_level: level().notNull().default("mid"),

    /** 캘린더/목록에 노출할 간단 요약 */
    summary: text(),
    /** 사용자 정의 색상(hex 등) */
    color: text(),

    comment: text(),
    signature_data: text(),

    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [
    index("idx_diary_profile_date").on(t.profile_id, t.date),
  ]
);

/** 운동 종목(하루 일지의 여러 운동) */
export const diaryExercises = pgTable(
  "diary_exercises",
  {
    exercise_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    diary_id: bigint({ mode: "number" })
      .references(() => diaryEntries.diary_id, { onDelete: "cascade" })
      .notNull(), // ← 필수

    name: text().notNull(),
    order_index: bigint({ mode: "number" }).notNull().default(0),

    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [index("idx_exercises_diary").on(t.diary_id)]
);

/** 세트(무게×횟수) */
export const diaryExerciseSets = pgTable(
  "diary_exercise_sets",
  {
    set_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    exercise_id: bigint({ mode: "number" })
      .references(() => diaryExercises.exercise_id, { onDelete: "cascade" })
      .notNull(), // ← 필수

    weight: text().notNull(),
    reps: text().notNull(),

    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [index("idx_sets_exercise").on(t.exercise_id)]
);

/** 운동 부위(룩업) */
export const bodyParts = pgTable(
  "body_parts",
  {
    body_part_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: text().notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uniq_body_parts_name").on(t.name)]
);

/** 하루 일지 ↔ 부위 (N:N) */
export const diarySelectedBodyParts = pgTable(
  "diary_selected_body_parts",
  {
    diary_id: bigint({ mode: "number" })
      .references(() => diaryEntries.diary_id, { onDelete: "cascade" })
      .notNull(), // ← 필수

    body_part_id: bigint({ mode: "number" })
      .references(() => bodyParts.body_part_id, { onDelete: "cascade" })
      .notNull(), // ← 필수
  },
  (t) => [
    index("pk_diary_bodypart").on(t.diary_id, t.body_part_id),
    index("idx_diary_bodypart_diary").on(t.diary_id),
    index("idx_diary_bodypart_part").on(t.body_part_id),
  ]
);

export const mediaType = pgEnum("diary_media_type", ["video", "photo"]);

export const diaryMedia = pgTable(
  "diary_media",
  {
    media_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    diary_id: bigint({ mode: "number" })
      .references(() => diaryEntries.diary_id, { onDelete: "cascade" })
      .notNull(),

    type: mediaType().notNull(),
    url: text().notNull(),
    order_index: bigint({ mode: "number" }).notNull().default(0),

    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [
    index("idx_diary_media_diary").on(t.diary_id),
    index("idx_diary_media_order").on(t.diary_id, t.order_index),
  ]
);
