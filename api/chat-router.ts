import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chatRooms, chatMessages } from "@db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { callKimiChat, CHAT_AI_SYSTEM_PROMPT } from "./kimi/chat";
import { env } from "./lib/env";
// import { TRPCError } from "@trpc/server";

// Local AI response for chat room (no auth needed)
function generateChatAiResponse(content: string): string {
  const c = content.toLowerCase();
  if (c.includes('ohm')) return "Ohm's Law (V = IR) is the fundamental relationship in circuit analysis. Voltage = Current x Resistance. It applies to all ohmic materials at constant temperature. You can use it to find any one quantity if you know the other two!";
  if (c.includes('kvl')) return "Kirchhoff's Voltage Law says the sum of all voltages around any closed loop equals zero. In other words: sum of voltage rises = sum of voltage drops. It's basically conservation of energy applied to circuits!";
  if (c.includes('kcl')) return "Kirchhoff's Current Law states that the sum of currents entering a node equals the sum leaving it. Think of it like water pipes splitting -- what flows in must flow out. It's the basis for nodal analysis.";
  if (c.includes('thevenin')) return "Thevenin's Theorem lets you replace ANY linear network with just a voltage source (V_th) in series with a resistor (R_th). Find V_th by calculating open-circuit voltage. Find R_th by turning off all sources and finding equivalent resistance. Super useful for simplifying complex circuits!";
  if (c.includes('capacitor') || c.includes('capacitance')) return "Capacitors store energy in an electric field. Key points: C = Q/V, I = C(dV/dt), and energy W = 1/2 CV2. At DC steady state, a capacitor acts as an open circuit. The time constant t = RC tells you how fast it charges/discharges.";
  if (c.includes('inductor') || c.includes('inductance')) return "Inductors store energy in a magnetic field. V = L(dI/dt), energy W = 1/2 LI2. At DC steady state, an inductor acts as a short circuit. Current through an inductor CANNOT change instantaneously -- doing so would require infinite voltage!";
  if (c.includes('transformer')) return "Transformers transfer energy between coils through a magnetic field. Turns ratio a = N_p/N_s = V_p/V_s. They only work with AC! Step-up transformers increase voltage (N_s > N_p), step-down decrease it. Current transforms inversely: I_s = I_p x a.";
  if (c.includes('hello') || c.includes('hi ') || c.includes('hey')) return "Hey there! I'm CircuitBot, your engineering study assistant. Ask me anything about DC circuits, math, physics, or study tips. I can explain concepts, walk through problems, or just chat about engineering!";
  if (c.includes('study') || c.includes('exam') || c.includes('test')) return "For studying circuits: 1) Master Ohm's Law and Kirchhoff's Laws first -- everything builds on them. 2) Practice drawing circuit diagrams. 3) Do lots of problems -- start simple, build up. 4) Understand the 'why' behind each formula. 5) Use the simulators in the DC Lab to visualize concepts!";
  return `Great question about "${content.slice(0, 40)}..." I'd recommend checking out the DC Circuit lessons or the AI Tutor for a detailed explanation. You can also try the circuit simulators in the DC Lab to experiment hands-on!`;
}

export const chatRouter = createRouter({
  // List all rooms (public)
  listRooms: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(chatRooms).orderBy(desc(chatRooms.updatedAt));
  }),

  // Get messages for a room (public, no auth needed)
  getMessages: publicQuery
    .input(z.object({ roomId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(chatMessages).where(eq(chatMessages.roomId, input.roomId)).orderBy(asc(chatMessages.createdAt)).limit(200);
    }),

  // Send a message (public -- uses IP-based anon identifier)
  sendMessage: publicQuery
    .input(z.object({ roomId: z.number(), content: z.string().min(1).max(2000), userName: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user?.id ?? 0;
      const name = input.userName || ctx.user?.name || "Guest";
      const [msg] = await db.insert(chatMessages).values({
        roomId: input.roomId, userId, userName: name,
        userAvatar: ctx.user?.avatar, content: input.content, isAi: 0,
      }).$returningId();
      const [inserted] = await db.select().from(chatMessages).where(eq(chatMessages.id, msg.id)).limit(1);
      return inserted;
    }),

  // Ask AI in chat room (public -- no auth needed!)
  askAi: publicQuery
    .input(z.object({ roomId: z.number(), content: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // 1. Save user message
      await db.insert(chatMessages).values({
        roomId: input.roomId, userId: ctx.user?.id ?? 0,
        userName: ctx.user?.name || "Guest", userAvatar: ctx.user?.avatar,
        content: input.content, isAi: 0,
      });

      // 2. Try AI API (NVIDIA, Google AI, or Kimi) if configured
      let response = "";
      let usedAi = false;
      const hasAiProvider = env.nvidiaApiKey || env.googleAiKey || env.kimiApiKey;

      if (hasAiProvider) {
        try {
          const recentMessages = await db.select().from(chatMessages)
            .where(eq(chatMessages.roomId, input.roomId))
            .orderBy(desc(chatMessages.createdAt)).limit(10);
          const chatHistory = recentMessages.reverse().map(m => ({
            role: m.isAi ? ("assistant" as const) : ("user" as const),
            content: `${m.userName ?? "User"}: ${m.content}`,
          }));
          response = await callKimiChat(null, [
            { role: "system", content: CHAT_AI_SYSTEM_PROMPT },
            ...chatHistory,
            { role: "user", content: input.content },
          ], { temperature: 0.8, max_tokens: 1024 });
          usedAi = true;
        } catch (err) {
          console.error("[askAi] AI chat API failed, falling back to local response:", err);
        }
      }

      // 3. Use local response if AI failed or not configured
      if (!response) {
        response = generateChatAiResponse(input.content);
      }

      // 4. Save AI response
      const [aiMsg] = await db.insert(chatMessages).values({
        roomId: input.roomId, userId: 0, userName: "CircuitBot",
        content: response, isAi: 1,
      }).$returningId();
      const [inserted] = await db.select().from(chatMessages).where(eq(chatMessages.id, aiMsg.id)).limit(1);

      return { userMessage: true, aiResponse: inserted, usedAi };
    }),
});
