import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
const fromEmail = process.env.FROM_EMAIL || "";

const transporter =
  smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      })
    : null;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isMailerConfigured(): boolean {
  return transporter !== null && fromEmail !== "";
}

const APP_URL =
  process.env.APP_URL || "https://school-by-dark-phoenix.onrender.com";

async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  if (!transporter || !fromEmail) {
    console.warn("[mailer] SMTP not configured — cannot send email");
    return false;
  }
  try {
    await transporter.sendMail({ from: fromEmail, to, subject, html });
    return true;
  } catch (err) {
    console.error("[mailer] Failed to send email:", err);
    return false;
  }
}

export async function sendOtpEmail(
  email: string,
  otp: string,
  username?: string,
): Promise<boolean> {
  const safeName = escapeHtml(username || "there");
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="color: #3b82f6;">Verify Your Account</h2>
      <p>Hello ${safeName},</p>
      <p>Your verification code is:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0; text-align: center;">
        <code style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #111;">${escapeHtml(otp)}</code>
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p style="color: #dc2626; font-size: 13px; margin-top: 16px;">
        ⚠ Do not share this code with anyone. Our team will never ask for your verification code.
      </p>
      <p style="margin-top: 24px; font-size: 12px; color: #666;">
        If you did not request this code, please ignore this email.
      </p>
      <p style="font-size: 12px; color: #666;">Regards,<br/>Security Team</p>
    </div>
  `;
  return sendMail(email, "Verify Your Account — School by Dark Phoenix", html);
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  username?: string,
): Promise<boolean> {
  const safeName = escapeHtml(username || "there");
  const resetUrl = `${APP_URL}/#/reset-password?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="color: #3b82f6;">Password Reset Request</h2>
      <p>Hello ${safeName},</p>
      <p>We received a request to reset your password.</p>
      <p>Reset your password using the link below:</p>
      <a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;margin-top:8px;">Reset Password</a>
      <p style="margin-top: 16px;">Or use this reset token:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 8px 0; text-align: center;">
        <code style="font-size: 12px; letter-spacing: 1px; word-break: break-all;">${escapeHtml(token)}</code>
      </div>
      <p>This link and token will expire in <strong>30 minutes</strong>.</p>
      <p style="color: #dc2626; font-size: 13px; margin-top: 16px;">
        ⚠ If you did not request a password reset, please ignore this email and contact support if necessary.
      </p>
      <p style="font-size: 12px; color: #666;">Regards,<br/>Security Team</p>
    </div>
  `;
  return sendMail(email, "Password Reset Request — School by Dark Phoenix", html);
}
