import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import {
  getUserAccessToken,
  callKimiChat,
} from "./kimi/chat";

// ─── Problem Generation ───────────────────────────────────

const PROBLEM_GEN_PROMPT = `You are an expert DC Circuit Analysis problem generator. Generate a unique, solvable circuit problem.

Respond in this EXACT format:
TITLE: [short title]
DIFFICULTY: [Easy/Medium/Hard]
TIME: [estimated minutes]
PROBLEM: [detailed problem statement with specific values]
GIVEN: [list all known quantities with units]
FIND: [what the student must calculate]
HINT: [a subtle hint without giving away the answer]
SOLUTION: [full step-by-step solution]
ANSWER: [final numerical answer with units]

Rules:
- Use realistic component values (resistors 100Ω to 100kΩ, voltages 1V to 100V)
- Problems must be solvable using standard circuit analysis techniques
- Include a complete circuit description the student can visualize
- Vary problem types: Ohm's Law, KVL, KCL, series/parallel, Thevenin, nodal, mesh, transient`;

// ─── Quiz Generation ──────────────────────────────────────

const QUIZ_GEN_PROMPT = `You are a DC Circuit Analysis quiz generator. Create a multiple-choice quiz.

Respond in this EXACT JSON format:
{
  "title": "Quiz Title",
  "questions": [
    {
      "question": "Question text?",
      "options": ["A) option", "B) option", "C) option", "D) option"],
      "correctIndex": 0,
      "explanation": "Why this is correct"
    }
  ]
}

Rules:
- Generate exactly the requested number of questions
- Each question has 4 options (A, B, C, D)
- Vary difficulty based on the requested level
- Cover the requested topics
- Explanations should teach, not just state the answer`;

// ─── Circuit Analysis ─────────────────────────────────────

const CIRCUIT_ANALYSIS_PROMPT = `You are an expert circuit analyzer. Given a circuit description, provide a thorough analysis.

Respond with:
1. **Circuit Summary** - Brief restatement of the circuit
2. **Key Observations** - Important features and simplifications
3. **Analysis Method** - Recommended technique (nodal, mesh, KVL, KCL, etc.)
4. **Step-by-Step Solution** - Detailed working
5. **Final Results** - All voltages, currents, and powers
6. **Verification** - Check using alternative method
7. **What-If Analysis** - How changes would affect the circuit`;

// ─── Hint Generation ──────────────────────────────────────

const HINT_PROMPT = `You are a patient circuit tutor. Give a helpful hint for a student's problem.

Rules:
- NEVER give the full answer
- Guide the student toward discovering the solution
- Reference relevant concepts or formulas
- Break the problem into smaller steps
- Ask a guiding question when appropriate
- Keep hints concise (2-4 sentences)`;

// ─── Study Plan Generation ────────────────────────────────

const STUDY_PLAN_PROMPT = `You are an expert learning coach. Create a personalized study plan for DC Circuit Analysis.

Respond in this format:
{
  "title": "Study Plan Title",
  "overview": "Brief overview of the plan",
  "sessions": [
    {
      "day": 1,
      "topic": "Topic name",
      "duration": "30 min",
      "activities": ["activity 1", "activity 2"],
      "resources": ["resource 1", "resource 2"],
      "goal": "What to achieve"
    }
  ],
  "tips": ["study tip 1", "study tip 2"]
}`;

// ─── Helper: call Kimi with fallback ──────────────────────

async function callKimiWithFallback(
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
  } catch (err) {
    console.error("[callKimiWithFallback] Kimi API call failed, using fallback:", err);
    return fallback();
  }
}

// ─── Fallback generators ──────────────────────────────────

