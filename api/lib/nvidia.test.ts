import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("callNvidiaChat", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("throws when NVIDIA API key is not configured", async () => {
    process.env.DATABASE_URL = "x";
    process.env.SESSION_SECRET = "s";
    delete process.env.NVIDIA_API_KEY;
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    const { callNvidiaChat } = await import("./nvidia");
    await expect(
      callNvidiaChat([{ role: "user", content: "hello" }])
    ).rejects.toThrow("NVIDIA API key not configured");
  });

  it("sends correct request format and returns content", async () => {
    process.env.DATABASE_URL = "x";
    process.env.SESSION_SECRET = "s";
    process.env.NVIDIA_API_KEY = "test-key";
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Hello from NVIDIA" } }],
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { callNvidiaChat } = await import("./nvidia");
    const result = await callNvidiaChat([{ role: "user", content: "hi" }]);

    expect(result).toBe("Hello from NVIDIA");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/chat/completions");
    expect(opts.method).toBe("POST");
    expect(opts.headers.Authorization).toBe("Bearer test-key");

    const body = JSON.parse(opts.body);
    expect(body.messages).toEqual([{ role: "user", content: "hi" }]);
  });

  it("throws on non-ok response", async () => {
    process.env.DATABASE_URL = "x";
    process.env.SESSION_SECRET = "s";
    process.env.NVIDIA_API_KEY = "test-key";
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    }));

    const { callNvidiaChat } = await import("./nvidia");
    await expect(
      callNvidiaChat([{ role: "user", content: "hi" }])
    ).rejects.toThrow("NVIDIA chat failed (401)");
  });
});
