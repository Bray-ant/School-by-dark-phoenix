import mysql from 'mysql2/promise';

const connectionString = 'mysql://6Bb4xj3j2ZWARPs.root:HwoTsDdJ28woFXIZ@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/forceform_learn?ssl={"rejectUnauthorized":true}';

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
