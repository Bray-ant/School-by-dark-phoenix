import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@api/router";
import { createContext } from "@api/context";

const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext,
  });
};

export { handler as GET, handler as POST };
