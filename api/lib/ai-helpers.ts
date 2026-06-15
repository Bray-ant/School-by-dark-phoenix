import { getDb } from "../queries/connection";
import { aiConversations, aiMessages } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserAccessToken, callKimiChat } from "../kimi/chat";
import { TRPCError } from "@trpc/server";

/**
 * Calls the Kimi AI API with authentication, falling back to a local generator
 * if the user is not authenticated or the API fails.
 */
export async function callKimiWithFallback(
  userId: number | undefined,
  systemPrompt: string,
  userMessage: string,
  fallback: () => string,
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  if (!userId) return fallback();

  const accessToken = await getUserAccessToken(userId);
  if (!accessToken) return fallback();

  try {
    return await callKimiChat(
      accessToken,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      { temperature: options?.temperature ?? 0.7, max_tokens: options?.max_tokens ?? 2048 }
    );
  } catch {
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

  const accessToken = await getUserAccessToken(opts.userId);
  let response: string;

  if (accessToken) {
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
      response = await callKimiChat(accessToken, messages, {
        temperature: 0.7,
        max_tokens: 2048,
      });
    } catch {
      response = opts.localFallback(opts.message)
        + (opts.fallbackSuffix ?? "\n\n*(Kimi API temporarily unavailable — using built-in knowledge base)*");
    }
  } else {
    response = opts.localFallback(opts.message)
      + "\n\n*(Sign out and sign back in to enable enhanced AI responses)*";
  }

  const [aiMsg] = await db.insert(aiMessages).values({
    conversationId: convId,
    role: "assistant",
    content: response,
  }).$returningId();
  const [inserted] = await db.select().from(aiMessages).where(eq(aiMessages.id, aiMsg.id)).limit(1);

  return { conversationId: convId, response: inserted };
}
