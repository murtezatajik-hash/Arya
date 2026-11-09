import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { CalendarSettingsForm } from "@/components/settings/CalendarSettingsForm";
import { Link, redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { loadProfileCalendar } from "@/lib/profile/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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

  const [calendar, t] = await Promise.all([
    loadProfileCalendar(supabase, user, activeLocale),
    getTranslations("settings"),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/ledgers"
        className="inline-flex w-fit items-center gap-2 rounded-sm text-sm text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 rtl:-scale-x-100"
        >
          <path d="M15 18 9 12l6-6" />
        </svg>
        {t("back")}
      </Link>

      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent rtl:tracking-normal">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          {t("subtitle")}
        </p>
      </header>

      <CalendarSettingsForm
        userId={user.id}
        initialCalendar={calendar}
      />
    </div>
  );
}
