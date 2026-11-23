import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

/**
 * Resolves tenant slug from request hostname or pathname.
 */
export function resolveTenantSlug(hostname: string, pathname: string): string | null {
  const host = (hostname || "").toLowerCase().replace(/:\d+$/, "");
  const match = host.match(/^([a-z0-9-]+)\.gabinete360\.com\.br$/);
  if (match && match[1] && !["www", "app", "master"].includes(match[1])) {
    return match[1];
  }

  const matchPath = pathname.match(/^\/org\/([a-z0-9-]+)/i);
  if (matchPath && matchPath[1]) {
    return matchPath[1].toLowerCase();
  }

  return "gabinete-demo";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const lowerPath = pathname.toLowerCase();

  // 1. Resolve tenant slug
  const tenantSlug = resolveTenantSlug(hostname, pathname);

  // 2. Public bypass list: assets, public portal, auth endpoints
  const isPublicAsset =
    lowerPath.startsWith("/_next") ||
    lowerPath.startsWith("/static") ||
    lowerPath.startsWith("/api/public") ||
    lowerPath === "/favicon.ico" ||
    lowerPath === "/robots.txt";

  const isPublicPortal =
    lowerPath.startsWith("/portal") ||
    lowerPath.startsWith("/p/") ||
    lowerPath === "/p";

  const isAuthRoute =
    lowerPath === "/login" ||
    lowerPath.startsWith("/auth");

  if (isPublicAsset || isPublicPortal) {
    const response = NextResponse.next();
    if (tenantSlug) {
      response.headers.set("x-tenant-slug", tenantSlug);
    }
    return response;
  }

  // 3. Supabase session validation
  const { supabaseResponse, user } = await updateSession(request);

  if (tenantSlug) {
    supabaseResponse.headers.set("x-tenant-slug", tenantSlug);
  }

  // If already on auth routes
  if (isAuthRoute) {
    if (user) {
      // Authenticated users visiting /login are redirected to home
      return NextResponse.redirect(new URL("/", request.url));
    }
    return supabaseResponse;
  }

  // 4. Protected private operational routes
  const isProtectedRoute =
    lowerPath.startsWith("/dashboard") ||
    lowerPath.startsWith("/demandas") ||
    lowerPath.startsWith("/cidadaos") ||
    lowerPath.startsWith("/agenda") ||
    lowerPath.startsWith("/equipe") ||
    lowerPath.startsWith("/tarefas") ||
    lowerPath.startsWith("/legislativo") ||
    lowerPath.startsWith("/fiscalizacao") ||
    lowerPath.startsWith("/participacao") ||
    lowerPath.startsWith("/denuncias") ||
    lowerPath.startsWith("/whatsapp") ||
    lowerPath.startsWith("/ia") ||
    lowerPath.startsWith("/configuracoes") ||
    lowerPath.startsWith("/org");

  // In production, unauthenticated users accessing protected routes must log in
  // Allow root path in demo preview if not explicitly unauthenticated on a protected subroute
  if (!user && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "unauthorized");
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
