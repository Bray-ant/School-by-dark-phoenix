import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("env module", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset module registry so the env module re-evaluates
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("reads DATABASE_URL and SESSION_SECRET from process.env", async () => {
    process.env.DATABASE_URL = "mysql://test:test@localhost/testdb";
    process.env.SESSION_SECRET = "test-secret-123";
    process.env.NODE_ENV = "development";

    const { env } = await import("./env");
    expect(env.databaseUrl).toBe("mysql://test:test@localhost/testdb");
    expect(env.sessionSecret).toBe("test-secret-123");
  });

  it("uses defaults for optional variables", async () => {
    process.env.DATABASE_URL = "mysql://x";
    process.env.SESSION_SECRET = "s";
    process.env.NODE_ENV = "development";
    delete process.env.KIMI_API_KEY;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;

    const { env } = await import("./env");
    expect(env.kimiApiKey).toBe("");
    expect(env.smtpHost).toBe("smtp.gmail.com");
    expect(env.smtpPort).toBe(587);
  });

  it("isProduction reflects NODE_ENV", async () => {
    process.env.DATABASE_URL = "x";
    process.env.SESSION_SECRET = "s";
    process.env.NODE_ENV = "production";

    const { env } = await import("./env");
    expect(env.isProduction).toBe(true);
  });

  it("throws when required var is missing in production", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;
    delete process.env.SESSION_SECRET;

    await expect(import("./env")).rejects.toThrow(
      "Missing required environment variable"
    );
  });

  it("returns empty string for missing required var in development", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.DATABASE_URL;
    delete process.env.SESSION_SECRET;

    const { env } = await import("./env");
    expect(env.databaseUrl).toBe("");
    expect(env.sessionSecret).toBe("");
  });
});
