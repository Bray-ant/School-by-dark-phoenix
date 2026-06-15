import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HttpClient } from "./http";

describe("HttpClient", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockFetch(body: unknown, opts?: { ok?: boolean; status?: number }) {
    const ok = opts?.ok ?? true;
    const status = opts?.status ?? 200;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(body),
    });
  }

  it("sends GET request with correct URL and default headers", async () => {
    mockFetch({ data: 1 });
    const client = new HttpClient("https://api.test");
    const result = await client.get<{ data: number }>("/items");

    expect(result).toEqual({ data: 1 });
    const [url, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://api.test/items");
    expect(init.method).toBe("GET");
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("sends POST request with JSON body", async () => {
    mockFetch({ ok: true });
    const client = new HttpClient("https://api.test");
    await client.post("/create", { name: "test" });

    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ name: "test" }));
  });

  it("appends query params", async () => {
    mockFetch({ items: [] });
    const client = new HttpClient("https://api.test");
    await client.get("/search", { q: "hello", page: 1 });

    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain("q=hello");
    expect(url).toContain("page=1");
  });

  it("merges custom headers with defaults", async () => {
    mockFetch({ ok: true });
    const client = new HttpClient("https://api.test", {
      headers: { Authorization: "Bearer tok" },
    });
    await client.get("/me");

    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.headers["Authorization"]).toBe("Bearer tok");
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("throws on non-ok response with server message", async () => {
    mockFetch({ message: "Not found" }, { ok: false, status: 404 });
    const client = new HttpClient("https://api.test");

    await expect(client.get("/missing")).rejects.toThrow("Not found");
  });

  it("throws generic error when response has no message", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("parse error")),
    });
    const client = new HttpClient("https://api.test");

    await expect(client.get("/fail")).rejects.toThrow("HTTP Error: 500");
  });

  it("throws timeout error when request is aborted", async () => {
    globalThis.fetch = vi.fn().mockImplementation(() => {
      const err = new Error("aborted");
      err.name = "AbortError";
      return Promise.reject(err);
    });
    const client = new HttpClient("https://api.test");

    await expect(client.get("/slow")).rejects.toThrow("Request timeout");
  });
});
