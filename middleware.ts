import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = [
  "http://localhost:3000",
  "https://school-by-dark-phoenix.onrender.com",
  "https://project-school.netlify.app",
];

function getOrigin(request: NextRequest): string {
  return (
    request.headers.get("origin") ||
    request.headers.get("referer") ||
    request.nextUrl.origin
  );
}

function isAllowedOrigin(origin: string, requestOrigin: string): boolean {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.startsWith("http://localhost:")) return true;
  // Allow the site's own origin (e.g. custom domains, preview deploys)
  if (origin === requestOrigin) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { method } = request;

  // CSRF protection for mutating API requests
  if (pathname.startsWith("/api/") && method !== "GET" && method !== "HEAD") {
    const origin = getOrigin(request);
    if (!isAllowedOrigin(origin, request.nextUrl.origin)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
