import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { CalendarView } from "@/components/calendar/CalendarView";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { HolidayRow } from "@/lib/calendar/holidays";
import { todayIso } from "@/lib/dates/values";
import type { Ledger } from "@/lib/ledgers/constants";
import { loadCalendarProfile } from "@/lib/profile/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
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

  const [profile, t, holidaysResult, ledgersResult] = await Promise.all([
    loadCalendarProfile(supabase, user, activeLocale),
    getTranslations("calendar.page"),
    supabase
      .from("holidays")
      .select(
        "id, set_key, calendar, month, day, title_fa, title_en, description_fa, description_en, is_official, source_url, verified",
      )
      .order("set_key")
      .order("calendar")
      .order("month")
      .order("day"),
    supabase
      .from("ledgers")
      .select("id, name, default_currency, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (holidaysResult.error) {
    console.error("Failed to load holidays", {
      code: holidaysResult.error.code,
      message: holidaysResult.error.message,
    });
  }

  if (ledgersResult.error) {
    console.error("Failed to load ledgers for calendar", {
      code: ledgersResult.error.code,
      message: ledgersResult.error.message,
    });
  }

  const holidays = holidaysResult.error
    ? []
    : ((holidaysResult.data ?? []) as HolidayRow[]);
  const ledgers = ledgersResult.error
    ? []
    : ((ledgersResult.data ?? []) as Ledger[]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent rtl:tracking-normal">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {t("subtitle")}
          </p>
        </div>

        <ButtonLink
          href="/calendar/settings"
          variant="secondary"
          className="w-full shrink-0 sm:w-auto"
        >
          {t("settingsLink")}
        </ButtonLink>
      </header>

      <CalendarView
        userId={user.id}
        locale={activeLocale}
        initialProfile={profile}
        initialToday={todayIso()}
        holidays={holidays}
        holidaysError={Boolean(holidaysResult.error)}
        ledgers={ledgers}
        ledgersError={Boolean(ledgersResult.error)}
      />
    </div>
  );
}
