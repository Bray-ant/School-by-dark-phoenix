import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("callGoogleAiChat", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("throws when Google AI key is not configured", async () => {
    process.env.DATABASE_URL = "x";
    process.env.SESSION_SECRET = "s";
    delete process.env.GOOGLE_AI_KEY;
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    const { callGoogleAiChat } = await import("./google-ai");
    await expect(
      callGoogleAiChat([{ role: "user", content: "hello" }])
    ).rejects.toThrow("Google AI API key not configured");
  });

  it("sends correct request and returns content", async () => {
    process.env.DATABASE_URL = "x";
    process.env.SESSION_SECRET = "s";
    process.env.GOOGLE_AI_KEY = "google-test-key";
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Hello from Gemini" } }],
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { callGoogleAiChat } = await import("./google-ai");
    const result = await callGoogleAiChat([{ role: "user", content: "hi" }]);

    expect(result).toBe("Hello from Gemini");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("generativelanguage.googleapis.com");
    expect(opts.headers.Authorization).toBe("Bearer google-test-key");
  });

  it("throws on non-ok response", async () => {
    process.env.DATABASE_URL = "x";
    process.env.SESSION_SECRET = "s";
    process.env.GOOGLE_AI_KEY = "google-test-key";
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => "Forbidden",
    }));

    const { callGoogleAiChat } = await import("./google-ai");
    await expect(
      callGoogleAiChat([{ role: "user", content: "hi" }])
    ).rejects.toThrow("Google AI chat failed (403)");
  });

  it("returns empty string when response has no content", async () => {
    process.env.DATABASE_URL = "x";
    process.env.SESSION_SECRET = "s";
    process.env.GOOGLE_AI_KEY = "google-test-key";
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    }));

    const { callGoogleAiChat } = await import("./google-ai");
    const result = await callGoogleAiChat([{ role: "user", content: "hi" }]);
    expect(result).toBe("");
  });
});
