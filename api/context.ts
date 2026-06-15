import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import * as cookie from "cookie";
import { eq } from "drizzle-orm";
import { Session } from "@contracts/constants";
import { verifySessionToken } from "./auth/session";
import { findUserById } from "./queries/users";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

function touchLastActive(userId: number) {
  getDb()
    .update(users)
    .set({ lastActiveAt: new Date() })
    .where(eq(users.id, userId))
    .execute()
    .catch((err) => {
      console.error("[touchLastActive] failed to update lastActiveAt:", err);
    });
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    const cookies = cookie.parse(opts.req.headers.get("cookie") || "");
    const token = cookies[Session.cookieName];
    if (token) {
      const claim = await verifySessionToken(token);
      if (claim) {
        ctx.user = await findUserById(claim.userId);
        if (ctx.user) {
          touchLastActive(ctx.user.id);
        }
      }
    }
  } catch (err) {
    console.error("[createContext] session resolution failed:", err);
  }
  return ctx;
}