function generateProblemFallback(topic: string, difficulty: string): string {
  const problems: Record<string, Record<string, string>> = {
    "ohm's law": {
      Easy: `TITLE: Basic Ohm's Law Application
DIFFICULTY: Easy
TIME: 5 min
PROBLEM: A 12V battery is connected across a 4kΩ resistor. Determine the current flowing through the resistor and the power dissipated.
GIVEN: V = 12V, R = 4kΩ = 4000Ω
FIND: Current I and Power P
HINT: Use Ohm's Law: I = V/R. Remember to convert kΩ to Ω.
SOLUTION: Step 1: I = V/R = 12/4000 = 3mA. Step 2: P = V*I = 12 * 0.003 = 36mW. Or P = V²/R = 144/4000 = 36mW.
ANSWER: I = 3mA, P = 36mW`,
      Medium: `TITLE: Ohm's Law with Temperature
DIFFICULTY: Medium
TIME: 10 min
PROBLEM: A copper wire has resistance 10Ω at 20°C. Its temperature coefficient is 0.0039/°C. Find its resistance at 80°C and the current at 50V.
GIVEN: R₀ = 10Ω, T₀ = 20°C, α = 0.0039/°C, T = 80°C, V = 50V
FIND: R at 80°C and I at 50V
HINT: Use R(T) = R₀[1 + α(T - T₀)]
SOLUTION: R = 10[1 + 0.0039(60)] = 10[1.234] = 12.34Ω. Then I = 50/12.34 = 4.05A.
ANSWER: R = 12.34Ω, I = 4.05A`,
      Hard: `TITLE: Nonlinear Device Analysis
DIFFICULTY: Hard
TIME: 20 min
PROBLEM: A tungsten filament lamp has R = 100Ω at 20°C (α = 0.0045/°C). At operating temperature with 120V, it draws 0.5A. Find its operating temperature and power.
GIVEN: R_cold = 100Ω, T₀ = 20°C, α = 0.0045/°C, V = 120V, I = 0.5A
FIND: Operating temperature T and power P
HINT: First find R_hot from V and I, then solve for T.
SOLUTION: R_hot = 120/0.5 = 240Ω. 240 = 100[1 + 0.0045(T - 20)]. 2.4 = 1 + 0.0045(T-20). T = 20 + 311 = 331°C. P = 120 * 0.5 = 60W.
ANSWER: T = 331°C, P = 60W`,
    },
    "kvl": {
      Easy: `TITLE: Series Circuit KVL
DIFFICULTY: Easy
TIME: 5 min
PROBLEM: Three resistors (1kΩ, 2kΩ, 3kΩ) are in series with a 12V source. Find the current and voltage across each resistor.
GIVEN: R1=1kΩ, R2=2kΩ, R3=3kΩ, V=12V
FIND: I, V1, V2, V3
HINT: First find total resistance, then use Ohm's Law for current, then voltage divider.
SOLUTION: R_total = 6kΩ. I = 12/6000 = 2mA. V1 = 2mA * 1kΩ = 2V. V2 = 4V. V3 = 6V. Check: 2+4+6=12V ✓
ANSWER: I = 2mA, V1=2V, V2=4V, V3=6V`,
      Medium: `TITLE: Multi-Loop KVL
DIFFICULTY: Medium
TIME: 15 min
PROBLEM: A circuit has two loops. Loop 1: 10V source, 2kΩ and 3kΩ resistors. Loop 2: 5V source, 3kΩ shared and 4kΩ. Find all mesh currents.
GIVEN: V1=10V, V2=5V, R1=2kΩ, R2=3kΩ, R3=4kΩ
FIND: Mesh currents I_a and I_b
HINT: Write KVL for each mesh. The 3kΩ resistor is shared.
SOLUTION: Mesh A: 10 = 2000I_a + 3000(I_a - I_b). Mesh B: -5 = 3000(I_b - I_a) + 4000I_b. Simplify: 5000I_a - 3000I_b = 10, -3000I_a + 7000I_b = -5. Solve: I_a = 2.27mA, I_b = 0.455mA.
ANSWER: I_a = 2.27mA, I_b = 0.455mA`,
      Hard: `TITLE: KVL with Dependent Source
DIFFICULTY: Hard
TIME: 25 min
PROBLEM: A circuit has a 20V source, 1kΩ resistor, and a voltage-dependent voltage source (2Vx) in series, where Vx is the voltage across the 1kΩ resistor. Find the current.
GIVEN: V_s = 20V, R = 1kΩ, dependent source = 2Vx where Vx = I*R
FIND: Current I
HINT: Write KVL around the loop. The dependent source polarity matters.
SOLUTION: KVL: 20 - I(1000) - 2Vx = 0. But Vx = 1000I. So: 20 - 1000I - 2000I = 0. 20 = 3000I. I = 6.67mA.
ANSWER: I = 6.67mA`,
    },
    "thevenin": {
      Easy: `TITLE: Basic Thevenin Equivalent
DIFFICULTY: Easy
TIME: 10 min
PROBLEM: A circuit has a 12V source in series with 3kΩ and 6kΩ resistors. Find the Thevenin equivalent seen across the 6kΩ resistor.
GIVEN: V = 12V, R1 = 3kΩ, R2 = 6kΩ
FIND: V_th and R_th
HINT: V_th is the open-circuit voltage (voltage divider). R_th is the resistance with source deactivated.
SOLUTION: V_th = 12 * 6/(3+6) = 8V. R_th = 3kΩ || 6kΩ... actually with source shorted, R_th = 3kΩ (looking back).
ANSWER: V_th = 8V, R_th = 3kΩ`,
      Medium: `TITLE: Thevenin with Multiple Sources
DIFFICULTY: Medium
TIME: 20 min
PROBLEM: Find the Thevenin equivalent at terminals A-B for: 10V source with 2kΩ series, parallel branch with 5V source and 3kΩ, load is 4kΩ between A-B.
GIVEN: V1=10V, R1=2kΩ, V2=5V, R2=3kΩ, R_load=4kΩ
FIND: V_th, R_th, and load current
HINT: Use superposition for V_th. Deactivate both sources for R_th.
SOLUTION: V_th: With V1 only (V2 shorted): V' = 10 * 3/(2+3) = 6V. With V2 only: V'' = 5 * 2/(2+3) = 2V. V_th = 6+2 = 8V. R_th = 2k||3k = 1.2kΩ. I_load = 8/(1.2k+4k) = 1.54mA.
ANSWER: V_th = 8V, R_th = 1.2kΩ, I_load = 1.54mA`,
      Hard: `TITLE: Thevenin-Norton with Dependent Source
DIFFICULTY: Hard
TIME: 30 min
PROBLEM: A circuit has a 15V source, 2kΩ resistor, and a current-controlled voltage source (3k*Ix) where Ix flows through the 2kΩ resistor. Find both Thevenin and Norton equivalents.
GIVEN: V = 15V, R = 2kΩ, CCVS = 3000*Ix
FIND: V_th, R_th, I_n, R_n
HINT: For circuits with dependent sources, find V_oc and I_sc separately. R_th = V_oc/I_sc.
SOLUTION: Open circuit: 15 - 2000Ix - 3000Ix = 0, Ix = 15/5000 = 3mA, V_th = 15 - 2000(0.003) = 9V. Short circuit: I_sc = 15/2000 = 7.5mA. R_th = 9/0.0075 = 1.2kΩ. I_n = 7.5mA, R_n = 1.2kΩ.
ANSWER: V_th = 9V, R_th = 1.2kΩ, I_n = 7.5mA, R_n = 1.2kΩ`,
    },
  };

  const t = topic.toLowerCase();
  const topicKey = Object.keys(problems).find(k => t.includes(k)) || "ohm's law";
  const diffKey = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  return (problems[topicKey]?.[diffKey] || problems[topicKey]?.["Easy"]) || problems["ohm's law"]["Easy"];
}

