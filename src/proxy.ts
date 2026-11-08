import { hasLocale } from "next-intl";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { refreshSession } from "@/lib/supabase/session";

const intlMiddleware = createMiddleware(routing);

const AUTH_ROUTES = new Set(["/login", "/register", "/forgot-password"]);
const PROTECTED_PREFIXES = ["/dashboard", "/ledgers"];

function splitLocale(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first && hasLocale(routing.locales, first)) {
    const rest = `/${segments.slice(1).join("/")}`;
    return {
      locale: first,
      pathname: rest === "/" ? "/" : rest.replace(/\/$/, ""),
    };
  }

  return { locale: routing.defaultLocale, pathname };
}

export async function proxy(request: NextRequest) {
  const session = await refreshSession(request);
  const response = session.applyTo(intlMiddleware(request));

  // Let next-intl finish locale negotiation before applying auth rules.
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  const { locale, pathname } = splitLocale(request.nextUrl.pathname);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!session.user && isProtected) {
    return session.applyTo(
      NextResponse.redirect(new URL(`/${locale}/login`, request.url)),
    );
  }

  if (session.user && AUTH_ROUTES.has(pathname)) {
    return session.applyTo(
      NextResponse.redirect(new URL(`/${locale}/ledgers`, request.url)),
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|auth|offline(?:/|$)|.*\\..*).*)"],
};
