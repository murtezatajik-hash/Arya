import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { LedgersView } from "@/components/ledgers/LedgersView";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { Ledger } from "@/lib/ledgers/constants";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LedgersPage() {
  const locale = await getLocale();
  const activeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale: activeLocale });
    return null;
  }

  const { data, error } = await supabase
    .from("ledgers")
    .select("id, name, default_currency, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Ledger[]>();

  if (error) {
    throw new Error(error.message);
  }

  return <LedgersView ownerId={user.id} ledgers={data ?? []} />;
}
