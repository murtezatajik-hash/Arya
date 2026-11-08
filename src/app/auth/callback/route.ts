import { hasLocale } from "next-intl";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

function localeFromPath(pathname: string) {
  const first = pathname.split("/").filter(Boolean)[0];
  return hasLocale(routing.locales, first)
    ? first
    : routing.defaultLocale;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext =
    searchParams.get("next") ?? `/${routing.defaultLocale}/ledgers`;

  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : `/${routing.defaultLocale}/ledgers`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/${localeFromPath(next)}/login?error=auth`,
  );
}
