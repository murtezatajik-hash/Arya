"use client";

import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import {
  CALENDAR_SYSTEMS,
  type CalendarSystem,
} from "@/lib/dates/calendar";

type CalendarQuickSwitcherProps = {
  calendar: CalendarSystem;
  pending: boolean;
  onChange: (calendar: CalendarSystem) => void;
};

export function CalendarQuickSwitcher({
  calendar,
  pending,
  onChange,
}: CalendarQuickSwitcherProps) {
  const t = useTranslations("calendar");

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted">
          {t("page.quickCalendar")}
        </p>
        {pending ? (
          <span
            role="status"
            className="inline-flex items-center gap-1.5 text-[11px] text-muted"
          >
            <Spinner className="size-3" />
            {t("page.savingCalendar")}
          </span>
        ) : null}
      </div>

      <div
        role="group"
        aria-label={t("page.quickCalendar")}
        className="mt-2 grid grid-cols-3 gap-1 rounded-2xl border border-line bg-surface/70 p-1"
      >
        {CALENDAR_SYSTEMS.map((system) => {
          const active = system === calendar;

          return (
            <button
              key={system}
              type="button"
              onClick={() => onChange(system)}
              disabled={pending}
              aria-pressed={active}
              className={cn(
                "rounded-xl px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60",
                active
                  ? "bg-accent-strong text-white shadow-[0_10px_28px_-16px_rgba(225,29,72,0.9)]"
                  : "text-muted hover:text-ink",
              )}
            >
              {t(`systems.${system}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
