import { createVerifyOtpHandler } from "@api/auth/handlers";
import { runHonoHandler } from "@api/lib/hono-adapter";

export async function POST(request: Request) {
  return runHonoHandler(request, createVerifyOtpHandler());
}
