import { getDb } from "../queries/connection";
import { aiConversations, aiMessages } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { callKimiChat } from "../kimi/chat";
import { env } from "../lib/env";
import { TRPCError } from "@trpc/server";

/**
 * Calls the AI API (NVIDIA, Google AI, or Kimi), falling back to a local
 * generator if no provider is configured or the call fails.
 */
export async function callKimiWithFallback(
  userId: number | undefined,
  systemPrompt: string,
  userMessage: string,
  fallback: () => string,
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  if (!userId) return fallback();

  const hasAiProvider = env.nvidiaApiKey || env.googleAiKey || env.kimiApiKey;
  if (!hasAiProvider) return fallback();

  try {
    return await callKimiChat(
      null,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      { temperature: options?.temperature ?? 0.7, max_tokens: options?.max_tokens ?? 2048 }
    );
  } catch (err) {
    console.error("[callKimiWithFallback] AI API call failed, using fallback:", err);
    return fallback();
  }
}

/**
 * Shared logic for creating or verifying ownership of an AI conversation,
 * saving the user message, calling Kimi with history, and saving the response.
 */
export async function handleTutorMessage(opts: {
  userId: number;
  message: string;
  conversationId?: number;
  titlePrefix: string;
  systemPrompt: string;
  localFallback: (message: string) => string;
  fallbackSuffix?: string;
  maxHistoryMessages?: number;
}) {
  const db = getDb();
  let convId = opts.conversationId;

  if (!convId) {
    const [conv] = await db.insert(aiConversations).values({
      userId: opts.userId,
      title: `${opts.titlePrefix}${opts.message.slice(0, 40)}${opts.message.length > 40 ? "..." : ""}`,
    }).$returningId();
    convId = conv.id;
  }

  const [conv] = await db.select().from(aiConversations).where(eq(aiConversations.id, convId)).limit(1);
  if (!conv || conv.userId !== opts.userId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not your conversation" });
  }

  await db.insert(aiMessages).values({
    conversationId: convId,
    role: "user",
    content: opts.message,
  });

  const hasAiProvider = env.nvidiaApiKey || env.googleAiKey || env.kimiApiKey;
  let response: string;

  if (hasAiProvider) {
    const history = await db.select().from(aiMessages)
      .where(eq(aiMessages.conversationId, convId))
      .orderBy(desc(aiMessages.createdAt))
      .limit(opts.maxHistoryMessages ?? 20);

    const messages = [
      { role: "system" as const, content: opts.systemPrompt },
      ...history.reverse().map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    try {
      response = await callKimiChat(null, messages, {
        temperature: 0.7,
        max_tokens: 2048,
      });
    } catch (err) {
      console.error("[handleTutorMessage] AI API call failed, using local fallback:", err);
      response = opts.localFallback(opts.message)
        + (opts.fallbackSuffix ?? "\n\n*(AI API temporarily unavailable — using built-in knowledge base)*");
    }
  } else {
    response = opts.localFallback(opts.message)
      + "\n\n*(Configure NVIDIA_API_KEY, GOOGLE_AI_KEY, or KIMI_API_KEY to enable enhanced AI responses)*";
  }

  const [aiMsg] = await db.insert(aiMessages).values({
    conversationId: convId,
    role: "assistant",
    content: response,
  }).$returningId();
  const [inserted] = await db.select().from(aiMessages).where(eq(aiMessages.id, aiMsg.id)).limit(1);

  return { conversationId: convId, response: inserted };
}
