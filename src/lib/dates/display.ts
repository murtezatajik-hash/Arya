import {
  calendarDateFromIso,
  formatCalendarNumber,
  type CalendarSystem,
} from "./calendar";
import { isValidIsoDate } from "./values";

export type CalendarMonthNames = Record<
  CalendarSystem,
  readonly string[]
>;

export type DateDisplayOptions = {
  calendar: CalendarSystem;
  locale: string;
  monthNames: CalendarMonthNames;
  hijriOffset?: number;
};

function getMonthName(
  month: number,
  { calendar, monthNames }: DateDisplayOptions,
): string | null {
  return monthNames[calendar]?.[month - 1] ?? null;
}

export function formatDisplayDate(
  value: string,
  { calendar, locale, monthNames, hijriOffset = 0 }: DateDisplayOptions,
): string {
  if (!isValidIsoDate(value)) {
    return value;
  }

  const date = calendarDateFromIso(value, calendar, hijriOffset);

  if (!date) {
    return value;
  }

  const monthName = getMonthName(date.month, {
    calendar,
    locale,
    monthNames,
  });

  if (!monthName) {
    return value;
  }

  const day = formatCalendarNumber(date.day, locale);
  const year = formatCalendarNumber(date.year, locale);

  return locale.startsWith("fa")
    ? `${day} ${monthName} ${year}`
    : `${monthName} ${day}, ${year}`;
}

export function formatMonthName(
  month: number,
  { calendar, locale, monthNames }: DateDisplayOptions,
): string {
  return (
    getMonthName(month, { calendar, locale, monthNames }) ?? ""
  );
}

export function formatMonthYear(
  year: number,
  month: number,
  { calendar, locale, monthNames }: DateDisplayOptions,
): string {
  const monthName = getMonthName(month, {
    calendar,
    locale,
    monthNames,
  });

  if (!monthName) {
    return "";
  }

  return `${monthName} ${formatCalendarNumber(year, locale)}`;
}

export function formatYear(year: number, locale: string): string {
  return formatCalendarNumber(year, locale);
}