function generateQuizFallback(topic: string, count: number, difficulty: string): object {
  const questions = [
    { question: "What is Ohm's Law?", options: ["A) V = I + R", "B) V = I × R", "C) V = I / R", "D) V = R / I"], correctIndex: 1, explanation: "Ohm's Law states V = IR, where voltage equals current times resistance." },
    { question: "In a series circuit, what is constant?", options: ["A) Voltage", "B) Current", "C) Power", "D) Resistance"], correctIndex: 1, explanation: "In series circuits, the same current flows through all components." },
    { question: "What does KVL state?", options: ["A) Sum of currents = 0", "B) Sum of voltages around a loop = 0", "C) Power is conserved", "D) Resistance is constant"], correctIndex: 1, explanation: "Kirchhoff's Voltage Law: the algebraic sum of voltages around any closed loop equals zero." },
    { question: "What does KCL state?", options: ["A) Sum of voltages = 0", "B) Current in equals current out", "C) Power in equals power out", "D) Energy is created"], correctIndex: 1, explanation: "Kirchhoff's Current Law: the sum of currents entering a node equals the sum leaving." },
    { question: "Two 1kΩ resistors in parallel equal?", options: ["A) 2kΩ", "B) 500Ω", "C) 1kΩ", "D) 250Ω"], correctIndex: 1, explanation: "R_parallel = (R1×R2)/(R1+R2) = (1000×1000)/2000 = 500Ω." },
    { question: "Thevenin resistance is found by?", options: ["A) Adding all resistances", "B) Deactivating sources and finding R_eq", "C) Measuring voltage", "D) Finding current"], correctIndex: 1, explanation: "Deactivate all independent sources (short V, open I) then find equivalent resistance." },
    { question: "A capacitor at DC steady state acts as?", options: ["A) Short circuit", "B) Open circuit", "C) Resistor", "D) Inductor"], correctIndex: 1, explanation: "At DC steady state, dV/dt = 0, so I = C(dV/dt) = 0. No current flows = open circuit." },
    { question: "An inductor at DC steady state acts as?", options: ["A) Open circuit", "B) Short circuit", "C) Capacitor", "D) Resistor"], correctIndex: 1, explanation: "At DC steady state, dI/dt = 0, so V = L(dI/dt) = 0. Zero voltage drop = short circuit." },
    { question: "Maximum power transfer occurs when?", options: ["A) R_load = 0", "B) R_load = R_th", "C) R_load = ∞", "D) R_load = 2×R_th"], correctIndex: 1, explanation: "Maximum power is transferred when load resistance equals Thevenin resistance." },
    { question: "Superposition applies to?", options: ["A) Power calculations", "B) Voltage and current in linear circuits", "C) Nonlinear circuits", "D) AC circuits only"], correctIndex: 1, explanation: "Superposition works for voltage and current in linear circuits, but NOT for power." },
  ];
  return {
    title: `${topic} Quiz (${difficulty})`,
    questions: questions.slice(0, count),
  };
}

