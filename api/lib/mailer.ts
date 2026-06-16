import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
const fromEmail = process.env.FROM_EMAIL || smtpUser;

console.log(
  `[mailer] SMTP config: host=${smtpHost} port=${smtpPort} user=${smtpUser ? smtpUser.slice(0, 3) + "***" : "(empty)"} from=${fromEmail ? fromEmail.slice(0, 3) + "***" : "(empty)"}`,
);

const transporter =
  smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      })
    : null;

if (!transporter) {
  console.warn("[mailer] SMTP not configured — emails will not be sent. Set SMTP_USER and SMTP_PASS env vars.");
}

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

async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
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

export async function sendOtpEmail(
  email: string,
  otp: string,
  purpose: "registration" | "password reset",
  username?: string,
): Promise<boolean> {
  const safeName = escapeHtml(username || "there");
  const purposeLabel = purpose === "registration" ? "Verify Your Account" : "Password Reset Code";
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="color: #3b82f6;">${purposeLabel}</h2>
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
  return sendMail(email, `${purposeLabel} — School by Dark Phoenix`, html);
}
