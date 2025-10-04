import {
  bigint,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "../users/[username]/schema";

export const proteins = pgTable("proteins", {
  protein_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  
  title: text().notNull(),
  weight: text().notNull(),
  avatarFile: text().notNull(),
  topic: text().notNull(),
  taste: text().notNull(),
  price: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const proteinsLikes = pgTable(
  "proteins_likes",
  {
    protein_id: bigint({ mode: "number" }).references(
      () => proteins.protein_id,
      {
        onDelete: "cascade",
      }
    ),
    profile_id: uuid().references(() => profiles.profile_id, {
      onDelete: "cascade",
    }),
  },
  (table) => [primaryKey({ columns: [table.protein_id, table.profile_id] })]
);