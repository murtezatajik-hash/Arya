"use server";

import { hasLocale } from "next-intl";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export async function signOutAction(locale: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const target = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  redirect(`/${target}/login`);
}
