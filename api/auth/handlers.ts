import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as cookie from "cookie";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session } from "@contracts/constants";
import { signSessionToken, verifySessionToken } from "./session";
import { getDb } from "../queries/connection";
import {
  users,
  otpTokens,
  passwordResetTokens,
  passwordHistory,
  loginActivity,
} from "@db/schema";
import { eq, and, gt, desc } from "drizzle-orm";
import { sendOtpEmail, sendPasswordResetEmail, sendPasswordChangeConfirmation, sendAccountLockedEmail } from "../lib/mailer";
import { validatePasswordStrength } from "../lib/password-policy";

const BCRYPT_ROUNDS = 12;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESET_TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
const MAX_OTP_ATTEMPTS = 5;
const PASSWORD_HISTORY_LIMIT = 5;

// Progressive lockout thresholds
const LOCKOUT_POLICY = [
  { attempts: 5, durationMs: 15 * 60 * 1000 }, // 15 min
  { attempts: 10, durationMs: 60 * 60 * 1000 }, // 1 hour
  { attempts: 20, durationMs: 24 * 60 * 60 * 1000 }, // 24 hours + email
];

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

// ── Helpers ──────────────────────────────────────────────────────

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateOtp(): string {
  const bytes = randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1_000_000;
  return num.toString().padStart(6, "0");
}

function generateResetToken(): string {
  return randomBytes(64).toString("base64url");
}

function getClientInfo(c: Context) {
  const ip =
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("x-real-ip") ||
    "unknown";
  const userAgent = c.req.header("user-agent")?.slice(0, 500) || "unknown";
  return { ip, userAgent };
}

function recordActivity(
  c: Context,
  opts: {
    userId?: number;
    username?: string;
    email?: string;
    action: string;
    success: boolean;
    details?: string;
  },
) {
  const { ip, userAgent } = getClientInfo(c);
  const db = getDb();
  db.insert(loginActivity)
    .values({
      userId: opts.userId ?? null,
      username: opts.username ?? null,
      email: opts.email ?? null,
      action: opts.action,
      success: opts.success ? 1 : 0,
      ipAddress: ip,
      userAgent,
      details: opts.details ?? null,
    })
    .execute()
    .catch((err) => {
      console.error("[recordActivity] failed to log activity:", err);
    });
}

function getLockoutDuration(failedAttempts: number): number {
  let duration = 0;
  for (const tier of LOCKOUT_POLICY) {
    if (failedAttempts >= tier.attempts) {
      duration = tier.durationMs;
    }
  }
  return duration;
}

async function checkPasswordHistory(
  userId: number,
  newPasswordHash: string,
): Promise<boolean> {
  const db = getDb();
  const history = await db
    .select({ passwordHash: passwordHistory.passwordHash })
    .from(passwordHistory)
    .where(eq(passwordHistory.userId, userId))
    .orderBy(desc(passwordHistory.createdAt))
    .limit(PASSWORD_HISTORY_LIMIT);

  for (const entry of history) {
    if (await bcrypt.compare(newPasswordHash, entry.passwordHash)) {
      return true; // matches a previous password
    }
  }
  return false;
}

async function savePasswordHistory(
  userId: number,
  hash: string,
): Promise<void> {
  const db = getDb();
  await db.insert(passwordHistory).values({ userId, passwordHash: hash });
}

// ── Login ────────────────────────────────────────────────────────

