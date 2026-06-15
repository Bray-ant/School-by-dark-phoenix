import bcrypt from "bcryptjs";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./hash";

const ADMIN_EMAIL = "hohenheimvon01@gmail.com";
const ADMIN_USERNAME = "hohenheim";
const ADMIN_PASSWORD = "123456789";
const BCRYPT_ROUNDS = 12;

/**
 * Ensures the default admin user exists.
 * Called on app startup — creates the admin if not present.
 */
export async function seedDefaultAdmin() {
  try {
    const db = getDb();
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    if (existing) return;

    const clientHash = hashPassword(ADMIN_PASSWORD);
    const passwordHash = await bcrypt.hash(clientHash, BCRYPT_ROUNDS);
    await db.insert(users).values({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      passwordHash,
      name: "Von Hohenheim",
      role: "admin",
      isVerified: 1,
    });

    console.log("[seed] Default admin user created.");
  } catch (err) {
    console.error("[seed] Failed to seed admin:", err);
  }
}
