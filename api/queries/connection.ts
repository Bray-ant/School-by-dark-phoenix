import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>> | undefined;

export function getDb() {
  if (!instance) {
    const pool = mysql.createPool({
      uri: env.databaseUrl,
      ssl: { rejectUnauthorized: true },
    });
    instance = drizzle(pool, {
      mode: "planetscale",
      schema: fullSchema,
    }) as unknown as ReturnType<typeof drizzle<typeof fullSchema>>;
  }
  return instance;
}
