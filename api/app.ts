import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { rateLimit } from "./lib/rate-limit";
import { csrfProtection } from "./lib/csrf";
import { securityHeaders } from "./lib/security-headers";
import {
  createLoginHandler,
  createRegisterHandler,
  createVerifyOtpHandler,
  createResendOtpHandler,
  createLogoutHandler,
  createForgotPasswordHandler,
  createResetPasswordHandler,
  createChangePasswordHandler,
} from "./auth/handlers";

const app = new Hono();

// Rate limits per spec
const loginRateLimit = rateLimit({ windowMs: 60 * 1000, max: 10 }); // 10/min/IP
const registerRateLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }); // 5/hr/IP
const otpRateLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }); // 5/10min
const resetRateLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 3 }); // 3/hr
const apiRateLimit = rateLimit({ windowMs: 60 * 1000, max: 100 }); // 100/min

// Security headers on all responses
app.use("*", securityHeaders());

// CSRF protection on all mutating API endpoints
app.use("/api/*", csrfProtection());

// General API rate limit
app.use("/api/*", apiRateLimit);

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.post("/api/auth/login", loginRateLimit, createLoginHandler());
app.post("/api/auth/register", registerRateLimit, createRegisterHandler());
app.post("/api/auth/verify-otp", otpRateLimit, createVerifyOtpHandler());
app.post("/api/auth/resend-otp", otpRateLimit, createResendOtpHandler());
app.post("/api/auth/logout", createLogoutHandler());
app.post("/api/auth/forgot-password", resetRateLimit, createForgotPasswordHandler());
app.post("/api/auth/reset-password", resetRateLimit, createResetPasswordHandler());
app.post("/api/auth/change-password", loginRateLimit, createChangePasswordHandler());
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
