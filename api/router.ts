import { authRouter } from "./auth-router";
import { adminRouter } from "./admin-router";
import { progressRouter } from "./progress-router";
import { aiTutorRouter } from "./ai-tutor-router";
import { mathTutorRouter } from "./math-tutor-router";
import { chatRouter } from "./chat-router";
import { smartAiRouter } from "./smart-ai-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  admin: adminRouter,
  progress: progressRouter,
  ai: aiTutorRouter,
  math: mathTutorRouter,
  chat: chatRouter,
  smart: smartAiRouter,
});

export type AppRouter = typeof appRouter;