export function createLoginHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await c.req.json<{ email?: string; passwordHash?: string }>();
      const email = body.email?.toLowerCase().trim();
      const clientHash = body.passwordHash;

      if (!email || !clientHash) {
        return c.json({ error: "Email and password are required" }, 400);
      }

      const db = getDb();
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        recordActivity(c, {
          email,
          action: "LOGIN",
          success: false,
          details: "Invalid credentials",
        });
        return c.json({ error: "Invalid email or password" }, 401);
      }

      // Check account lock
      if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
        const remainingMs = user.accountLockedUntil.getTime() - Date.now();
        const remainingMin = Math.ceil(remainingMs / 60000);
        recordActivity(c, {
          userId: user.id,
          email,
          action: "LOGIN",
          success: false,
          details: `Account locked for ${remainingMin} more minutes`,
        });
        return c.json(
          {
            error: `Account is temporarily locked. Try again in ${remainingMin} minute${remainingMin !== 1 ? "s" : ""}.`,
          },
          423,
        );
      }

      // Check email verification
      if (!user.emailVerified) {
        recordActivity(c, {
          userId: user.id,
          email,
          action: "LOGIN",
          success: false,
          details: "Email not verified",
        });
        return c.json(
          { error: "Please verify your email before logging in." },
          403,
        );
      }

      const isBcryptHash = user.passwordHash.startsWith("$2");
      const passwordValid = isBcryptHash
        ? await bcrypt.compare(clientHash, user.passwordHash)
        : clientHash === user.passwordHash;

      if (!passwordValid) {
        const newFailedAttempts = (user.failedLoginAttempts ?? 0) + 1;
        const lockDuration = getLockoutDuration(newFailedAttempts);
        const lockUntil = lockDuration
          ? new Date(Date.now() + lockDuration)
          : null;

        await db
          .update(users)
          .set({
            failedLoginAttempts: newFailedAttempts,
            ...(lockUntil ? { accountLockedUntil: lockUntil } : {}),
          })
          .where(eq(users.id, user.id));

        // Send lockout email at 20 failed attempts
        if (newFailedAttempts >= 20) {
          const { ip, userAgent } = getClientInfo(c);
          sendAccountLockedEmail(
            user.email,
            user.firstName || user.username,
            ip,
            userAgent,
          ).catch(() => {});
        }

        recordActivity(c, {
          userId: user.id,
          email,
          action: lockUntil ? "ACCOUNT_LOCKOUT" : "LOGIN",
          success: false,
          details: lockUntil
            ? `Account locked after ${newFailedAttempts} failures`
            : "Invalid credentials",
        });

        if (lockUntil) {
          const lockMin = Math.ceil(lockDuration / 60000);
          return c.json(
            {
              error: `Too many failed attempts. Account locked for ${lockMin} minute${lockMin !== 1 ? "s" : ""}.`,
            },
            423,
          );
        }

        return c.json({ error: "Invalid email or password" }, 401);
      }

      // Successful login — reset lockout
      const newHash = isBcryptHash
        ? undefined
        : await bcrypt.hash(clientHash, BCRYPT_ROUNDS);

      await db
        .update(users)
        .set({
          lastSignInAt: new Date(),
          failedLoginAttempts: 0,
          accountLockedUntil: null,
          ...(newHash ? { passwordHash: newHash } : {}),
        })
        .where(eq(users.id, user.id));

      const token = await signSessionToken({ userId: user.id });
      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      recordActivity(c, {
        userId: user.id,
        username: user.username,
        email: user.email,
        action: "LOGIN",
        success: true,
      });
      return c.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("[login] unexpected error:", err);
      return c.json(
        { error: "An internal error occurred. Please try again." },
        500,
      );
    }
  };
}

// ── Register (Step 1: validate + send OTP) ───────────────────────

