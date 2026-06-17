import mysql from 'mysql2/promise';
import 'dotenv/config';

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/unblock-user.mjs <email>');
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

const conn = await mysql.createConnection(connectionString);

const [result] = await conn.execute(
  `UPDATE users
   SET failedLoginAttempts = 0,
       accountLockedUntil = NULL,
       updatedAt = NOW()
   WHERE email = ?`,
  [email.toLowerCase().trim()]
);

if (result.affectedRows === 0) {
  console.error(`No user found with email: ${email}`);
  await conn.end();
  process.exit(1);
}

console.log(`User ${email} is now unblocked.`);
await conn.end();
