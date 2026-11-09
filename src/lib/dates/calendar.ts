import {
  isValidJalaaliDate,
  jalaaliMonthLength,
  toGregorian,
  toJalaali,
} from "jalaali-js";
import { isValidIsoDate, todayIso } from "./values";

export const CALENDAR_SYSTEMS = ["gregorian", "jalali"] as const;

export type CalendarSystem = (typeof CALENDAR_SYSTEMS)[number];

export type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

export type CalendarMonthInfo = {
  year: number;
  month: number;
  days: number;
  firstWeekday: number;
};

export type CalendarPeriod = {
  calendar: CalendarSystem;
  year: number;
  month: number;
  monthStartIso: string;
  monthEndIso: string;
  yearStartIso: string;
  yearEndIso: string;
};

const PERSIAN_DIGITS = /[۰-۹]/g;
const ARABIC_DIGITS = /[٠-٩]/g;
const DATE_INPUT_PATTERN = /^(\d{1,4})[/\-. ]+(\d{1,2})[/\-. ]+(\d{1,2})$/;
const COMPACT_DATE_INPUT_PATTERN = /^(\d{4})(\d{2})(\d{2})$/;

export function isCalendarSystem(value: unknown): value is CalendarSystem {
  return value === "gregorian" || value === "jalali";
}

export function defaultCalendarForLocale(locale: string): CalendarSystem {
  return locale.startsWith("fa") ? "jalali" : "gregorian";
}

export function normalizeDigits(value: string): string {
  return value
    .replace(PERSIAN_DIGITS, (digit) =>
      String.fromCharCode(digit.charCodeAt(0) - 0x06f0 + 0x30),
    )
    .replace(ARABIC_DIGITS, (digit) =>
      String.fromCharCode(digit.charCodeAt(0) - 0x0660 + 0x30),
    );
}

function isoDate(year: number, month: number, day: number): string {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function gregorianMonthLength(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isValidCalendarDate(
  calendar: CalendarSystem,
  date: CalendarDate,
): boolean {
  const { year, month, day } = date;

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1
  ) {
    return false;
  }

  if (calendar === "jalali") {
    try {
      return isValidJalaaliDate(year, month, day);
    } catch {
      return false;
    }
  }

  return day <= gregorianMonthLength(year, month);
}

export function calendarDateFromIso(
  value: string,
  calendar: CalendarSystem,
): CalendarDate | null {
  if (!isValidIsoDate(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (calendar === "gregorian") {
    return { year, month, day };
  }

  try {
    const jalaali = toJalaali(year, month, day);

    return {
      year: jalaali.jy,
      month: jalaali.jm,
      day: jalaali.jd,
    };
  } catch {
    return null;
  }
}

export function isoFromCalendarDate(
  date: CalendarDate,
  calendar: CalendarSystem,
): string | null {
  if (!isValidCalendarDate(calendar, date)) {
    return null;
  }

  if (calendar === "gregorian") {
    const value = isoDate(date.year, date.month, date.day);
    return isValidIsoDate(value) ? value : null;
  }

  try {
    const gregorian = toGregorian(date.year, date.month, date.day);
    const value = isoDate(gregorian.gy, gregorian.gm, gregorian.gd);

    return isValidIsoDate(value) ? value : null;
  } catch {
    return null;
  }
}

export function getCalendarMonthLength(
  calendar: CalendarSystem,
  year: number,
  month: number,
): number {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    year < 1 ||
    month < 1 ||
    month > 12
  ) {
    return 0;
  }

  if (calendar === "jalali") {
    try {
      return jalaaliMonthLength(year, month);
    } catch {
      return 0;
    }
  }

  return gregorianMonthLength(year, month);
}

export function getWeekday(iso: string): number | null {
  if (!isValidIsoDate(iso)) {
    return null;
  }

  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function getCalendarMonthInfo(
  calendar: CalendarSystem,
  year: number,
  month: number,
): CalendarMonthInfo {
  const days = getCalendarMonthLength(calendar, year, month);
  const firstIso =
    days > 0
      ? isoFromCalendarDate({ year, month, day: 1 }, calendar)
      : null;

  return {
    year,
    month,
    days,
    firstWeekday: firstIso ? getWeekday(firstIso) ?? 0 : 0,
  };
}

export function addCalendarMonths(
  year: number,
  month: number,
  delta: number,
): CalendarDate {
  const index = year * 12 + (month - 1) + delta;

  return {
    year: Math.floor(index / 12),
    month: ((index % 12) + 12) % 12 + 1,
    day: 1,
  };
}

export function getCalendarPeriod(
  calendar: CalendarSystem,
  now = new Date(),
): CalendarPeriod {
  const localIso = todayIso(now);
  const current = calendarDateFromIso(localIso, calendar);

  if (!current) {
    throw new RangeError("Unable to resolve the current calendar date.");
  }

  const nextMonth = addCalendarMonths(current.year, current.month, 1);
  const nextYear = addCalendarMonths(current.year, 1, 12);
  const monthStartIso = isoFromCalendarDate(
    { year: current.year, month: current.month, day: 1 },
    calendar,
  );
  const monthEndIso = isoFromCalendarDate(nextMonth, calendar);
  const yearStartIso = isoFromCalendarDate(
    { year: current.year, month: 1, day: 1 },
    calendar,
  );
  const yearEndIso = isoFromCalendarDate(nextYear, calendar);

  if (!monthStartIso || !monthEndIso || !yearStartIso || !yearEndIso) {
    throw new RangeError("Unable to resolve the current calendar period.");
  }

  return {
    calendar,
    year: current.year,
    month: current.month,
    monthStartIso,
    monthEndIso,
    yearStartIso,
    yearEndIso,
  };
}

export function isIsoInRange(
  value: string,
  startIso: string,
  endIsoExclusive: string,
): boolean {
  return value >= startIso && value < endIsoExclusive;
}

export function parseCalendarDateInput(
  value: string,
  calendar: CalendarSystem,
): string | null {
  const normalized = normalizeDigits(value).trim();

  if (!normalized) {
    return null;
  }

  const match =
    DATE_INPUT_PATTERN.exec(normalized) ??
    COMPACT_DATE_INPUT_PATTERN.exec(normalized);

  if (!match) {
    return null;
  }

  return isoFromCalendarDate(
    {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    },
    calendar,
  );
}

export function formatCalendarDateInput(
  value: string,
  calendar: CalendarSystem,
  locale: string,
): string {
  const date = calendarDateFromIso(value, calendar);

  if (!date) {
    return "";
  }

  const raw = [
    String(date.year).padStart(4, "0"),
    String(date.month).padStart(2, "0"),
    String(date.day).padStart(2, "0"),
  ].join("/");
  const numbers = new Intl.NumberFormat(locale, { useGrouping: false });

  return raw.replace(/\d/g, (digit) => numbers.format(Number(digit)));
}

export function formatCalendarNumber(
  value: number,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, { useGrouping: false }).format(value);
}
