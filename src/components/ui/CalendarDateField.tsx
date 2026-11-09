"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import {
  addCalendarMonths,
  calendarDateFromIso,
  formatCalendarDateInput,
  formatCalendarNumber,
  getCalendarMonthInfo,
  isoFromCalendarDate,
  parseCalendarDateInput,
  type CalendarSystem,
} from "@/lib/dates/calendar";
import {
  formatDisplayDate,
  formatMonthYear,
} from "@/lib/dates/display";
import { todayIso } from "@/lib/dates/values";

type CalendarDateFieldProps = {
  calendar: CalendarSystem;
  label: string;
  value: string;
  onChange: (value: string | null) => void;
  error?: string;
  hint?: string;
  required?: boolean;
};

const WEEK_START_BY_LOCALE = 6;

function localeWeekStart(locale: string): number {
  return locale.startsWith("fa") ? WEEK_START_BY_LOCALE : 0;
}

export function CalendarDateField({
  calendar,
  label,
  value,
  onChange,
  error,
  hint,
  required,
}: CalendarDateFieldProps) {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const generatedId = useId();
  const fieldId = `${generatedId}-field`;
  const panelId = `${generatedId}-panel`;
  const messageId = `${generatedId}-message`;
  const monthNames = t.raw("months.jalali") as string[];
  const weekdaysShort = t.raw("weekdaysShort") as string[];
  const initialDate =
    calendarDateFromIso(value, calendar) ??
    calendarDateFromIso(todayIso(), calendar);
  const [text, setText] = useState(() =>
    value ? formatCalendarDateInput(value, calendar, locale) : "",
  );
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => ({
    year: initialDate?.year ?? 1,
    month: initialDate?.month ?? 1,
  }));
  const selectedDate = value ? calendarDateFromIso(value, calendar) : null;
  const todayDate = calendarDateFromIso(todayIso(), calendar);
  const monthInfo = getCalendarMonthInfo(calendar, view.year, view.month);
  const weekStart = localeWeekStart(locale);
  const weekOrder = Array.from(
    { length: 7 },
    (_, index) => (weekStart + index) % 7,
  );
  const leadingCells =
    (monthInfo.firstWeekday - weekStart + 7) % 7;
  const displayOptions = { calendar, locale, monthNames };
  const message = error ?? hint;

  function selectIso(iso: string) {
    const date = calendarDateFromIso(iso, calendar);

    if (!date) {
      return;
    }

    setText(formatCalendarDateInput(iso, calendar, locale));
    setView({ year: date.year, month: date.month });
    onChange(iso);
    setOpen(false);
  }

  function handleTextChange(nextValue: string) {
    setText(nextValue);
    onChange(parseCalendarDateInput(nextValue, calendar));
  }

  function setToday() {
    selectIso(todayIso());
  }

  function changeMonth(delta: number) {
    const next = addCalendarMonths(view.year, view.month, delta);
    setView({ year: next.year, month: next.month });
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={fieldId}
          className="block text-xs font-medium text-muted"
        >
          {label}
        </label>
        <button
          type="button"
          onClick={setToday}
          className="rounded-sm text-[11px] font-medium text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {t("today")}
        </button>
      </div>

      <div className="flex gap-2">
        <input
          id={fieldId}
          value={text}
          onChange={(event) => handleTextChange(event.target.value)}
          placeholder={formatCalendarDateInput(
            todayIso(),
            calendar,
            locale,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            "h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/50 focus:border-accent/60 focus:ring-2 focus:ring-accent/15",
            error && "border-accent-strong/60 focus:border-accent-strong",
          )}
          inputMode="numeric"
          autoComplete="off"
          dir="ltr"
          required={required}
        />

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={t("openPicker")}
          aria-expanded={open}
          aria-controls={panelId}
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            open && "border-accent/40 text-accent",
          )}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
            <path d="M8 3.5v4M16 3.5v4M3.5 10h17" />
          </svg>
        </button>
      </div>

      {open ? (
        <div
          id={panelId}
          role="group"
          aria-label={t("openPicker")}
          className="mt-2 rounded-2xl border border-line bg-surface p-3 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)]"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label={t("previousMonth")}
              className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 rtl:-scale-x-100"
              >
                <path d="m14.5 6-6 6 6 6" />
              </svg>
            </button>

            <p className="text-sm font-medium text-ink">
              {formatMonthYear(view.year, view.month, displayOptions)}
            </p>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label={t("nextMonth")}
              className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 rtl:-scale-x-100"
              >
                <path d="m9.5 6 6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {weekOrder.map((weekday) => (
              <span
                key={weekday}
                className="flex h-7 items-center justify-center text-[10px] font-medium text-muted/70"
              >
                {weekdaysShort[weekday] ?? ""}
              </span>
            ))}

            {Array.from({ length: leadingCells }, (_, index) => (
              <span key={`empty-${index}`} aria-hidden="true" />
            ))}

            {Array.from({ length: monthInfo.days }, (_, index) => {
              const day = index + 1;
              const iso = isoFromCalendarDate(
                { year: view.year, month: view.month, day },
                calendar,
              );
              const isSelected =
                selectedDate?.year === view.year &&
                selectedDate?.month === view.month &&
                selectedDate?.day === day;
              const isToday =
                todayDate?.year === view.year &&
                todayDate?.month === view.month &&
                todayDate?.day === day;

              if (!iso) {
                return <span key={`invalid-${day}`} />;
              }

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => selectIso(iso)}
                  aria-label={formatDisplayDate(iso, displayOptions)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg text-xs tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                    isSelected
                      ? "bg-accent-strong font-semibold text-white"
                      : "text-ink hover:bg-surface-raised",
                    isToday && !isSelected && "text-accent",
                  )}
                >
                  {formatCalendarNumber(day, locale)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {message ? (
        <p
          id={messageId}
          className={cn(
            "text-[11px] leading-5",
            error ? "text-accent" : "text-muted/70",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
