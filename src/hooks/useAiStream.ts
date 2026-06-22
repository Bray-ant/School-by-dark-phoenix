import { useState, useCallback, useRef } from "react";

interface StreamState {
  isStreaming: boolean;
  content: string;
  error: string | null;
  conversationId: number | null;
}

interface StreamOptions {
  subject?: string;
  conversationId?: number;
  onChunk?: (chunk: string) => void;
  onDone?: (fullContent: string, conversationId: number) => void;
  onError?: (error: string) => void;
}

export function useAiStream() {
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    content: "",
    error: null,
    conversationId: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (message: string, options: StreamOptions = {}) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ isStreaming: true, content: "", error: null, conversationId: options.conversationId ?? null });

    try {
      const resp = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          subject: options.subject,
          conversationId: options.conversationId,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Stream request failed" }));
        const errorMsg = err.error || "Stream request failed";
        setState(prev => ({ ...prev, isStreaming: false, error: errorMsg }));
        options.onError?.(errorMsg);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) {
        setState(prev => ({ ...prev, isStreaming: false, error: "No stream body" }));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";
      let convId = options.conversationId ?? null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(trimmed.slice(6)) as {
              content?: string;
              conversationId?: number;
              done?: boolean;
              messageId?: number;
              error?: string;
            };

            if (data.conversationId && !convId) {
              convId = data.conversationId;
              setState(prev => ({ ...prev, conversationId: convId }));
            }

            if (data.content) {
              accumulated += data.content;
              setState(prev => ({ ...prev, content: accumulated }));
              options.onChunk?.(data.content);
            }

            if (data.done && convId) {
              options.onDone?.(accumulated, convId);
            }

            if (data.error) {
              setState(prev => ({ ...prev, error: data.error ?? null }));
              options.onError?.(data.error);
            }
          } catch {
            // Skip malformed data
          }
        }
      }

      setState(prev => ({ ...prev, isStreaming: false }));
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Stream failed";
      setState(prev => ({ ...prev, isStreaming: false, error: msg }));
      options.onError?.(msg);
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setState(prev => ({ ...prev, isStreaming: false }));
  }, []);

  return { ...state, send, abort };
}
