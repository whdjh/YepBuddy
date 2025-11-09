import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// 모든 테이블이 들어가도록 스키마를 합쳐준다
import * as proteinSchema from "@/app/protein/schema";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });

// schema 제네릭 주입
export const schema = { ...proteinSchema };
const db = drizzle(client, { schema });

export default db;