import { NextResponse, type NextRequest } from "next/server";
import { updateMasterSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Public assets bypass
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt";

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // 2. Supabase session update
  const { supabaseResponse, user, supabase } = await updateMasterSession(request);

  // Require real Supabase authenticated user (no cookie-only bypass)
  const hasAdminAuth = user !== null;
  let hasMfaVerified = false;
  if (hasAdminAuth) {
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    hasMfaVerified = aalData?.currentLevel === "aal2";
  }

  const isAuthRoute = pathname === "/login" || pathname.startsWith("/auth");
  const isMfaRoute = pathname === "/mfa";

  // If on login page
  if (isAuthRoute) {
    if (hasAdminAuth && hasMfaVerified) {
      return NextResponse.redirect(new URL("/master", request.url));
    }
    if (hasAdminAuth && !hasMfaVerified) {
      return NextResponse.redirect(new URL("/master/mfa", request.url));
    }
    return supabaseResponse;
  }

  // If on MFA challenge page
  if (isMfaRoute) {
    if (!hasAdminAuth) {
      return NextResponse.redirect(new URL("/master/login", request.url));
    }
    if (hasMfaVerified) {
      return NextResponse.redirect(new URL("/master", request.url));
    }
    return supabaseResponse;
  }

  // 3. Protected administrative routes
  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/clientes") ||
    pathname.startsWith("/organizacoes") ||
    pathname.startsWith("/planos") ||
    pathname.startsWith("/modulos") ||
    pathname.startsWith("/administradores") ||
    pathname.startsWith("/provisionamento") ||
    pathname.startsWith("/monitoramento") ||
    pathname.startsWith("/auditoria") ||
    pathname.startsWith("/suporte");

  if (isProtectedRoute) {
    // If not authenticated, redirect to login with error parameter
    if (!hasAdminAuth) {
      const loginUrl = new URL("/master/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      loginUrl.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If authenticated but MFA has not been satisfied, force MFA step-up
    if (!hasMfaVerified) {
      return NextResponse.redirect(new URL("/master/mfa", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
