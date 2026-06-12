import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { aiConversations, aiMessages } from "@db/schema";
import { eq, desc, asc } from "drizzle-orm";
import {
  getUserAccessToken,
  callKimiChat,
  DC_TUTOR_SYSTEM_PROMPT,
} from "./kimi/chat";
import { TRPCError } from "@trpc/server";

// Fallback knowledge base for unauthenticated users
function generateLocalResponse(question: string): string {
  const q = question.toLowerCase();
  
  if (q.includes('ohm') || q.includes("ohm's law")) {
    return "**Ohm's Law** is the cornerstone of circuit analysis: **V = I x R**. It states that voltage across a resistor is directly proportional to the current through it. Three equivalent forms: V = IR, I = V/R, R = V/I. Remember the VIR triangle -- cover the quantity you want to find. Power in resistors follows: P = I2R = V2/R = VI.";
  }
  if (q.includes('kvl') || q.includes('kirchhoff voltage') || q.includes('voltage law')) {
    return "**Kirchhoff's Voltage Law (KVL)** states that the sum of all voltages around any closed loop equals zero: E V = 0. For series circuits, the source voltage equals the sum of voltage drops across all resistors. Combined with Ohm's Law, KVL provides a complete framework for analyzing any series circuit.";
  }
  if (q.includes('kcl') || q.includes('kirchhoff current') || q.includes('current law')) {
    return "**Kirchhoff's Current Law (KCL)** states that the sum of all currents entering a node equals the sum of all currents leaving: E I_in = E I_out. This is the foundation for nodal analysis and for analyzing parallel circuits where current splits among branches.";
  }
  if (q.includes('thevenin')) {
    return "**Thevenin's Theorem** states that any linear DC network can be replaced by an equivalent circuit: a voltage source V_th in series with resistance R_th. To find V_th: calculate open-circuit voltage. To find R_th: deactivate all sources (short voltages, open currents) and find equivalent resistance. R_th = R_norton.";
  }
  if (q.includes('norton')) {
    return "**Norton's Theorem** is the current-source counterpart to Thevenin. Any linear network = current source I_n in parallel with R_n. I_n is the short-circuit current. R_n = R_th (same as Thevenin resistance). You can convert between Thevenin and Norton using: I_n = V_th / R_th.";
  }
  if (q.includes('capacitor') || q.includes('capacitance') || q.includes('rc ')) {
    return "**Capacitors** store energy in an electric field. Key equations: C = Q/V, I = C(dV/dt), W = (1/2)CV2. Current only flows when voltage CHANGES. At DC steady state, a capacitor acts as an **open circuit**. The **time constant** t = RC determines charging speed: after 1t = 63.2% charged, after 5t = 99.3% charged. Charging: V(t) = V_f(1 - e^(-t/t)).";
  }
  if (q.includes('inductor') || q.includes('inductance') || q.includes('rl ')) {
    return "**Inductors** store energy in a magnetic field. Key equations: V = L(dI/dt), W = (1/2)LI2. At DC steady state, an inductor acts as a **short circuit**. Current through an inductor **cannot change instantaneously** -- that would require infinite voltage. The time constant t = L/R governs the transient response.";
  }
  if (q.includes('transformer')) {
    return "**Transformers** transfer energy between coils via a shared magnetic field. Turns ratio a = N_p/N_s = V_p/V_s. Step-up: N_s > N_p. Step-down: N_s < N_p. Current transforms inversely: I_s = I_p x a. Reflected impedance: Z_p = a2 x Z_s. Transformers work **only with AC** -- they need a changing magnetic field.";
  }
  if (q.includes('resistor color') || q.includes('color code') || q.includes('color band')) {
    return "The **resistor color code** uses 4 bands: Band 1 = first digit, Band 2 = second digit, Band 3 = multiplier, Band 4 = tolerance. Colors: Black(0), Brown(1), Red(2), Orange(3), Yellow(4), Green(5), Blue(6), Violet(7), Gray(8), White(9). Gold = x0.1 (+/-5%), Silver = x0.01 (+/-10%). Example: Brown-Black-Red-Gold = 10 x 100 = 1kO +/-5%.";
  }
  if (q.includes('series') && !q.includes('parallel')) {
    return "In **series circuits**: same current flows through all components (I_total = I1 = I2 = ...). Total resistance: R_eq = R1 + R2 + R3 + ... . Voltages add: V_total = V1 + V2 + V3 + ... . **Voltage Divider**: V_x = V_total x (R_x / R_total). An open circuit stops ALL current; a short circuit bypasses a component.";
  }
  if (q.includes('parallel')) {
    return "In **parallel circuits**: same voltage across all branches. Total resistance: 1/R_eq = 1/R1 + 1/R2 + 1/R3 + ... . For TWO resistors: R_eq = (R1 x R2)/(R1 + R2). **Current Divider**: I_x = I_total x (R_eq / R_x). Current through a branch is INVERSELY proportional to its resistance. Fuses protect against short circuits.";
  }
  if (q.includes('superposition')) {
    return "**Superposition Theorem**: For linear circuits with multiple sources, analyze one source at a time. Replace other voltage sources with **short circuits** and current sources with **open circuits**. Then algebraically sum all individual contributions. Important: Superposition works for voltage and current, but NOT for power (since P = I2R is quadratic, not linear).";
  }
  if (q.includes('maximum power') || q.includes('max power')) {
    return "**Maximum Power Transfer Theorem**: Max power is delivered when R_load = R_th. P_max = V_th2 / (4 x R_th). Only 50% efficient at this point -- half the power is wasted in R_th. For power systems, max EFFICIENCY is desired, not max power transfer. This theorem is most relevant in signal/communication systems.";
  }
  if (q.includes('mars') || q.includes('climate orbiter')) {
    return "The **Mars Climate Orbiter** (1999) was a $330 million NASA mission destroyed due to a unit mismatch -- pound-force seconds vs newton-seconds. The error caused the spacecraft to enter Mars' atmosphere at the wrong altitude and disintegrate. **Always include units in every calculation and verify consistency across all interfaces.**";
  }
  if (q.includes('nodal') || q.includes('node')) {
    return "**Nodal Analysis**: Apply KCL at each node (except the reference/ground node). Express branch currents using Ohm's Law: I = (V_node - V_neighbor) / R. For N nodes, you get N-1 equations. Write in matrix form and solve. Choose the ground node wisely -- pick the node with the most connections.";
  }
  if (q.includes('mesh')) {
    return "**Mesh Analysis**: Apply KVL around each independent loop (mesh). Assign mesh currents (clockwise convention). For M meshes, you get M equations. Shared branches have current = sum/difference of adjacent mesh currents. Works only for planar circuits. The resulting matrix is symmetric for resistive networks.";
  }
  if (q.includes('delta') || q.includes('wye') || q.includes('y-') || q.includes('star')) {
    return "**Delta-Y (Pi-Tee) Transformations**: Use when circuits cannot be reduced by series/parallel alone. Delta to Y: R_y = (product of adjacent delta R's) / (sum of all delta R's). Y to Delta: R_delta = (sum of all Y pair products) / (opposite Y resistor). These preserve the external behavior of the network.";
  }
  
  return `I can help with that! As your DC Circuit tutor, I can explain Ohm's Law, KVL, KCL, Thevenin/Norton theorems, series/parallel circuits, capacitors, inductors, transformers, nodal/mesh analysis, and more. Try asking something specific like "Explain Ohm's Law" or "What is KVL?"`;
}

