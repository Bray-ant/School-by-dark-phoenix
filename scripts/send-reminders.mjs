import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const INACTIVE_MS = 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
const fromEmail = process.env.FROM_EMAIL || '';
const databaseUrl = process.env.DATABASE_URL || '';

if (!smtpUser || !smtpPass || !fromEmail || !databaseUrl) {
  console.error('Missing required env vars: SMTP_USER, SMTP_PASS, FROM_EMAIL, DATABASE_URL');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: smtpUser, pass: smtpPass },
});

function reminderHtml(username) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="color: #3b82f6;">Hi ${username || 'there'},</h2>
      <p>We noticed you haven't opened ForceForm or completed any learning in the last 24 hours.</p>
      <p>Keep your momentum going — even 10 minutes of practice makes a difference.</p>
      <a href="https://study-by-dark-phoenix.netlify.app/" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;margin-top:12px;">Open ForceForm</a>
      <p style="margin-top:24px;font-size:12px;color:#666;">You're receiving this because you signed up for ForceForm learning reminders.</p>
    </div>
  `;
}

async function main() {
  const conn = await mysql.createConnection(databaseUrl);
  const now = new Date();
  const cutoff = new Date(now.getTime() - INACTIVE_MS);

  try {
    const [rows] = await conn.execute(
      `SELECT id, username, email, lastActiveAt, lastReminderSentAt FROM users
       WHERE lastActiveAt IS NULL OR lastActiveAt < ?`,
      [cutoff]
    );

    let sent = 0;
    const errors = [];

    for (const user of rows) {
      if (!user.email) continue;
      if (
        user.lastReminderSentAt &&
        now.getTime() - new Date(user.lastReminderSentAt).getTime() < ONE_DAY_MS
      ) {
        continue;
      }

      try {
        await transporter.sendMail({
          from: `"ForceForm" <${fromEmail}>`,
          to: user.email,
          subject: "Don't forget your daily learning — ForceForm",
          html: reminderHtml(user.username),
        });
        await conn.execute('UPDATE users SET lastReminderSentAt = ? WHERE id = ?', [now, user.id]);
        sent++;
      } catch (err) {
        errors.push(`${user.email}: ${err.message}`);
      }
    }

    console.log(JSON.stringify({ sent, errors }, null, 2));
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
