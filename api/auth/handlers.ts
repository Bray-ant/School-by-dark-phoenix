import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as cookie from "cookie";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session } from "@contracts/constants";
import { signSessionToken, verifySessionToken } from "./session";
import { getDb } from "../queries/connection";
import { users, passwordResetTokens, loginActivity } from "@db/schema";
import { eq, and, gt } from "drizzle-orm";
const PROTECTED_ADMIN_EMAIL = "hohenheimvon01@gmail.com";

function recordActivity(
  c: Context,
  opts: { userId?: number; username?: string; email?: string; action: string; success: boolean; details?: string },
) {
  const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || c.req.header("x-real-ip") || "unknown";
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

const BCRYPT_ROUNDS = 12;

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
        recordActivity(c, { email, action: "LOGIN", success: false, details: "Invalid credentials" });
        return c.json({ error: "Invalid email or password" }, 401);
      }

      const passwordValid = await bcrypt.compare(clientHash, user.passwordHash);
      if (!passwordValid) {
        recordActivity(c, { email, action: "LOGIN", success: false, details: "Invalid credentials" });
        return c.json({ error: "Invalid email or password" }, 401);
      }

      // Update last sign in
      await db
        .update(users)
        .set({ lastSignInAt: new Date() })
        .where(eq(users.id, user.id));

      const token = await signSessionToken({ userId: user.id });
      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      recordActivity(c, { userId: user.id, username: user.username, email: user.email, action: "LOGIN", success: true });
      return c.json({ success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
      console.error("[login] unexpected error:", err);
      return c.json({ error: "An internal error occurred. Please try again." }, 500);
    }
  };
}

export function createRegisterHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await c.req.json<{ username?: string; email?: string; passwordHash?: string }>();
      const username = body.username?.trim();
      const email = body.email?.toLowerCase().trim();
      const passwordHash = body.passwordHash;

      if (!username || !email || !passwordHash) {
        return c.json({ error: "Username, email, and password are required" }, 400);
      }

      const db = getDb();

      const [existingEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (existingEmail) {
        return c.json({ error: "An account with this email already exists" }, 409);
      }

      const [existingUsername] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      if (existingUsername) {
        return c.json({ error: "Username already taken" }, 409);
      }

      const serverHash = await bcrypt.hash(passwordHash, BCRYPT_ROUNDS);

      const [result] = await db.insert(users).values({
        username,
        email,
        passwordHash: serverHash,
        name: username,
        role: "user",
      });

      const userId = result.insertId;
      const token = await signSessionToken({ userId });
      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      recordActivity(c, { userId, username, email, action: "REGISTER", success: true });
      return c.json({ success: true, user: { id: userId, username, email, role: "user" } });
    } catch (err) {
      console.error("[register] unexpected error:", err);
      return c.json({ error: "An internal error occurred. Please try again." }, 500);
    }
  };
}

export function createLogoutHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    // Identify user before clearing session
    let logUser: { id: number; username: string; email: string } | undefined;
    try {
      const cookies = cookie.parse(c.req.header("cookie") || "");
      const sessionToken = cookies[Session.cookieName];
      if (sessionToken) {
        const claim = await verifySessionToken(sessionToken);
        if (claim) {
          const db = getDb();
          const [u] = await db.select().from(users).where(eq(users.id, claim.userId)).limit(1);
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

      // Protected admin cannot have password reset by others
      if (email === PROTECTED_ADMIN_EMAIL) {
        return c.json({ success: true }); // Silent rejection — don't reveal protection
      }

      const db = getDb();
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) {
        // Don't reveal whether email exists
        return c.json({ success: true });
      }

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await db.insert(passwordResetTokens).values({
        email,
        token,
        expiresAt,
      });

      // Never return the token in the response — it should only be sent via email.
      return c.json({ success: true });
    } catch (err) {
      console.error("[forgot-password] unexpected error:", err);
      return c.json({ error: "An internal error occurred. Please try again." }, 500);
    }
  };
}

export function createResetPasswordHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await c.req.json<{ token?: string; passwordHash?: string }>();
      const token = body.token;
      const passwordHash = body.passwordHash;

      if (!token || !passwordHash) {
        return c.json({ error: "Token and password are required" }, 400);
      }

      const db = getDb();
      const [record] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            eq(passwordResetTokens.used, 0),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!record) {
        return c.json({ error: "Invalid or expired reset token" }, 400);
      }

      // Protected admin cannot have password reset via token flow
      if (record.email === PROTECTED_ADMIN_EMAIL) {
        return c.json({ error: "This account is protected" }, 403);
      }

      const serverHash = await bcrypt.hash(passwordHash, BCRYPT_ROUNDS);

      await db
        .update(users)
        .set({ passwordHash: serverHash })
        .where(eq(users.email, record.email));

      await db
        .update(passwordResetTokens)
        .set({ used: 1 })
        .where(eq(passwordResetTokens.id, record.id));

      return c.json({ success: true });
    } catch (err) {
      console.error("[reset-password] unexpected error:", err);
      return c.json({ error: "An internal error occurred. Please try again." }, 500);
    }
  };
}

/**
 * Self-service password change for the protected admin.
 * Requires current password + new password.
 */
export function createChangePasswordHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    try {
      // Verify caller is authenticated
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

      const body = await c.req.json<{ currentPasswordHash?: string; newPasswordHash?: string }>();
      const { currentPasswordHash, newPasswordHash } = body;

      if (!currentPasswordHash || !newPasswordHash) {
        return c.json({ error: "Current and new password are required" }, 400);
      }

      const db = getDb();
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      const currentValid = await bcrypt.compare(currentPasswordHash, user.passwordHash);
      if (!currentValid) {
        return c.json({ error: "Current password is incorrect" }, 401);
      }

      const newServerHash = await bcrypt.hash(newPasswordHash, BCRYPT_ROUNDS);
      await db.update(users).set({ passwordHash: newServerHash }).where(eq(users.id, userId));

      return c.json({ success: true });
    } catch (err) {
      console.error("[change-password] unexpected error:", err);
      return c.json({ error: "An internal error occurred. Please try again." }, 500);
    }
  };
}