export const aiTutorRouter = createRouter({
  // Public: ask without auth (uses local knowledge base)
  ask: publicQuery
    .input(z.object({ question: z.string().min(1).max(2000) }))
    .mutation(async ({ input }) => {
      const response = generateLocalResponse(input.question);
      return { response, sources: ["DC Circuit Analysis - Fiore"] };
    }),

  // Public: get concept explanation at different levels
  explainConcept: publicQuery
    .input(z.object({
      concept: z.string().min(1),
      level: z.enum(['beginner', 'student', 'expert']).default('student'),
    }))
    .mutation(async ({ input }) => {
      const q = input.concept.toLowerCase();
      const explanations: Record<string, Record<string, string>> = {
        'ohm': {
          beginner: "Think of electricity like water in a pipe. Voltage is the water pressure pushing through. Current is how much water flows per second. Resistance is how narrow the pipe is -- a narrow pipe resists flow more. Ohm's Law says: Pressure = Flow x Narrowness. More pressure = more flow. Narrower pipe = less flow.",
          student: "Ohm's Law (V = IR) describes the linear relationship between voltage, current, and resistance in ohmic materials. It's an empirical law valid for conductors at constant temperature. The three forms are: V = IR, I = V/R, and R = V/I. Power follows: P = VI = I2R = V2/R. Temperature affects resistance: R(T) = R0[1 + a(T - T0)].",
          expert: "Ohm's Law is a constitutive relation, not a fundamental law. It holds for ohmic materials where the I-V characteristic is linear. At the quantum level, resistance arises from electron-phonon scattering. The Drude model gives: R = mL/(nAq2t) where m is electron mass, n is carrier density, q is charge, and t is mean free time. Non-ohmic behavior occurs when conductivity becomes field-dependent."
        },
        'kvl': {
          beginner: "Imagine walking around a circular track that goes up and down hills. No matter what path you take, when you get back to the start, your net height change is zero. KVL says the same about voltage: go around any loop in a circuit, add up all voltage changes, and you get zero.",
          student: "Kirchhoff's Voltage Law is energy conservation in electrical form. For any lumped-element circuit, the algebraic sum of voltages around any closed loop equals zero. This follows from Maxwell's equations under the quasi-static approximation where the electric field is conservative. KVL + Ohm's Law provides N independent equations for N mesh currents.",
          expert: "KVL derives from Faraday's law when magnetic flux change through the loop is negligible. In lumped-element circuits, KVL is exact. However, in high-frequency circuits where loop dimensions approach lambda/10, the distributed nature of fields violates KVL. The generalized form: oint E.dl = -dPhi_B/dt."
        },
        'capacitor': {
          beginner: "A capacitor is like a tiny rechargeable battery that charges and discharges very quickly. It has two plates with a gap between them. When you apply voltage, electrons pile up on one plate and leave the other. It 'blocks' DC but 'passes' AC because it keeps charging and discharging.",
          student: "A capacitor stores energy in an electric field: Q = CV leads to I = C(dV/dt). Current is proportional to the rate of voltage change. In the frequency domain, Z_C = 1/(jomegaC), explaining why capacitors block DC and pass high frequencies. The RC time constant t = RC characterizes transient response: V(t) = V_f(1 - e^(-t/t)) for charging.",
          expert: "Capacitance is defined through energy in the electric field: W = (1/2) integral epsilon|E|2 dV = (1/2)CV2. For parallel plates: C = epsilon0*epsilon_r*A/d. At high frequencies, dielectric losses (tan delta), ESL, and ESR create non-ideal behavior. The displacement current I_D = epsilon0*dE/dt completes the circuit through the dielectric."
        },
      };
      const conceptKey = Object.keys(explanations).find(k => q.includes(k)) || 'ohm';
      const response = explanations[conceptKey]?.[input.level] || explanations['ohm']['student'];
      return { response, concept: input.concept, level: input.level };
    }),

  // Public: generate flashcards
  generateFlashcards: publicQuery
    .input(z.object({ topic: z.string().min(1), count: z.number().min(1).max(10).default(5) }))
    .mutation(async ({ input }) => {
      const allCards: Record<string, { front: string; back: string }[]> = {
        'ohm': [
          { front: "State Ohm's Law", back: "V = I x R. Also: I = V/R and R = V/I" },
          { front: "Power formulas for resistors", back: "P = VI = I2R = V2/R" },
          { front: "Unit of resistance", back: "Ohm (Omega)" },
          { front: "What does the VIR triangle help with?", back: "Remembering the three forms of Ohm's Law -- cover the quantity you want to find" },
        ],
        'kvl': [
          { front: "State Kirchhoff's Voltage Law", back: "Sum of all voltages around any closed loop = 0" },
          { front: "Voltage divider formula", back: "V_x = V_total x (R_x / R_total)" },
          { front: "How do series resistors combine?", back: "R_eq = R1 + R2 + R3 + ..." },
        ],
        'kcl': [
          { front: "State Kirchhoff's Current Law", back: "Sum of currents entering a node = sum leaving" },
          { front: "How do parallel resistors combine?", back: "1/R_eq = 1/R1 + 1/R2 + 1/R3 + ..." },
          { front: "Current divider for two resistors", back: "I1 = I_total x (R2 / (R1 + R2))" },
        ],
        'capacitor': [
          { front: "Capacitor I-V relationship", back: "I = C x dV/dt" },
          { front: "Energy stored in a capacitor", back: "W = (1/2)CV2" },
          { front: "RC time constant", back: "t = RC. After 5t, 99.3% charged" },
          { front: "Capacitor at DC steady state", back: "Acts as an OPEN circuit" },
        ],
        'inductor': [
          { front: "Inductor V-I relationship", back: "V = L x dI/dt" },
          { front: "Energy stored in an inductor", back: "W = (1/2)LI2" },
          { front: "RL time constant", back: "t = L/R" },
          { front: "Inductor at DC steady state", back: "Acts as a SHORT circuit" },
        ],
        'thevenin': [
          { front: "Thevenin's theorem in words", back: "Any linear network = V_th in series with R_th" },
          { front: "How to find R_th?", back: "Deactivate all sources, find equivalent resistance" },
          { front: "Maximum power transfer condition", back: "R_load = R_th. P_max = V_th2/(4R_th)" },
        ],
      };
      const topicCards = Object.entries(allCards).find(([k]) => input.topic.toLowerCase().includes(k))?.[1] || allCards['ohm'];
      return { flashcards: topicCards.slice(0, input.count), topic: input.topic };
    }),

  // Public: solve problems
  solveProblem: publicQuery
    .input(z.object({ problem: z.string().min(1).max(2000) }))
    .mutation(async ({ input }) => {
      const p = input.problem.toLowerCase();
      let solution = "";
      if ((p.includes('12v') || p.includes('12 v')) && p.includes('4ohm') && (p.includes('current') || p.includes('find i'))) {
        solution = "**Step 1:** Knowns: V = 12V, R = 4O\n**Step 2:** Apply Ohm's Law: I = V/R\n**Step 3:** I = 12V / 4O = **3A**\n\n**Verification:** V = I x R = 3A x 4O = 12V checkmark";
      } else if (p.includes('resistor') && (p.includes('brown') || p.includes('black') || p.includes('red'))) {
        solution = "**Brown-Black-Red-Gold resistor:**\n- Band 1 (Brown) = 1\n- Band 2 (Black) = 0\n- Band 3 (Red) = x100\n- Band 4 (Gold) = +/-5%\n\n**Value:** 10 x 100 = **1kO +/-5%**";
      } else if (p.includes('thevenin') || p.includes('v_th') || p.includes('r_th')) {
        solution = "**To find Thevenin equivalent:**\n1. **V_th:** Remove the load, calculate open-circuit voltage across the terminals\n2. **R_th:** Deactivate all independent sources (short voltage sources, open current sources), then find equivalent resistance\n3. Replace the original network with V_th in series with R_th\n4. For Norton: I_n = V_th / R_th in parallel with R_n = R_th";
      } else {
        solution = "I can help solve this step by step! To provide the best solution, please clearly state:\n\n1. What values are given (voltages, resistances, currents)?\n2. What quantity are you solving for?\n3. What circuit configuration is involved (series, parallel, combination)?\n\nFor example: 'A 12V battery connects to a 4O resistor. Find the current.'";
      }
      return { solution, problem: input.problem };
    }),

  // Authenticated: list conversations
  listConversations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(aiConversations).where(eq(aiConversations.userId, ctx.user.id)).orderBy(desc(aiConversations.updatedAt));
  }),

  // Authenticated: create conversation
  createConversation: authedQuery
    .input(z.object({ title: z.string().min(1).max(200) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [conv] = await db.insert(aiConversations).values({ userId: ctx.user.id, title: input.title }).$returningId();
      const [inserted] = await db.select().from(aiConversations).where(eq(aiConversations.id, conv.id)).limit(1);
      return inserted;
    }),

  // Authenticated: get messages for a conversation
  getMessages: authedQuery
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [conv] = await db.select().from(aiConversations).where(eq(aiConversations.id, input.conversationId)).limit(1);
      if (!conv || conv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Not your conversation" });
      return db.select().from(aiMessages).where(eq(aiMessages.conversationId, input.conversationId)).orderBy(asc(aiMessages.createdAt));
    }),

  // Authenticated: quick chat with Kimi API (enhanced for logged-in users)
  quickChat: authedQuery
    .input(z.object({ message: z.string().min(1).max(4000), conversationId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      let convId = input.conversationId;
      if (!convId) {
        const [conv] = await db.insert(aiConversations).values({
          userId: ctx.user.id,
          title: input.message.slice(0, 60) + (input.message.length > 60 ? "..." : ""),
        }).$returningId();
        convId = conv.id;
      }
      // Verify ownership
      const [conv] = await db.select().from(aiConversations).where(eq(aiConversations.id, convId)).limit(1);
      if (!conv || conv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Not your conversation" });

      // Save user message
      await db.insert(aiMessages).values({ conversationId: convId, role: "user", content: input.message });

      // Get access token
      const accessToken = await getUserAccessToken(ctx.user.id);

      let response: string;

      if (accessToken) {
        // Use real Kimi API
        const history = await db.select().from(aiMessages).where(eq(aiMessages.conversationId, convId)).orderBy(desc(aiMessages.createdAt)).limit(20);
        const messages = [
          { role: "system" as const, content: DC_TUTOR_SYSTEM_PROMPT },
          ...history.reverse().map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        ];
        try {
          response = await callKimiChat(accessToken, messages, { temperature: 0.7, max_tokens: 2048 });
        } catch {
          response = generateLocalResponse(input.message) + "\n\n*(Kimi API unavailable -- using local knowledge base)*";
        }
      } else {
        // Fallback to local knowledge base
        response = generateLocalResponse(input.message) + "\n\n*(Sign out and sign back in to enable enhanced Kimi AI responses)*";
      }

      // Save AI response
      const [aiMsg] = await db.insert(aiMessages).values({
        conversationId: convId, role: "assistant", content: response,
      }).$returningId();
      const [inserted] = await db.select().from(aiMessages).where(eq(aiMessages.id, aiMsg.id)).limit(1);

      return { conversationId: convId, response: inserted };
    }),
});