export function createRegisterHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await c.req.json<{
        firstName?: string;
        lastName?: string;
        username?: string;
        email?: string;
        passwordHash?: string;
        rawPassword?: string;
        acceptTerms?: boolean;
      }>();
      const firstName = body.firstName?.trim();
      const lastName = body.lastName?.trim();
      const username = body.username?.trim();
      const email = body.email?.toLowerCase().trim();
      const passwordHash = body.passwordHash;
      const rawPassword = body.rawPassword;
      const acceptTerms = body.acceptTerms;

      if (!firstName || !lastName || !username || !email || !passwordHash) {
        return c.json(
          { error: "All fields are required" },
          400,
        );
      }

      if (!acceptTerms) {
        return c.json(
          { error: "You must accept the Terms & Conditions" },
          400,
        );
      }

      // Username validation
      if (!USERNAME_REGEX.test(username)) {
        return c.json(
          {
            error:
              "Username must be 3–30 characters, letters, numbers, and underscores only",
          },
          400,
        );
      }

      // Server-side password strength validation
      if (rawPassword) {
        if (rawPassword.length > 128) {
          return c.json({ error: "Password must not exceed 128 characters" }, 400);
        }
        const pwCheck = validatePasswordStrength(rawPassword);
        if (!pwCheck.valid) {
          return c.json({ error: pwCheck.errors[0] }, 400);
        }
        // Must not contain username or email
        const lowerPw = rawPassword.toLowerCase();
        if (lowerPw.includes(username.toLowerCase())) {
          return c.json({ error: "Password must not contain your username" }, 400);
        }
        if (lowerPw.includes(email.split("@")[0].toLowerCase())) {
          return c.json({ error: "Password must not contain your email address" }, 400);
        }
      }

      const db = getDb();

      const [existingEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (existingEmail) {
        return c.json(
          { error: "An account with this email already exists" },
          409,
        );
      }

      const [existingUsername] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      if (existingUsername) {
        return c.json({ error: "Username already taken" }, 409);
      }

      // Generate and send OTP for email verification
      const otp = generateOtp();
      const otpHash = hashToken(otp);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

      await db.insert(otpTokens).values({
        email,
        otp: otpHash,
        purpose: "REGISTER",
        expiresAt,
      });

      const { ip } = getClientInfo(c);
      const emailSent = await sendOtpEmail(
        email,
        otp,
        "registration",
        firstName,
        ip,
        new Date().toISOString(),
      );

      recordActivity(c, {
        email,
        username,
        action: "REGISTER_OTP",
        success: true,
        details: emailSent ? "OTP sent via email" : "OTP generated (no SMTP)",
      });

      if (!emailSent) {
        return c.json({
          success: true,
          requiresOtp: true,
          otp,
          message: "OTP generated. SMTP not configured — showing OTP directly.",
        });
      }

      return c.json({
        success: true,
        requiresOtp: true,
        message:
          "A verification code has been sent to your email. Please enter it to complete registration.",
      });
    } catch (err) {
      console.error("[register] unexpected error:", err);
      return c.json(
        { error: "An internal error occurred. Please try again." },
        500,
      );
    }
  };
}

// ── Verify OTP & Complete Registration ──────────────────────────

export function createVerifyOtpHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await c.req.json<{
        email?: string;
        otp?: string;
        firstName?: string;
        lastName?: string;
        username?: string;
        passwordHash?: string;
        acceptTerms?: boolean;
      }>();
      const email = body.email?.toLowerCase().trim();
      const otp = body.otp?.trim();
      const firstName = body.firstName?.trim();
      const lastName = body.lastName?.trim();
      const username = body.username?.trim();
      const passwordHash = body.passwordHash;

      if (!email || !otp || !username || !passwordHash || !firstName || !lastName) {
        return c.json(
          { error: "All fields are required" },
          400,
        );
      }

      const db = getDb();
      const otpHash = hashToken(otp);

      const [record] = await db
        .select()
        .from(otpTokens)
        .where(
          and(
            eq(otpTokens.email, email),
            eq(otpTokens.otp, otpHash),
            eq(otpTokens.purpose, "REGISTER"),
            eq(otpTokens.used, 0),
            gt(otpTokens.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (!record) {
        const [existing] = await db
          .select()
          .from(otpTokens)
          .where(
            and(
              eq(otpTokens.email, email),
              eq(otpTokens.purpose, "REGISTER"),
              eq(otpTokens.used, 0),
              gt(otpTokens.expiresAt, new Date()),
            ),
          )
          .limit(1);

        if (existing) {
          const newAttempts = (existing.attempts ?? 0) + 1;
          await db
            .update(otpTokens)
            .set({ attempts: newAttempts })
            .where(eq(otpTokens.id, existing.id));

          if (newAttempts >= MAX_OTP_ATTEMPTS) {
            await db
              .update(otpTokens)
              .set({ used: 1 })
              .where(eq(otpTokens.id, existing.id));

            recordActivity(c, {
              email,
              action: "OTP_VERIFY",
              success: false,
              details: "Max attempts exceeded — OTP invalidated",
            });
            return c.json(
              {
                error:
                  "Too many invalid attempts. Please request a new verification code.",
              },
              429,
            );
          }
        }

        recordActivity(c, {
          email,
          action: "OTP_VERIFY",
          success: false,
          details: "Invalid or expired OTP",
        });
        return c.json({ error: "Invalid or expired verification code" }, 400);
      }

      // Mark OTP as used
      await db
        .update(otpTokens)
        .set({ used: 1 })
        .where(eq(otpTokens.id, record.id));

      // Create the user account
      const serverHash = await bcrypt.hash(passwordHash, BCRYPT_ROUNDS);

      const [result] = await db.insert(users).values({
        firstName,
        lastName,
        username,
        email,
        passwordHash: serverHash,
        name: `${firstName} ${lastName}`,
        role: "user",
        isVerified: 1,
        emailVerified: 1,
        acceptedTermsAt: new Date(),
      });

      const userId = result.insertId;

      // Save initial password to history
      await savePasswordHistory(userId, serverHash);

      const sessionToken = await signSessionToken({ userId });
      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, sessionToken, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      recordActivity(c, {
        userId,
        username,
        email,
        action: "REGISTER",
        success: true,
        details: "OTP verified, account created",
      });

      return c.json({
        success: true,
        user: { id: userId, username, email, role: "user" },
      });
    } catch (err) {
      console.error("[verify-otp] unexpected error:", err);
      return c.json(
        { error: "An internal error occurred. Please try again." },
        500,
      );
    }
  };
}

