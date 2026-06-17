import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';
import 'dotenv/config';

const BCRYPT_ROUNDS = 12;
const CLIENT_SALT = 'ForceForm_Imran_Secure_2026_v2';
const CLIENT_ITERATIONS = 10000;

function clientHashPassword(password) {
  const saltData = Buffer.from(CLIENT_SALT, 'utf-8');
  const passwordData = Buffer.from(password, 'utf-8');
  const combined = Buffer.concat([saltData, passwordData]);

  let hash = createHash('sha256').update(combined).digest();
  for (let i = 0; i < CLIENT_ITERATIONS; i++) {
    hash = createHash('sha256').update(hash).digest();
  }

  return Array.from(hash)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

const email = (process.env.OWNER_EMAIL || 'owner@projectschool.com').toLowerCase().trim();
const username = (process.env.OWNER_USERNAME || 'owner').trim();
const rawPassword = process.env.OWNER_PASSWORD;

if (!rawPassword) {
  console.error('Missing OWNER_PASSWORD environment variable');
  process.exit(1);
}

if (rawPassword.length < 12) {
  console.error('OWNER_PASSWORD must be at least 12 characters');
  process.exit(1);
}

const clientHash = clientHashPassword(rawPassword);
const passwordHash = await bcrypt.hash(clientHash, BCRYPT_ROUNDS);

const conn = await mysql.createConnection(connectionString);

await conn.execute(
  `INSERT INTO users
     (unionId, username, email, passwordHash, name, role, isVerified, emailVerified, acceptedTermsAt, createdAt, updatedAt, lastSignInAt)
   VALUES (?, ?, ?, ?, ?, ?, 1, 1, NOW(), NOW(), NOW(), NOW())
   ON DUPLICATE KEY UPDATE
     username = VALUES(username),
     passwordHash = VALUES(passwordHash),
     name = VALUES(name),
     role = VALUES(role),
     isVerified = VALUES(isVerified),
     emailVerified = VALUES(emailVerified),
     acceptedTermsAt = VALUES(acceptedTermsAt),
     updatedAt = NOW()`,
  ['owner', username, email, passwordHash, 'Owner', 'admin']
);

console.log(`Owner user ensured: ${email} (${username})`);
await conn.end();
