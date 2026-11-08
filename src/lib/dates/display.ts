import { isValidIsoDate } from "./values";

// The display adapter is intentionally isolated so a future Persian calendar
// can replace the Gregorian calendar without touching stored dates.
const DISPLAY_CALENDAR = "gregory";

function utcDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function formatDisplayDate(value: string, locale: string): string {
  if (!isValidIsoDate(value)) {
    return value;
  }

  const [year, month, day] = value.split("-").map(Number);

  return new Intl.DateTimeFormat(locale, {
    calendar: DISPLAY_CALENDAR,
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(utcDate(year, month, day));
}

export function formatMonthName(month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    calendar: DISPLAY_CALENDAR,
    month: "long",
    timeZone: "UTC",
  }).format(utcDate(2020, month, 1));
}

export function formatMonthYear(
  year: number,
  month: number,
  locale: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    calendar: DISPLAY_CALENDAR,
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(utcDate(year, month, 1));
}

export function formatYear(year: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    useGrouping: false,
  }).format(year);
}