// ── Resend OTP ──────────────────────────────────────────────────

export function createResendOtpHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await c.req.json<{
        email?: string;
        purpose?: string;
        firstName?: string;
      }>();
      const email = body.email?.toLowerCase().trim();
      const purpose = body.purpose === "RESET_PASSWORD" ? "RESET_PASSWORD" : "REGISTER";
      const firstName = body.firstName?.trim();

      if (!email) {
        return c.json({ error: "Email is required" }, 400);
      }

      const db = getDb();

      // Invalidate existing unused OTPs for this email+purpose
      await db
        .update(otpTokens)
        .set({ used: 1 })
        .where(
          and(
            eq(otpTokens.email, email),
            eq(otpTokens.purpose, purpose),
            eq(otpTokens.used, 0),
          ),
        );

      const otp = generateOtp();
      const otpHash = hashToken(otp);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

      await db.insert(otpTokens).values({
        email,
        otp: otpHash,
        purpose,
        expiresAt,
      });

      const { ip } = getClientInfo(c);
      const emailPurpose = purpose === "RESET_PASSWORD" ? "password reset" : "registration";
      const emailSent = await sendOtpEmail(
        email,
        otp,
        emailPurpose as "registration" | "password reset",
        firstName || undefined,
        ip,
        new Date().toISOString(),
      );

      recordActivity(c, {
        email,
        action: "RESEND_OTP",
        success: true,
        details: emailSent
          ? `${emailPurpose} OTP resent via email`
          : `${emailPurpose} OTP generated (no SMTP)`,
      });

      if (!emailSent) {
        return c.json({ success: true, otp });
      }

      return c.json({ success: true });
    } catch (err) {
      console.error("[resend-otp] unexpected error:", err);
      return c.json(
        { error: "An internal error occurred. Please try again." },
        500,
      );
    }
  };
}

// ── Logout ───────────────────────────────────────────────────────

export function createLogoutHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    let logUser: { id: number; username: string; email: string } | undefined;
    try {
      const cookies = cookie.parse(c.req.header("cookie") || "");
      const sessionToken = cookies[Session.cookieName];
      if (sessionToken) {
        const claim = await verifySessionToken(sessionToken);
        if (claim) {
          const db = getDb();
          const [u] = await db
            .select()
            .from(users)
            .where(eq(users.id, claim.userId))
            .limit(1);
          if (u) logUser = { id: u.id, username: u.username, email: u.email };
        }
      }
    } catch (err) {
      console.warn("[logout] failed to identify user for activity log:", err);
    }

    const opts = getSessionCookieOptions(c.req.raw.headers);
    const serialized = cookie.serialize(Session.cookieName, "", {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge: 0,
    });
    c.res.headers.append("set-cookie", serialized);

    recordActivity(c, {
      userId: logUser?.id,
      username: logUser?.username,
      email: logUser?.email,
      action: "LOGOUT",
      success: true,
    });

    return c.json({ success: true });
  };
}

// ── Forgot Password (sends reset token via email) ────────────────

