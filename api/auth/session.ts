import * as jose from "jose";
import { env } from "../lib/env";
import { webcrypto } from "node:crypto";

// Polyfill Web Crypto API for Node 18 / older serverless runtimes
if (typeof globalThis.crypto === "undefined") {
  (globalThis as any).crypto = webcrypto;
}

export type SessionPayload = {
  userId: number;
};

const JWT_ALG = "HS256";

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const secret = new TextEncoder().encode(env.sessionSecret);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(env.sessionSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    const userId = payload.userId;
    if (!userId || typeof userId !== "number") return null;
    return { userId };
  } catch {
    return null;
  }
}
