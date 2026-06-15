import mysql from 'mysql2/promise';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

const conn = await mysql.createConnection(connectionString);

await conn.execute(
  `INSERT INTO users (unionId, name, role, accessToken, createdAt, updatedAt, lastSignInAt)
   VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())
   ON DUPLICATE KEY UPDATE role = 'admin', updatedAt = NOW()`
  ,
  ['owner', 'Owner', 'admin', 'owner-token']
);

console.log('Owner user created/updated');
await conn.end();
