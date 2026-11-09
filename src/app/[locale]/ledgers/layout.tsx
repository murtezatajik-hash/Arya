import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { AppFrame } from "@/components/layout/AppFrame";
import { routing } from "@/i18n/routing";

export default async function LedgersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const activeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  return <AppFrame locale={activeLocale}>{children}</AppFrame>;
}
