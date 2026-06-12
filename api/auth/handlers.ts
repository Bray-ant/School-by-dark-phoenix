import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as cookie from "cookie";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session } from "@contracts/constants";
import { signSessionToken } from "./session";
import { getDb } from "../queries/connection";
import { users, passwordResetTokens } from "@db/schema";
import { eq, and, gt } from "drizzle-orm";

export function createLoginHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    const body = await c.req.json<{ email?: string; passwordHash?: string }>();
    const email = body.email?.toLowerCase().trim();
    const passwordHash = body.passwordHash;

    if (!email || !passwordHash) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || user.passwordHash !== passwordHash) {
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

    return c.json({ success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  };
}

export function createRegisterHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

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

    const [result] = await db.insert(users).values({
      username,
      email,
      passwordHash,
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

    return c.json({ success: true, user: { id: userId, username, email, role: "user" } });
  };
}

export function createLogoutHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
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

    return c.json({ success: true });
  };
}

export function createForgotPasswordHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    const body = await c.req.json<{ email?: string }>();
    const email = body.email?.toLowerCase().trim();
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      // Don't reveal whether email exists
      return c.json({ success: true });
    }

    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await db.insert(passwordResetTokens).values({
      email,
      token,
      expiresAt,
    });

    return c.json({ success: true, token });
  };
}

export function createResetPasswordHandler() {
  return async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

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

    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.email, record.email));

    await db
      .update(passwordResetTokens)
      .set({ used: 1 })
      .where(eq(passwordResetTokens.id, record.id));

    return c.json({ success: true });
  };
}