function getHintFallback(problem: string): string {
  const p = problem.toLowerCase();
  if (p.includes("ohm") || p.includes("resistor")) return "Start by identifying all given values and what you need to find. Ohm's Law (V = IR) relates the three fundamental quantities. Draw the circuit and label everything.";
  if (p.includes("kvl")) return "Trace a closed loop and assign polarity (+ to -) for each element. Sum all voltage rises and drops. Remember: voltage rise across a source, drop across a resistor in the current direction.";
  if (p.includes("kcl")) return "Pick a node (except ground) and identify all currents entering and leaving. Use Ohm's Law to express each current: I = (V_node - V_neighbor)/R. The sum of currents entering equals the sum leaving.";
  if (p.includes("thevenin") || p.includes("norton")) return "Step 1: Remove the load and find the open-circuit voltage (V_th). Step 2: Deactivate all sources and find the equivalent resistance (R_th). For Norton, I_n = V_th/R_th.";
  if (p.includes("mesh")) return "Identify independent loops and assign a mesh current to each (clockwise convention). Write KVL for each mesh. Shared resistors have currents that add or subtract.";
  if (p.includes("nodal")) return "Select a reference node (ground). Apply KCL at each non-reference node. Express branch currents using Ohm's Law with node voltages.";
  if (p.includes("capacitor") || p.includes("transient")) return "For transient analysis, find the time constant τ = RC. The capacitor voltage follows: V(t) = V_final + (V_initial - V_final)e^(-t/τ). At t = 5τ, the capacitor is ~99% charged.";
  if (p.includes("superposition")) return "Consider one independent source at a time. Replace other voltage sources with shorts and current sources with opens. Solve for the desired quantity each time, then algebraically sum the results.";
  return "Start by clearly identifying what's given and what you need to find. Draw the circuit diagram and label all components and known values. Break complex circuits into simpler series/parallel combinations when possible.";
}

function getStudyPlanFallback(duration: number, level: string): object {
  const topics = [
    { day: 1, topic: "Ohm's Law & Basic Quantities", duration: "30 min", activities: ["Read Ohm's Law lesson", "Complete 5 practice problems"], resources: ["Textbook Chapter 2", "Ohm's Law Calculator"], goal: "Master V=IR in all three forms" },
    { day: 2, topic: "Series & Parallel Circuits", duration: "45 min", activities: ["Study equivalent resistance", "Build circuits in DC Lab"], resources: ["Textbook Chapter 3", "Circuit Sandbox"], goal: "Simplify any resistor network" },
    { day: 3, topic: "KVL & Voltage Divider", duration: "40 min", activities: ["Learn KVL statement", "Practice loop analysis"], resources: ["Textbook Chapter 4", "KVL Laboratory"], goal: "Apply KVL to any closed loop" },
    { day: 4, topic: "KCL & Current Divider", duration: "40 min", activities: ["Study KCL", "Practice nodal analysis basics"], resources: ["Textbook Chapter 5", "KCL Laboratory"], goal: "Apply KCL at any node" },
    { day: 5, topic: "Thevenin's Theorem", duration: "50 min", activities: ["Learn V_th and R_th finding", "Solve 3 Thevenin problems"], resources: ["Textbook Chapter 7", "Thevenin Lab"], goal: "Find any Thevenin equivalent" },
  ];
  return {
    title: `${duration}-Day DC Circuit Study Plan (${level})`,
    overview: `A structured plan to master DC circuit analysis in ${duration} days, tailored for ${level.toLowerCase()} level.`,
    sessions: topics.slice(0, Math.min(duration, 5)),
    tips: ["Practice every day — consistency beats intensity", "Use the circuit simulators to visualize concepts", "Ask the AI Tutor when stuck", "Review previous topics weekly"],
  };
}

