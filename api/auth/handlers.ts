import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as cookie from "cookie";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session } from "@contracts/constants";
import { signSessionToken, verifySessionToken } from "./session";
import { getDb } from "../queries/connection";
import { users, passwordResetTokens, otpTokens, loginActivity } from "@db/schema";
import { eq, and, gt } from "drizzle-orm";
import { sendPasswordResetEmail, sendOtpEmail } from "../lib/mailer";
import { validatePasswordStrength } from "../lib/password-policy";

const BCRYPT_ROUNDS = 12;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESET_TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
const MAX_OTP_ATTEMPTS = 5;

// ── Helpers ──────────────────────────────────────────────────────

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateOtp(): string {
  const bytes = randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1_000_000;
  return num.toString().padStart(6, "0");
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
  const ip =
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("x-real-ip") ||
    "unknown";
  const userAgent = c.req.header("user-agent")?.slice(0, 500) || null;
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

      const isBcryptHash = user.passwordHash.startsWith("$2");
      const passwordValid = isBcryptHash
        ? await bcrypt.compare(clientHash, user.passwordHash)
        : clientHash === user.passwordHash;

      if (!passwordValid) {
        recordActivity(c, {
          userId: user.id,
          email,
          action: "LOGIN",
          success: false,
          details: "Invalid credentials",
        });
        return c.json({ error: "Invalid email or password" }, 401);
      }

      // Migrate legacy SHA-256 hash to bcrypt on successful login
      const newHash = isBcryptHash
        ? undefined
        : await bcrypt.hash(clientHash, BCRYPT_ROUNDS);

      await db
        .update(users)
        .set({
          lastSignInAt: new Date(),
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

// ── Register (Step 1: send OTP) ──────────────────────────────────

export function createRegisterHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await c.req.json<{
        username?: string;
        email?: string;
        passwordHash?: string;
        rawPassword?: string;
      }>();
      const username = body.username?.trim();
      const email = body.email?.toLowerCase().trim();
      const passwordHash = body.passwordHash;
      const rawPassword = body.rawPassword;

      if (!username || !email || !passwordHash) {
        return c.json(
          { error: "Username, email, and password are required" },
          400,
        );
      }

      // Server-side password strength validation
      if (rawPassword) {
        const pwCheck = validatePasswordStrength(rawPassword);
        if (!pwCheck.valid) {
          return c.json({ error: pwCheck.errors[0] }, 400);
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

      const emailSent = await sendOtpEmail(email, otp, username);

      recordActivity(c, {
        email,
        username,
        action: "REGISTER_OTP",
        success: true,
        details: emailSent ? "OTP sent via email" : "OTP generated (no SMTP)",
      });

      // If SMTP not configured, return OTP for development/testing
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
        username?: string;
        passwordHash?: string;
      }>();
      const email = body.email?.toLowerCase().trim();
      const otp = body.otp?.trim();
      const username = body.username?.trim();
      const passwordHash = body.passwordHash;

      if (!email || !otp || !username || !passwordHash) {
        return c.json(
          { error: "Email, OTP, username, and password are required" },
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
        // Check if there's an unused token for this email to increment attempts
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
        username,
        email,
        passwordHash: serverHash,
        name: username,
        role: "user",
        isVerified: 1,
      });

      const userId = result.insertId;
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

// ── Forgot Password ──────────────────────────────────────────────

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

      const db = getDb();
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (!user) {
        // Don't reveal whether email exists
        return c.json({ success: true });
      }

      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

      await db.insert(passwordResetTokens).values({
        email,
        token: tokenHash,
        expiresAt,
      });

      const emailSent = await sendPasswordResetEmail(
        email,
        rawToken,
        user.username,
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

      // If SMTP not configured, return token for development
      if (!emailSent) {
        return c.json({ success: true, token: rawToken });
      }

      return c.json({ success: true });
    } catch (err) {
      console.error("[forgot-password] unexpected error:", err);
      return c.json(
        { error: "An internal error occurred. Please try again." },
        500,
      );
    }
  };
}

// ── Reset Password ───────────────────────────────────────────────

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
      const token = body.token;
      const passwordHash = body.passwordHash;
      const rawPassword = body.rawPassword;

      if (!token || !passwordHash) {
        return c.json({ error: "Token and password are required" }, 400);
      }

      // Server-side password strength validation
      if (rawPassword) {
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

      const serverHash = await bcrypt.hash(passwordHash, BCRYPT_ROUNDS);

      // Update password
      await db
        .update(users)
        .set({ passwordHash: serverHash })
        .where(eq(users.email, record.email));

      // Invalidate ALL reset tokens for this email (not just the used one)
      await db
        .update(passwordResetTokens)
        .set({ used: 1 })
        .where(eq(passwordResetTokens.email, record.email));

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

      // Server-side password strength validation
      if (rawNewPassword) {
        const pwCheck = validatePasswordStrength(rawNewPassword);
        if (!pwCheck.valid) {
          return c.json({ error: pwCheck.errors[0] }, 400);
        }
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

      const newServerHash = await bcrypt.hash(newPasswordHash, BCRYPT_ROUNDS);
      await db
        .update(users)
        .set({ passwordHash: newServerHash })
        .where(eq(users.id, userId));

      // Invalidate any outstanding reset tokens for this user
      await db
        .update(passwordResetTokens)
        .set({ used: 1 })
        .where(eq(passwordResetTokens.email, user.email));

      recordActivity(c, {
        userId,
        username: user.username,
        email: user.email,
        action: "PASSWORD_CHANGE",
        success: true,
        details: "Password changed, reset tokens invalidated",
      });

      // Clear the current session cookie so user must re-login with new password
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
