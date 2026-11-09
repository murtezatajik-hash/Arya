import {
  calendarDateFromIso,
  formatCalendarNumber,
  type CalendarSystem,
} from "./calendar";
import { isValidIsoDate } from "./values";

const GREGORIAN_CALENDAR = "gregory";

function utcDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export type DateDisplayOptions = {
  calendar: CalendarSystem;
  locale: string;
  monthNames: readonly string[];
};

export function formatDisplayDate(
  value: string,
  { calendar, locale, monthNames }: DateDisplayOptions,
): string {
  if (!isValidIsoDate(value)) {
    return value;
  }

  const date = calendarDateFromIso(value, calendar);

  if (!date) {
    return value;
  }

  if (calendar === "jalali") {
    const monthName = monthNames[date.month - 1];

    if (!monthName) {
      return value;
    }

    return [
      formatCalendarNumber(date.day, locale),
      monthName,
      formatCalendarNumber(date.year, locale),
    ].join(" ");
  }

  return new Intl.DateTimeFormat(locale, {
    calendar: GREGORIAN_CALENDAR,
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(utcDate(date.year, date.month, date.day));
}

export function formatMonthName(
  month: number,
  { calendar, locale, monthNames }: DateDisplayOptions,
): string {
  if (calendar === "jalali") {
    return monthNames[month - 1] ?? "";
  }

  return new Intl.DateTimeFormat(locale, {
    calendar: GREGORIAN_CALENDAR,
    month: "long",
    timeZone: "UTC",
  }).format(utcDate(2020, month, 1));
}

export function formatMonthYear(
  year: number,
  month: number,
  { calendar, locale, monthNames }: DateDisplayOptions,
): string {
  if (calendar === "jalali") {
    const monthName = monthNames[month - 1];

    if (!monthName) {
      return "";
    }

    return `${monthName} ${formatCalendarNumber(year, locale)}`;
  }

  return new Intl.DateTimeFormat(locale, {
    calendar: GREGORIAN_CALENDAR,
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(utcDate(year, month, 1));
}

export function formatYear(year: number, locale: string): string {
  return formatCalendarNumber(year, locale);
}