// ─── Router ───────────────────────────────────────────────

export const smartAiRouter = createRouter({
  // Generate a unique circuit problem
  generateProblem: publicQuery
    .input(z.object({
      topic: z.string().min(1),
      difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
    }))
    .mutation(async ({ ctx, input }) => {
      const fallback = () => generateProblemFallback(input.topic, input.difficulty);
      const response = await callKimiWithFallback(
        ctx.user?.id,
        PROBLEM_GEN_PROMPT,
        `Generate a ${input.difficulty} circuit problem about: ${input.topic}`,
        fallback,
        { temperature: 0.8, max_tokens: 2048 }
      );
      return { problem: response, source: response === fallback() ? "local" : "kimi" };
    }),

  // Generate a quiz
  generateQuiz: publicQuery
    .input(z.object({
      topic: z.string().min(1),
      count: z.number().min(1).max(20).default(5),
      difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
    }))
    .mutation(async ({ ctx, input }) => {
      const fallback = () => generateQuizFallback(input.topic, input.count, input.difficulty);

      if (!ctx.user?.id) {
        return { quiz: fallback(), source: "local" };
      }

      const accessToken = await getUserAccessToken(ctx.user.id);
      if (!accessToken) return { quiz: fallback(), source: "local" };

      try {
        const response = await callKimiChat(
          accessToken,
          [
            { role: "system", content: QUIZ_GEN_PROMPT },
            { role: "user", content: `Generate a ${input.difficulty} quiz on "${input.topic}" with ${input.count} questions. Return valid JSON only.` },
          ],
          { temperature: 0.8, max_tokens: 4096 }
        );
        // Try to parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const quiz = jsonMatch ? JSON.parse(jsonMatch[0]) : fallback();
        return { quiz, source: "kimi" };
      } catch (err) {
        console.error("[generateQuiz] Kimi quiz generation failed, using fallback:", err);
        return { quiz: fallback(), source: "local" };
      }
    }),

  // Analyze a described circuit
  analyzeCircuit: publicQuery
    .input(z.object({
      description: z.string().min(10).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const fallback = () => `**Circuit Analysis (Local Mode)**\n\nGiven your circuit description, here's a general approach:\n\n1. **Draw the circuit** - Sketch all components and connections\n2. **Label values** - Mark all known voltages, currents, resistances\n3. **Identify topology** - Series, parallel, or combination?\n4. **Choose method** - Ohm's Law for simple, KVL/KCL for complex, nodal/mesh for systematic\n5. **Solve step by step** - Show all calculations\n6. **Verify** - Check your answer makes physical sense\n\nFor a detailed AI analysis, sign in to enable Kimi-powered circuit analysis.`;

      const response = await callKimiWithFallback(
        ctx.user?.id,
        CIRCUIT_ANALYSIS_PROMPT,
        `Analyze this circuit: ${input.description}`,
        fallback,
        { temperature: 0.7, max_tokens: 3000 }
      );
      return { analysis: response, source: response === fallback() ? "local" : "kimi" };
    }),

  // Get a hint for a problem
  getHint: publicQuery
    .input(z.object({
      problem: z.string().min(10).max(2000),
      previousHints: z.number().min(0).max(5).default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const fallback = () => getHintFallback(input.problem);
      const hintLevel = ["subtle nudge", "clearer guidance", "specific approach", "almost showing", "very detailed hint"][Math.min(input.previousHints, 4)];

      const response = await callKimiWithFallback(
        ctx.user?.id,
        HINT_PROMPT + `\n\nThis is hint #${input.previousHints + 1}. Give a ${hintLevel}.`,
        `Problem: ${input.problem}\n\nGive hint #${input.previousHints + 1} (${hintLevel}).`,
        fallback,
        { temperature: 0.7, max_tokens: 512 }
      );
      return { hint: response, number: input.previousHints + 1 };
    }),

  // Generate a study plan
  generateStudyPlan: publicQuery
    .input(z.object({
      duration: z.number().min(1).max(30).default(7),
      level: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
      focusAreas: z.array(z.string()).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const fallback = () => getStudyPlanFallback(input.duration, input.level);

      if (!ctx.user?.id) {
        return { plan: fallback(), source: "local" };
      }

      const accessToken = await getUserAccessToken(ctx.user.id);
      if (!accessToken) return { plan: fallback(), source: "local" };

      try {
        const response = await callKimiChat(
          accessToken,
          [
            { role: "system", content: STUDY_PLAN_PROMPT },
            { role: "user", content: `Create a ${input.duration}-day study plan for ${input.level} level. Focus areas: ${input.focusAreas.join(", ") || "general DC circuit analysis"}. Return valid JSON.` },
          ],
          { temperature: 0.7, max_tokens: 4096 }
        );
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const plan = jsonMatch ? JSON.parse(jsonMatch[0]) : fallback();
        return { plan, source: "kimi" };
      } catch (err) {
        console.error("[generateStudyPlan] Kimi study plan generation failed, using fallback:", err);
        return { plan: fallback(), source: "local" };
      }
    }),

  // Explain a concept at different levels
  explainConcept: publicQuery
    .input(z.object({
      concept: z.string().min(1),
      level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
    }))
    .mutation(async ({ ctx, input }) => {
      const explanations: Record<string, Record<string, string>> = {
        "ohm's law": {
          beginner: "Think of electricity like water in pipes. Voltage = water pressure. Current = water flow rate. Resistance = pipe narrowness. Ohm's Law says: Pressure = Flow × Narrowness. More pressure pushes more water. A narrower pipe resists more.",
          intermediate: "Ohm's Law (V = IR) is the linear constitutive relation for ohmic materials. Three forms: V=IR, I=V/R, R=V/I. Power: P=VI=I²R=V²/R. Temperature effect: R(T)=R₀[1+α(T-T₀)].",
          advanced: "Ohm's Law is empirical, not fundamental. Microscopically: J=σE where σ=ne²τ/m (Drude model). Non-ohmic behavior arises when conductivity becomes field-dependent. Quantum: resistance from electron-phonon scattering."
        },
        "kvl": {
          beginner: "Imagine walking around a circular track with hills. No matter the path, when you return to start, your net height change is zero. KVL says the same for voltage around any circuit loop.",
          intermediate: "KVL is energy conservation: ΣV=0 around any closed loop. From Maxwell: ∮E·dl = -dΦB/dt. For lumped circuits with negligible changing flux, this gives ΣV=0. Combined with Ohm's Law: complete framework.",
          advanced: "KVL derives from Faraday's law under quasi-static approximation. Exact for lumped elements but breaks at high frequencies when loop dimensions approach λ/10. Generalized KVL accounts for distributed elements."
        },
        "kcl": {
          beginner: "Like water pipes splitting: what flows in must flow out. At any junction, the total current entering equals total current leaving. Nothing disappears.",
          intermediate: "KCL is charge conservation: ΣI_in = ΣI_out at any node. From continuity: ∇·J = -∂ρ/∂t. At steady state: ∇·J=0. Basis for nodal analysis. Combined with Ohm's Law (I=GV) yields conductance matrix.",
          advanced: "KCL is exact at nodes. In nodal analysis: GV=I where G is the conductance matrix. For N nodes, (N-1)×(N-1) symmetric positive-definite system. Sparse for large circuits. Direct solvers: LU decomposition."
        },
      };

      const key = Object.keys(explanations).find(k => input.concept.toLowerCase().includes(k));
      const fallback = () => ({
        explanation: key ? explanations[key][input.level] : `I can explain ${input.concept} at the ${input.level} level. As your DC Circuit tutor, I cover Ohm's Law, KVL, KCL, Thevenin/Norton, nodal/mesh analysis, capacitors, inductors, and transformers. Ask me about any specific topic!`,
      });

      const response = await callKimiWithFallback(
        ctx.user?.id,
        `You are an expert DC Circuit tutor. Explain concepts clearly at the requested level.`,
        `Explain "${input.concept}" at ${input.level} level. Be thorough but appropriate for the level.`,
        () => fallback().explanation,
        { temperature: 0.7, max_tokens: 2048 }
      );

      return { explanation: response, concept: input.concept, level: input.level };
    }),

  // Stream chat for real-time responses
  streamChat: authedQuery
    .input(z.object({
      message: z.string().min(1).max(4000),
      conversationId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const accessToken = await getUserAccessToken(ctx.user.id);
      if (!accessToken) {
        return { error: "No access token. Please sign out and back in." };
      }
      return { conversationId: input.conversationId, ready: true };
    }),
});
