"use client";

import { useTranslations } from "next-intl";
import {
  CALENDAR_SYSTEMS,
  type CalendarSystem,
} from "@/lib/dates/calendar";
import {
  formatDisplayDate,
  type CalendarMonthNames,
} from "@/lib/dates/display";
import { cn } from "@/lib/cn";

type TodayHeroProps = {
  todayIso: string;
  calendar: CalendarSystem;
  hijriOffset: number;
  locale: string;
  monthNames: CalendarMonthNames;
};

export function TodayHero({
  todayIso,
  calendar,
  hijriOffset,
  locale,
  monthNames,
}: TodayHeroProps) {
  const t = useTranslations("calendar");

  return (
    <section className="relative overflow-hidden rounded-2xl border border-line bg-surface/80 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-16 -top-20 size-48 rounded-full bg-accent/10 blur-3xl"
      />

      <p className="relative text-[11px] font-medium uppercase tracking-[0.22em] text-accent rtl:tracking-normal">
        {t("today")}
      </p>

      <div className="relative mt-3 grid gap-2 sm:grid-cols-3">
        {CALENDAR_SYSTEMS.map((system) => {
          const primary = system === calendar;

          return (
            <div
              key={system}
              className={cn(
                "rounded-xl border p-3.5",
                primary
                  ? "border-accent/30 bg-accent/10"
                  : "border-line/70 bg-surface/60",
              )}
            >
              <p className="text-[10px] font-medium text-muted">
                {t(`systems.${system}`)}
              </p>
              <p
                className={cn(
                  "mt-1 break-words text-ink",
                  primary
                    ? "text-lg font-semibold tracking-tight"
                    : "text-sm font-medium text-ink/85",
                )}
              >
                {formatDisplayDate(todayIso, {
                  calendar: system,
                  locale,
                  monthNames,
                  hijriOffset,
                })}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
