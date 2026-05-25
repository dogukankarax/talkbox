import * as schema from "@/db/schema.js";
import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment is not set");
}

const db = drizzle(process.env.DATABASE_URL, { schema });

export { db };