export function createForgotPasswordHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await c.req.json<{ email?: string }>();
      const email = body.email?.toLowerCase().trim();
      if (!email) {
        return c.json({ error: "Email is required" }, 400);
      }

      // Always return the same response to prevent user enumeration
      const genericResponse = {
        success: true,
        message: "If an account exists, a password reset email has been sent.",
      };

      const db = getDb();
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (!user) {
        return c.json(genericResponse);
      }

      const rawToken = generateResetToken();
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

      await db.insert(passwordResetTokens).values({
        email,
        token: tokenHash,
        expiresAt,
      });

      const { ip, userAgent } = getClientInfo(c);
      const emailSent = await sendPasswordResetEmail(
        email,
        rawToken,
        user.firstName || user.username,
        ip,
        userAgent,
        new Date().toISOString(),
      );

      recordActivity(c, {
        userId: user.id,
        email,
        action: "PASSWORD_RESET_REQ",
        success: true,
        details: emailSent
          ? "Reset email sent"
          : "Reset token generated (no SMTP)",
      });

      // If SMTP not configured, return token for development/testing
      if (!emailSent) {
        return c.json({ ...genericResponse, token: rawToken });
      }

      return c.json(genericResponse);
    } catch (err) {
      console.error("[forgot-password] unexpected error:", err);
      return c.json(
        { error: "An internal error occurred. Please try again." },
        500,
      );
    }
  };
}

// ── Reset Password (verify token + set new password) ─────────────

export function createResetPasswordHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await c.req.json<{
        token?: string;
        passwordHash?: string;
        rawPassword?: string;
      }>();
      const token = body.token?.trim();
      const passwordHash = body.passwordHash;
      const rawPassword = body.rawPassword;

      if (!token || !passwordHash) {
        return c.json(
          { error: "Reset token and new password are required" },
          400,
        );
      }

      // Server-side password strength validation
      if (rawPassword) {
        if (rawPassword.length > 128) {
          return c.json({ error: "Password must not exceed 128 characters" }, 400);
        }
        const pwCheck = validatePasswordStrength(rawPassword);
        if (!pwCheck.valid) {
          return c.json({ error: pwCheck.errors[0] }, 400);
        }
      }

      const tokenHash = hashToken(token);
      const db = getDb();
      const [record] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, tokenHash),
            eq(passwordResetTokens.used, 0),
            gt(passwordResetTokens.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (!record) {
        recordActivity(c, {
          action: "PASSWORD_RESET",
          success: false,
          details: "Invalid or expired reset token",
        });
        return c.json({ error: "Invalid or expired reset token" }, 400);
      }

      // Get user to check password history
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, record.email))
        .limit(1);

      if (user) {
        // Check current password
        if (await bcrypt.compare(passwordHash, user.passwordHash)) {
          return c.json(
            { error: "New password must be different from your current password" },
            400,
          );
        }

        // Check password history
        const inHistory = await checkPasswordHistory(user.id, passwordHash);
        if (inHistory) {
          return c.json(
            { error: "Cannot reuse any of your previous 5 passwords" },
            400,
          );
        }

        // Check password doesn't contain username/email
        if (rawPassword) {
          const lowerPw = rawPassword.toLowerCase();
          if (lowerPw.includes(user.username.toLowerCase())) {
            return c.json({ error: "Password must not contain your username" }, 400);
          }
          if (lowerPw.includes(user.email.split("@")[0].toLowerCase())) {
            return c.json({ error: "Password must not contain your email address" }, 400);
          }
        }
      }

      const serverHash = await bcrypt.hash(passwordHash, BCRYPT_ROUNDS);

      // Update password
      await db
        .update(users)
        .set({ passwordHash: serverHash })
        .where(eq(users.email, record.email));

      // Save to password history
      if (user) {
        await savePasswordHistory(user.id, serverHash);
      }

      // Invalidate ALL reset tokens for this email
      await db
        .update(passwordResetTokens)
        .set({ used: 1 })
        .where(eq(passwordResetTokens.email, record.email));

      // Also invalidate any reset OTPs
      await db
        .update(otpTokens)
        .set({ used: 1 })
        .where(
          and(
            eq(otpTokens.email, record.email),
            eq(otpTokens.purpose, "RESET_PASSWORD"),
          ),
        );

      // Send password change confirmation email
      if (user) {
        const { ip, userAgent } = getClientInfo(c);
        sendPasswordChangeConfirmation(
          user.email,
          user.firstName || user.username,
          ip,
          userAgent,
          new Date().toISOString(),
        ).catch(() => {});
      }

      recordActivity(c, {
        email: record.email,
        action: "PASSWORD_RESET",
        success: true,
        details: "Password changed via reset token, all tokens invalidated",
      });

      return c.json({ success: true });
    } catch (err) {
      console.error("[reset-password] unexpected error:", err);
      return c.json(
        { error: "An internal error occurred. Please try again." },
        500,
      );
    }
  };
}

