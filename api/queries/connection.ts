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
      ssl: { rejectUnauthorized: true, minVersion: "TLSv1.2" },
      // TiDB Cloud's serverless tier can drop idle connections; without
      // these, mysql2's pool keeps trying to reuse a dead connection and
      // surfaces it as an intermittent, hard-to-reproduce SSL/transport
      // error on whichever request happens to grab that stale connection.
      waitForConnections: true,
      connectionLimit: 5,
      maxIdle: 5,
      idleTimeout: 30000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
    instance = drizzle(pool, {
      mode: "planetscale",
      schema: fullSchema,
    }) as unknown as ReturnType<typeof drizzle<typeof fullSchema>>;
  }
  return instance;
}
