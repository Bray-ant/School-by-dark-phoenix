import { getDb } from "../api/queries/connection";
import { users, chatRooms } from "./schema";
import { hashPassword } from "../api/lib/hash";
import bcrypt from "bcryptjs";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // 1. Admin user
  const adminRaw = "AdminPass!2026";
  const adminClientHash = hashPassword(adminRaw);
  const adminBcrypt = await bcrypt.hash(adminClientHash, 12);

  await db
    .insert(users)
    .values({
      username: "admin",
      email: "admin@projectschool.dev",
      passwordHash: adminBcrypt,
      firstName: "Admin",
      lastName: "User",
      name: "Admin User",
      role: "admin",
      isVerified: 1,
      emailVerified: 1,
      acceptedTermsAt: new Date(),
    })
    .onDuplicateKeyUpdate({ set: { username: "admin" } });
  console.log("  ✓ Admin user (admin@projectschool.dev / AdminPass!2026)");

  // 2. Demo student
  const studentRaw = "Student!Pass99";
  const studentClientHash = hashPassword(studentRaw);
  const studentBcrypt = await bcrypt.hash(studentClientHash, 12);

  await db
    .insert(users)
    .values({
      username: "demo_student",
      email: "student@projectschool.dev",
      passwordHash: studentBcrypt,
      firstName: "Demo",
      lastName: "Student",
      name: "Demo Student",
      role: "user",
      isVerified: 1,
      emailVerified: 1,
      acceptedTermsAt: new Date(),
    })
    .onDuplicateKeyUpdate({ set: { username: "demo_student" } });
  console.log("  ✓ Demo student (student@projectschool.dev / Student!Pass99)");

  // 3. Chat rooms
  const rooms = [
    { name: "General", description: "General discussion about engineering and learning", topic: "general" },
    { name: "DC Circuits", description: "Discussion about DC circuit analysis topics", topic: "dc-circuits" },
    { name: "Study Group", description: "Collaborative study sessions and help", topic: "study" },
    { name: "Math Help", description: "Get help with math problems and concepts", topic: "math" },
  ];

  for (const room of rooms) {
    await db
      .insert(chatRooms)
      .values(room)
      .onDuplicateKeyUpdate({ set: { name: room.name } });
  }
  console.log("  ✓ Chat rooms (General, DC Circuits, Study Group, Math Help)");

  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