// ── Change Password (authenticated) ─────────────────────────────

export function createChangePasswordHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    try {
      let userId: number | undefined;
      try {
        const cookies = cookie.parse(c.req.header("cookie") || "");
        const sessionToken = cookies[Session.cookieName];
        if (sessionToken) {
          const claim = await verifySessionToken(sessionToken);
          if (claim) userId = claim.userId;
        }
      } catch (err) {
        console.warn("[change-password] failed to verify session:", err);
      }

      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json<{
        currentPasswordHash?: string;
        newPasswordHash?: string;
        rawNewPassword?: string;
      }>();
      const { currentPasswordHash, newPasswordHash, rawNewPassword } = body;

      if (!currentPasswordHash || !newPasswordHash) {
        return c.json(
          { error: "Current and new password are required" },
          400,
        );
      }

      const db = getDb();
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      // Server-side password strength validation
      if (rawNewPassword) {
        if (rawNewPassword.length > 128) {
          return c.json({ error: "Password must not exceed 128 characters" }, 400);
        }
        const pwCheck = validatePasswordStrength(rawNewPassword);
        if (!pwCheck.valid) {
          return c.json({ error: pwCheck.errors[0] }, 400);
        }
        const lowerPw = rawNewPassword.toLowerCase();
        if (lowerPw.includes(user.username.toLowerCase())) {
          return c.json({ error: "Password must not contain your username" }, 400);
        }
        if (lowerPw.includes(user.email.split("@")[0].toLowerCase())) {
          return c.json({ error: "Password must not contain your email address" }, 400);
        }
      }

      const currentValid = await bcrypt.compare(
        currentPasswordHash,
        user.passwordHash,
      );
      if (!currentValid) {
        recordActivity(c, {
          userId,
          username: user.username,
          email: user.email,
          action: "PASSWORD_CHANGE",
          success: false,
          details: "Current password incorrect",
        });
        return c.json({ error: "Current password is incorrect" }, 401);
      }

      // Check not same as current
      if (await bcrypt.compare(newPasswordHash, user.passwordHash)) {
        return c.json(
          { error: "New password must be different from your current password" },
          400,
        );
      }

      // Check password history
      const inHistory = await checkPasswordHistory(userId, newPasswordHash);
      if (inHistory) {
        return c.json(
          { error: "Cannot reuse any of your previous 5 passwords" },
          400,
        );
      }

      const newServerHash = await bcrypt.hash(newPasswordHash, BCRYPT_ROUNDS);
      await db
        .update(users)
        .set({ passwordHash: newServerHash })
        .where(eq(users.id, userId));

      // Save to password history
      await savePasswordHistory(userId, newServerHash);

      // Invalidate any outstanding reset tokens
      await db
        .update(passwordResetTokens)
        .set({ used: 1 })
        .where(eq(passwordResetTokens.email, user.email));

      // Invalidate any outstanding OTPs
      await db
        .update(otpTokens)
        .set({ used: 1 })
        .where(
          and(
            eq(otpTokens.email, user.email),
            eq(otpTokens.purpose, "RESET_PASSWORD"),
          ),
        );

      // Send confirmation email
      const { ip, userAgent } = getClientInfo(c);
      sendPasswordChangeConfirmation(
        user.email,
        user.firstName || user.username,
        ip,
        userAgent,
        new Date().toISOString(),
      ).catch(() => {});

      recordActivity(c, {
        userId,
        username: user.username,
        email: user.email,
        action: "PASSWORD_CHANGE",
        success: true,
        details: "Password changed, all tokens invalidated",
      });

      // Clear the current session cookie so user must re-login
      const opts = getSessionCookieOptions(c.req.raw.headers);
      const serialized = cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      });
      c.res.headers.append("set-cookie", serialized);

      return c.json({ success: true, requiresReLogin: true });
    } catch (err) {
      console.error("[change-password] unexpected error:", err);
      return c.json(
        { error: "An internal error occurred. Please try again." },
        500,
      );
    }
  };
}
