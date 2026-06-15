import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { rateLimit } from "./lib/rate-limit";
import {
  createLoginHandler,
  createRegisterHandler,
  createLogoutHandler,
  createForgotPasswordHandler,
  createResetPasswordHandler,
  createChangePasswordHandler,
} from "./auth/handlers";

const app = new Hono();

const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const strictRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.post("/api/auth/login", authRateLimit, createLoginHandler());
app.post("/api/auth/register", authRateLimit, createRegisterHandler());
app.post("/api/auth/logout", createLogoutHandler());
app.post("/api/auth/forgot-password", strictRateLimit, createForgotPasswordHandler());
app.post("/api/auth/reset-password", strictRateLimit, createResetPasswordHandler());
app.post("/api/auth/change-password", authRateLimit, createChangePasswordHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;
