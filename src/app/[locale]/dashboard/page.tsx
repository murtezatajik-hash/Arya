import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const locale = await getLocale();
  const activeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  redirect({ href: "/ledgers", locale: activeLocale });
}
