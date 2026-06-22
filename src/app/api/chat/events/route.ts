import { chatEventBus } from "@api/lib/chat-events";
import type { ChatEvent } from "@api/lib/chat-events";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roomId = parseInt(url.searchParams.get("roomId") ?? "", 10);

  if (!roomId || isNaN(roomId)) {
    return Response.json({ error: "roomId is required" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial keepalive
      controller.enqueue(encoder.encode(": connected\n\n"));

      const listener = (event: ChatEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Controller closed
        }
      };

      unsubscribe = chatEventBus.subscribe(roomId, listener);

      // Keepalive every 30s to prevent proxy timeouts
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(keepalive);
        }
      }, 30_000);

      // Clean up when client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(keepalive);
        unsubscribe?.();
        try { controller.close(); } catch { /* already closed */ }
      });
    },
    cancel() {
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
