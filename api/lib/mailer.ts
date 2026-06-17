import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

function getSmtpConfig() {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  const fromEmail = process.env.FROM_EMAIL || smtpUser;
  return { smtpHost, smtpPort, smtpUser, smtpPass, fromEmail };
}

let cachedTransporter: Transporter | null = null;
let cachedUser = "";
let cachedPass = "";

function getTransporter(): { transporter: Transporter | null; fromEmail: string } {
  const { smtpHost, smtpPort, smtpUser, smtpPass, fromEmail } = getSmtpConfig();

  if (!smtpUser || !smtpPass) {
    console.warn(
      "[mailer] SMTP not configured — emails will not be sent. Set SMTP_USER and SMTP_PASS env vars.",
    );
    return { transporter: null, fromEmail };
  }

  // Rebuild the transporter only if credentials changed (e.g. after a
  // rotated app password) — avoids reconnecting on every single send.
  if (!cachedTransporter || cachedUser !== smtpUser || cachedPass !== smtpPass) {
    console.log(
      `[mailer] SMTP config: host=${smtpHost} port=${smtpPort} user=${smtpUser.slice(0, 3)}*** from=${fromEmail.slice(0, 3)}***`,
    );
    cachedTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
    cachedUser = smtpUser;
    cachedPass = smtpPass;
  }

  return { transporter: cachedTransporter, fromEmail };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FOOTER = `<p style="font-size: 12px; color: #666; margin-top: 24px;">Regards,<br/>Security Team — School by Dark Phoenix</p>`;

export function isMailerConfigured(): boolean {
  const { transporter, fromEmail } = getTransporter();
  return transporter !== null && fromEmail !== "";
}

async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  const { transporter, fromEmail } = getTransporter();
  if (!transporter || !fromEmail) {
    console.warn("[mailer] Cannot send email — SMTP not configured");
    return false;
  }
  try {
    const info = await transporter.sendMail({ from: fromEmail, to, subject, html });
    console.log(`[mailer] Email sent to ${to}: messageId=${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[mailer] Failed to send email to ${to}:`, err);
    return false;
  }
}

function requestDetails(ip: string, userAgent?: string, timestamp?: string): string {
  const parts: string[] = [];
  if (ip && ip !== "unknown") parts.push(`<strong>IP Address:</strong> ${escapeHtml(ip)}`);
  if (userAgent && userAgent !== "unknown") parts.push(`<strong>Browser:</strong> ${escapeHtml(userAgent.slice(0, 120))}`);
  if (timestamp) parts.push(`<strong>Time:</strong> ${escapeHtml(timestamp)}`);
  if (parts.length === 0) return "";
  return `<div style="background: #f9fafb; padding: 12px; border-radius: 6px; margin: 16px 0; font-size: 12px; color: #555;">${parts.join("<br/>")}</div>`;
}

// ── OTP Email (registration + password reset OTP) ─────────────

export async function sendOtpEmail(
  email: string,
  otp: string,
  purpose: "registration" | "password reset",
  firstName?: string,
  ip?: string,
  timestamp?: string,
): Promise<boolean> {
  const safeName = escapeHtml(firstName || "there");
  const subject = purpose === "registration"
    ? "Verify Your Email Address"
    : "Password Reset Code";
  const intro = purpose === "registration"
    ? "Thank you for creating an account."
    : "A password reset verification code was requested for your account.";
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="color: #3b82f6;">${escapeHtml(subject)}</h2>
      <p>Hello ${safeName},</p>
      <p>${intro}</p>
      <p>Your verification code is:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0; text-align: center;">
        <code style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #111;">${escapeHtml(otp)}</code>
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p style="color: #dc2626; font-size: 13px; margin-top: 16px;">
        ⚠ For security reasons:<br/>
        • Do not share this code with anyone.<br/>
        • Our team will never ask for this code.<br/>
        • If you did not ${purpose === "registration" ? "create this account" : "request this code"}, please ignore this email.
      </p>
      ${requestDetails(ip || "unknown", undefined, timestamp)}
      ${FOOTER}
    </div>
  `;
  return sendMail(email, `${subject} — School by Dark Phoenix`, html);
}

// ── Password Reset Email (token-based) ──────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  firstName?: string,
  ip?: string,
  userAgent?: string,
  timestamp?: string,
): Promise<boolean> {
  const safeName = escapeHtml(firstName || "there");
  const safeToken = escapeHtml(token);
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="color: #f59e0b;">Password Reset Request</h2>
      <p>Hello ${safeName},</p>
      <p>A password reset request was submitted for your account.</p>
      <p><strong>Reset Token:</strong></p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0; word-break: break-all;">
        <code style="font-size: 12px; color: #111;">${safeToken}</code>
      </div>
      <p>This token will expire in <strong>30 minutes</strong>.</p>
      <p style="color: #dc2626; font-size: 13px; margin-top: 16px;">
        If you did not request a password reset:<br/>
        • Ignore this email.<br/>
        • Change your password immediately if you suspect unauthorized access.<br/>
        • Contact support.
      </p>
      ${requestDetails(ip || "unknown", userAgent, timestamp)}
      ${FOOTER}
    </div>
  `;
  return sendMail(email, "Password Reset Request — School by Dark Phoenix", html);
}

// ── Password Change Confirmation Email ──────────────────────────

export async function sendPasswordChangeConfirmation(
  email: string,
  firstName?: string,
  ip?: string,
  userAgent?: string,
  timestamp?: string,
): Promise<boolean> {
  const safeName = escapeHtml(firstName || "there");
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="color: #10b981;">Your Password Was Changed</h2>
      <p>Hello ${safeName},</p>
      <p>Your password was successfully changed.</p>
      ${requestDetails(ip || "unknown", userAgent, timestamp)}
      <p style="color: #dc2626; font-size: 13px; margin-top: 16px;">
        If this was not you:<br/>
        1. Contact support immediately.<br/>
        2. Reset your password.<br/>
        3. Review your account activity.
      </p>
      ${FOOTER}
    </div>
  `;
  return sendMail(email, "Your Password Was Changed — School by Dark Phoenix", html);
}

// ── Account Locked Email ────────────────────────────────────────

export async function sendAccountLockedEmail(
  email: string,
  firstName?: string,
  ip?: string,
  userAgent?: string,
): Promise<boolean> {
  const safeName = escapeHtml(firstName || "there");
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="color: #ef4444;">Account Temporarily Locked</h2>
      <p>Hello ${safeName},</p>
      <p>Your account has been temporarily locked due to multiple failed login attempts. It will be unlocked after 24 hours.</p>
      ${requestDetails(ip || "unknown", userAgent, new Date().toISOString())}
      <p style="color: #dc2626; font-size: 13px; margin-top: 16px;">
        If this was not you, someone may be trying to access your account. We recommend:<br/>
        • Resetting your password as soon as the lockout expires.<br/>
        • Reviewing your account activity.<br/>
        • Contacting support if you need immediate assistance.
      </p>
      ${FOOTER}
    </div>
  `;
  return sendMail(email, "Account Temporarily Locked — School by Dark Phoenix", html);
}
