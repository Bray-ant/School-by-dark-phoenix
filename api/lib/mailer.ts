import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// ── Provider Interface ──────────────────────────────────────────

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

interface EmailProvider {
  name: string;
  send(payload: EmailPayload, from: string): Promise<boolean>;
  verify(): Promise<boolean>;
}

// ── SMTP Provider (nodemailer) ──────────────────────────────────

class SmtpProvider implements EmailProvider {
  name = "smtp";
  private transporter: Transporter | null = null;
  private lastUser = "";
  private lastPass = "";

  private getTransporter(): Transporter | null {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER || "";
    const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

    if (!user || !pass) return null;
    if (this.transporter && this.lastUser === user && this.lastPass === pass) {
      return this.transporter;
    }
    console.log(
      `[mailer:smtp] Config: host=${host} port=${port} user=${user.slice(0, 3)}***`,
    );
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    this.lastUser = user;
    this.lastPass = pass;
    return this.transporter;
  }

  async send(payload: EmailPayload, from: string): Promise<boolean> {
    const t = this.getTransporter();
    if (!t) return false;
    const info = await t.sendMail({ from, ...payload });
    console.log(`[mailer:smtp] Sent to ${payload.to}: messageId=${info.messageId}`);
    return true;
  }

  async verify(): Promise<boolean> {
    const t = this.getTransporter();
    if (!t) return false;
    try {
      await t.verify();
      return true;
    } catch {
      return false;
    }
  }
}

// ── Resend Provider (HTTP API) ──────────────────────────────────

class ResendProvider implements EmailProvider {
  name = "resend";

  private get apiKey(): string {
    return process.env.RESEND_API_KEY || "";
  }

  async send(payload: EmailPayload, from: string): Promise<boolean> {
    if (!this.apiKey) return false;
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Resend API error (${resp.status}): ${text}`);
    }
    const data = (await resp.json()) as { id?: string };
    console.log(`[mailer:resend] Sent to ${payload.to}: id=${data.id}`);
    return true;
  }

  async verify(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const resp = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return resp.ok;
    } catch {
      return false;
    }
  }
}

// ── SendGrid Provider (HTTP API) ────────────────────────────────

class SendGridProvider implements EmailProvider {
  name = "sendgrid";

  private get apiKey(): string {
    return process.env.SENDGRID_API_KEY || "";
  }

  async send(payload: EmailPayload, from: string): Promise<boolean> {
    if (!this.apiKey) return false;
    const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: payload.to }] }],
        from: { email: from },
        subject: payload.subject,
        content: [{ type: "text/html", value: payload.html }],
      }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`SendGrid API error (${resp.status}): ${text}`);
    }
    console.log(`[mailer:sendgrid] Sent to ${payload.to}`);
    return true;
  }

  async verify(): Promise<boolean> {
    return !!this.apiKey;
  }
}

// ── Provider Selection ──────────────────────────────────────────

const providers: EmailProvider[] = [
  new SmtpProvider(),
  new ResendProvider(),
  new SendGridProvider(),
];

function getActiveProvider(): EmailProvider | null {
  const forced = process.env.EMAIL_PROVIDER?.toLowerCase();
  if (forced) {
    const p = providers.find(p => p.name === forced);
    if (p) return p;
    console.warn(`[mailer] Unknown EMAIL_PROVIDER "${forced}", falling back to auto-detect`);
  }
  if (process.env.SMTP_USER && process.env.SMTP_PASS) return providers[0];
  if (process.env.RESEND_API_KEY) return providers[1];
  if (process.env.SENDGRID_API_KEY) return providers[2];
  return null;
}

function getFromEmail(): string {
  return process.env.FROM_EMAIL || process.env.SMTP_USER || "";
}

// ── Retry Logic ─────────────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 8000];

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Public API ──────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FOOTER = `<p style="font-size: 12px; color: #666; margin-top: 24px;">Regards,<br/>Security Team — School by Dark Phoenix</p>`;

export function isMailerConfigured(): boolean {
  return getActiveProvider() !== null && getFromEmail() !== "";
}

export async function verifyMailer(): Promise<{ configured: boolean; provider: string | null; healthy: boolean }> {
  const provider = getActiveProvider();
  if (!provider) return { configured: false, provider: null, healthy: false };
  const healthy = await provider.verify();
  return { configured: true, provider: provider.name, healthy };
}

async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  const provider = getActiveProvider();
  const from = getFromEmail();
  if (!provider || !from) {
    console.warn("[mailer] Cannot send email — no provider configured");
    return false;
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await provider.send({ to, subject, html }, from);
    } catch (err) {
      console.error(`[mailer:${provider.name}] Attempt ${attempt + 1}/${MAX_RETRIES} failed for ${to}:`, err);
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAYS[attempt]);
      }
    }
  }
  console.error(`[mailer:${provider.name}] All ${MAX_RETRIES} attempts failed for ${to}`);
  return false;
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
