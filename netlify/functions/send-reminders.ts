import nodemailer from "nodemailer";
import { eq, lt, or, isNull } from "drizzle-orm";
import { env } from "../../api/lib/env";
import { getDb } from "../../api/queries/connection";
import { users } from "@db/schema";

const INACTIVE_MS = 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass.replace(/\s+/g, ""),
  },
});

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const defaultReminder = (username: string) => ({
  subject: "Don't forget your daily learning — ForceForm",
  html: `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="color: #3b82f6;">Hi ${escapeHtml(username || "there")},</h2>
      <p>We noticed you haven't opened ForceForm or completed any learning in the last 24 hours.</p>
      <p>Keep your momentum going — even 10 minutes of practice makes a difference.</p>
      <a href="https://study-by-dark-phoenix.netlify.app/" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;margin-top:12px;">Open ForceForm</a>
      <p style="margin-top:24px;font-size:12px;color:#666;">You're receiving this because you signed up for ForceForm learning reminders.</p>
    </div>
  `,
});

export default async function handler() {
  if (!env.smtpUser || !env.smtpPass || !env.fromEmail) {
    return new Response(JSON.stringify({ error: "Email not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = getDb();
  const now = new Date();
  const cutoff = new Date(now.getTime() - INACTIVE_MS);

  const inactiveUsers = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      lastActiveAt: users.lastActiveAt,
      lastReminderSentAt: users.lastReminderSentAt,
    })
    .from(users)
    .where(or(isNull(users.lastActiveAt), lt(users.lastActiveAt, cutoff)));

  let sent = 0;
  const errors: string[] = [];

  for (const user of inactiveUsers) {
    if (!user.email) continue;

    // Don't spam: only remind if we haven't sent one in the last 24 hours
    if (
      user.lastReminderSentAt &&
      now.getTime() - new Date(user.lastReminderSentAt).getTime() < ONE_DAY_MS
    ) {
      continue;
    }

    const { subject, html } = defaultReminder(user.username || "");

    try {
      await transporter.sendMail({
        from: `"ForceForm" <${env.fromEmail}>`,
        to: user.email,
        subject,
        html,
      });
      await db
        .update(users)
        .set({ lastReminderSentAt: now })
        .where(eq(users.id, user.id));
      sent++;
    } catch (err: any) {
      errors.push(`${user.email}: ${err?.message || String(err)}`);
    }
  }

  return new Response(JSON.stringify({ sent, errors }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
