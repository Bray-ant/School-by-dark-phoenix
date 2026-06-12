import app from "../../api/app";

function normalizeRequest(request: Request): Request {
  const url = new URL(request.url);
  // Netlify Functions may expose the request at `/.netlify/functions/api`.
  // Rewrite the path back to `/api/*` so the Hono app routes match.
  if (url.pathname.startsWith("/.netlify/functions/api")) {
    url.pathname = url.pathname.replace("/.netlify/functions/api", "/api");
    return new Request(url, request);
  }
  return request;
}

export default async function handler(request: Request, context: any) {
  return app.fetch(normalizeRequest(request), process.env, context);
}
