import {
  bigint,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  pgEnum
} from "drizzle-orm/pg-core";

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
  },
  (table) => [primaryKey({ columns: [table.gym_id] })]
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
    quantity: integer().notNull().default(1),
    notes: text(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.gym_id, t.machine_id] })]
);