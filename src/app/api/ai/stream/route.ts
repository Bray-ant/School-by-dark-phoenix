import { streamAiChat, hasAnyProvider } from "@api/lib/ai-stream";
import type { ChatMessage } from "@api/lib/ai-stream";
import { verifySessionToken } from "@api/auth/session";
import { Session } from "@contracts/constants";
import * as cookie from "cookie";
import { DC_TUTOR_SYSTEM_PROMPT, MATH_TUTOR_SYSTEM_PROMPT } from "@api/kimi/chat";
import { getDb } from "@api/queries/connection";
import { aiConversations, aiMessages } from "@db/schema";
import { eq, desc } from "drizzle-orm";

const SYSTEM_PROMPTS: Record<string, string> = {
  circuits: DC_TUTOR_SYSTEM_PROMPT,
  math: MATH_TUTOR_SYSTEM_PROMPT,
};

export async function POST(request: Request) {
  // Parse input
  let body: { message: string; subject?: string; conversationId?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.message || typeof body.message !== "string") {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  if (!hasAnyProvider()) {
    return Response.json({ error: "No AI provider configured" }, { status: 503 });
  }

  // Authenticate
  const cookies = cookie.parse(request.headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const claim = await verifySessionToken(token);
  if (!claim) {
    return Response.json({ error: "Invalid session" }, { status: 401 });
  }

  const userId = claim.userId;
  const db = getDb();

  // Resolve or create conversation
  let convId = body.conversationId;
  if (convId) {
    const [conv] = await db.select().from(aiConversations).where(eq(aiConversations.id, convId)).limit(1);
    if (!conv || conv.userId !== userId) {
      return Response.json({ error: "Not your conversation" }, { status: 403 });
    }
  } else {
    const title = body.message.slice(0, 40) + (body.message.length > 40 ? "..." : "");
    const [conv] = await db.insert(aiConversations).values({ userId, title }).$returningId();
    convId = conv.id;
  }

  // Save user message
  await db.insert(aiMessages).values({
    conversationId: convId,
    role: "user",
    content: body.message,
  });

  // Build message history
  const history = await db.select().from(aiMessages)
    .where(eq(aiMessages.conversationId, convId))
    .orderBy(desc(aiMessages.createdAt))
    .limit(20);

  const systemPrompt = SYSTEM_PROMPTS[body.subject ?? "circuits"] ?? DC_TUTOR_SYSTEM_PROMPT;
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.reverse().map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // Stream response via SSE
  const encoder = new TextEncoder();
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send conversation ID as first event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ conversationId: convId })}\n\n`));

        for await (const chunk of streamAiChat(messages, { temperature: 0.7, max_tokens: 2048 })) {
          fullResponse += chunk;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
        }

        // Save complete response to DB
        const [aiMsg] = await db.insert(aiMessages).values({
          conversationId: convId!,
          role: "assistant",
          content: fullResponse,
        }).$returningId();

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, messageId: aiMsg.id })}\n\n`));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Stream failed";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
      } finally {
        controller.close();
      }
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
