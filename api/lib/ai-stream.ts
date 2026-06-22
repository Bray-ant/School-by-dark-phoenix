import { env } from "./env";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

interface ProviderConfig {
  name: string;
  apiKey: string;
  apiUrl: string;
  model: string;
}

function getProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];
  if (env.nvidiaApiKey) {
    providers.push({
      name: "nvidia",
      apiKey: env.nvidiaApiKey,
      apiUrl: `${env.nvidiaApiUrl}/chat/completions`,
      model: env.nvidiaModel,
    });
  }
  if (env.googleAiKey) {
    providers.push({
      name: "google",
      apiKey: env.googleAiKey,
      apiUrl: `${env.googleAiUrl}/chat/completions`,
      model: env.googleAiModel,
    });
  }
  if (env.kimiApiKey) {
    providers.push({
      name: "kimi",
      apiKey: env.kimiApiKey,
      apiUrl: `${env.kimiOpenUrl || "https://open.kimi.com"}/v1/chat/completions`,
      model: "kimi-latest",
    });
  }
  return providers;
}

export function hasAnyProvider(): boolean {
  return !!(env.nvidiaApiKey || env.googleAiKey || env.kimiApiKey);
}

/**
 * Streams an AI chat completion via SSE. Yields content delta strings.
 * Tries providers in priority order (NVIDIA → Google → Kimi).
 */
export async function* streamAiChat(
  messages: ChatMessage[],
  options: StreamOptions = {},
): AsyncGenerator<string, void, undefined> {
  const providers = getProviders();
  if (providers.length === 0) {
    throw new Error("No AI provider configured");
  }

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const resp = await fetch(provider.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
          temperature: options.temperature ?? 0.7,
          top_p: options.top_p ?? 0.95,
          max_tokens: options.max_tokens ?? 4096,
          stream: true,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        lastError = new Error(`${provider.name} stream failed (${resp.status}): ${text}`);
        continue;
      }

      if (!resp.body) {
        lastError = new Error(`${provider.name} returned no body`);
        continue;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data) as {
              choices?: { delta?: { content?: string } }[];
            };
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // Skip malformed SSE chunks
          }
        }
      }

      // Successfully consumed stream from this provider
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[streamAiChat] ${provider.name} failed, trying next:`, err);
    }
  }

  throw lastError ?? new Error("All AI providers failed");
}
