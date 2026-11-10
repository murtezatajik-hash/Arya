"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import {
  CALENDAR_SYSTEMS,
  calendarDateFromIso,
  formatCalendarNumber,
  type CalendarSystem,
} from "@/lib/dates/calendar";
import {
  formatDisplayDate,
  type CalendarMonthNames,
} from "@/lib/dates/display";
import type { CalendarMonthGrid as CalendarMonthGridData } from "@/lib/calendar/month-grid";

type CalendarMonthGridProps = {
  calendar: CalendarSystem;
  hijriOffset: number;
  locale: string;
  weekStart: number;
  selectedIso: string;
  todayIso: string;
  onSelect: (iso: string) => void;
  grid: CalendarMonthGridData;
  holidayCategoriesByIso?: Record<string, readonly string[]>;
  holidayTitlesByIso?: Record<string, readonly string[]>;
  transactionCountsByIso?: Record<string, number>;
};

const CATEGORY_DOT: Record<string, string> = {
  cultural: "bg-amber-400",
  official: "bg-sky-400",
  religious: "bg-rose-400",
};

export function CalendarMonthGrid({
  calendar,
  hijriOffset,
  locale,
  weekStart,
  selectedIso,
  todayIso,
  onSelect,
  grid,
  holidayCategoriesByIso = {},
  holidayTitlesByIso = {},
  transactionCountsByIso = {},
}: CalendarMonthGridProps) {
  const t = useTranslations("calendar");
  const monthNames = t.raw("months") as CalendarMonthNames;
  const weekdaysShort = t.raw("weekdaysShort") as string[];
  const weekOrder = Array.from(
    { length: 7 },
    (_, index) => (weekStart + index) % 7,
  );
  const displayOptions = {
    calendar,
    locale,
    monthNames,
    hijriOffset,
  };

  if (grid.cells.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
        {t("page.loadError")}
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2" role="group">
        {weekOrder.map((weekday) => (
          <span
            key={weekday}
            className="flex h-7 items-center justify-center text-[10px] font-medium text-muted/70 sm:text-[11px]"
          >
            {weekdaysShort[weekday] ?? ""}
          </span>
        ))}

        {grid.cells.map((cell) => {
          const primary = cell.date;
          const selected = cell.iso === selectedIso;
          const isToday = cell.iso === todayIso;
          const categories = holidayCategoriesByIso[cell.iso] ?? [];
          const holidayTitles = holidayTitlesByIso[cell.iso] ?? [];
          const transactionCount = transactionCountsByIso[cell.iso] ?? 0;
          const otherCalendars = CALENDAR_SYSTEMS.filter(
            (system) => system !== calendar,
          );
          const labelParts = [
            formatDisplayDate(cell.iso, displayOptions),
            ...holidayTitles,
          ];

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelect(cell.iso)}
              aria-label={labelParts.join("، ")}
              aria-pressed={selected}
              title={holidayTitles.join("، ") || undefined}
              className={cn(
                "relative flex min-h-[4.25rem] flex-col items-stretch gap-1 rounded-xl border p-1.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:min-h-[4.75rem] sm:p-2",
                cell.inMonth
                  ? "border-line/70 bg-surface/60 hover:border-accent/30 hover:bg-surface-raised"
                  : "border-transparent bg-transparent opacity-40 hover:opacity-70",
                selected &&
                  "border-accent/60 bg-accent/10 ring-1 ring-accent/30",
                isToday && !selected && "border-accent/35",
              )}
            >
              <span
                className={cn(
                  "text-sm font-semibold leading-none tabular-nums sm:text-base",
                  selected
                    ? "text-accent"
                    : isToday
                      ? "text-accent"
                      : "text-ink",
                )}
              >
                {primary ? formatCalendarNumber(primary.day, locale) : "—"}
              </span>

              <span className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[9px] leading-none text-muted/65 tabular-nums">
                {otherCalendars.map((system) => {
                  const date = calendarDateFromIso(
                    cell.iso,
                    system,
                    hijriOffset,
                  );

                  return (
                    <span key={system} title={t(`systems.${system}`)}>
                      {date ? formatCalendarNumber(date.day, locale) : "—"}
                    </span>
                  );
                })}
              </span>

              <span className="mt-auto flex min-h-3 flex-wrap items-center gap-1">
                {categories.map((category) => (
                  <span
                    key={category}
                    className={cn(
                      "size-1.5 rounded-full",
                      CATEGORY_DOT[category] ?? "bg-muted",
                    )}
                  />
                ))}

                {transactionCount > 0 ? (
                  <span className="ms-auto inline-flex min-w-4 items-center justify-center rounded-full border border-line/70 bg-canvas/70 px-1 py-0.5 text-[8px] font-semibold leading-none text-muted tabular-nums">
                    {formatCalendarNumber(transactionCount, locale)}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
