import { env } from "./env";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface NvidiaOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

/**
 * Calls the NVIDIA NIM API (OpenAI-compatible) for chat completions.
 * Returns the assistant's response text.
 */
export async function callNvidiaChat(
  messages: ChatMessage[],
  options: NvidiaOptions = {},
): Promise<string> {
  const apiKey = env.nvidiaApiKey;
  if (!apiKey) {
    throw new Error("NVIDIA API key not configured");
  }

  const resp = await fetch(`${env.nvidiaApiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: env.nvidiaModel,
      messages,
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 0.95,
      max_tokens: options.max_tokens ?? 4096,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`NVIDIA chat failed (${resp.status}): ${text}`);
  }

  const data = (await resp.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}
