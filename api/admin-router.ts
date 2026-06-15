import { createRouter, adminQuery } from "./middleware";
import { findAllUsers } from "./queries/users";
import { getDb } from "./queries/connection";
import { loginActivity } from "@db/schema";
import { desc } from "drizzle-orm";

export const adminRouter = createRouter({
  users: adminQuery.query(async () => {
    return findAllUsers();
  }),
  activity: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(loginActivity)
      .orderBy(desc(loginActivity.createdAt))
      .limit(200);
    return rows;
  }),
});
