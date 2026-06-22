import { env } from "./env";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GoogleAiOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

/**
 * Calls the Google AI Studio (Gemini) API via its OpenAI-compatible endpoint.
 * Returns the assistant's response text.
 */
export async function callGoogleAiChat(
  messages: ChatMessage[],
  options: GoogleAiOptions = {},
): Promise<string> {
  const apiKey = env.googleAiKey;
  if (!apiKey) {
    throw new Error("Google AI API key not configured");
  }

  const resp = await fetch(`${env.googleAiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: env.googleAiModel,
      messages,
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 0.95,
      max_tokens: options.max_tokens ?? 4096,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Google AI chat failed (${resp.status}): ${text}`);
  }

  const data = (await resp.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}
