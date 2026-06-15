import { createHash } from "crypto";

const SALT = "ForceForm_Imran_Secure_2026_v2";
const ITERATIONS = 10000;

/**
 * Server-side password hashing that matches the client-side algorithm.
 * Uses SHA-256 with a fixed salt and 10,000 iterations.
 */
export function hashPassword(password: string): string {
  const encoder = new TextEncoder();
  const saltData = encoder.encode(SALT);
  const passwordData = encoder.encode(password);

  const combined = new Uint8Array(saltData.length + passwordData.length);
  combined.set(saltData);
  combined.set(passwordData, saltData.length);

  let hash = createHash("sha256").update(combined).digest();

  for (let i = 0; i < ITERATIONS; i++) {
    hash = createHash("sha256").update(hash).digest();
  }

  return Array.from(hash)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
