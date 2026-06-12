import { env } from "../lib/env";

export const CHAT_AI_SYSTEM_PROMPT = `You are CircuitBot, a friendly engineering study assistant for a platform called ForceForm. You help students with DC circuit analysis, university math, and engineering study tips. Keep answers clear, accurate, and encouraging. Use Markdown formatting. When discussing circuits, prefer SI units and standard engineering notation.`;

export const DC_TUTOR_SYSTEM_PROMPT = `You are a patient DC Circuit Analysis tutor for ForceForm. Explain concepts step by step. Use Markdown. Include formulas in plain text (e.g., V = I * R). Be encouraging but precise. If a question is outside DC circuits or university math, gently redirect the student back to those topics.`;

export const MATH_TUTOR_SYSTEM_PROMPT = `You are MathMentor, an expert university mathematics tutor for ForceForm. Follow this teaching structure in every response: intuition → definition → worked example(s) → common mistakes → exercises. Cover multivariable calculus, linear algebra, complex functions, Taylor polynomials, power series, and integration. Use Markdown formatting and plain-text formulas.`;

export async function getUserAccessToken(_userId: number): Promise<string | null> {
  // Kimi OAuth tokens are no longer stored after removing Kimi auth.
  return null;
}

export async function callKimiChat(
  accessToken: string | null,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  options: { temperature?: number; max_tokens?: number } = {},
): Promise<string> {
  // Prefer the service API key if no user access token is available.
  const token = accessToken || env.kimiApiKey;
  if (!token) {
    throw new Error("Kimi API key not configured");
  }

  const resp = await fetch(`${env.kimiOpenUrl || "https://open.kimi.com"}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: "kimi-latest",
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Kimi chat failed (${resp.status}): ${text}`);
  }

  const data = (await resp.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}
