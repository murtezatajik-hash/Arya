import {
  isValidJalaaliDate,
  jalaaliMonthLength,
  toGregorian,
  toJalaali,
} from "jalaali-js";
import { isValidIsoDate, todayIso } from "./values";

export const CALENDAR_SYSTEMS = ["gregorian", "jalali", "hijri"] as const;

export type CalendarSystem = (typeof CALENDAR_SYSTEMS)[number];

export const HIJRI_OFFSETS = [-2, -1, 0, 1, 2] as const;

export const HIJRI_OFFSET_MIN = HIJRI_OFFSETS[0];
export const HIJRI_OFFSET_MAX = HIJRI_OFFSETS[HIJRI_OFFSETS.length - 1];

export type HijriOffset = (typeof HIJRI_OFFSETS)[number];

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
  firstIso: string | null;
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

const HIJRI_SEARCH_MIN_ISO = "0622-01-01";
const HIJRI_SEARCH_MAX_ISO = "9999-12-31";

const hijriFormatter = new Intl.DateTimeFormat(
  "en-US-u-ca-islamic-umalqura",
  {
    calendar: "islamic-umalqura",
    numberingSystem: "latn",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  },
);

const hijriFromIsoCache = new Map<string, CalendarDate | null>();
const hijriIsoCache = new Map<string, string | null>();

export function isCalendarSystem(value: unknown): value is CalendarSystem {
  return (
    value === "gregorian" || value === "jalali" || value === "hijri"
  );
}

export function isHijriOffset(value: unknown): value is HijriOffset {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= HIJRI_OFFSET_MIN &&
    value <= HIJRI_OFFSET_MAX
  );
}

export function clampHijriOffset(value: unknown): HijriOffset {
  const numeric = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.min(
    HIJRI_OFFSET_MAX,
    Math.max(HIJRI_OFFSET_MIN, Math.trunc(numeric)),
  ) as HijriOffset;
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

function utcDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function isoToEpochDay(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  return Math.floor(utcDate(year, month, day).getTime() / 86_400_000);
}

function epochDayToIso(epochDay: number): string {
  const date = new Date(epochDay * 86_400_000);
  return isoDate(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
}

export function addIsoDays(value: string, days: number): string {
  if (!isValidIsoDate(value) || !Number.isInteger(days)) {
    return value;
  }

  return epochDayToIso(isoToEpochDay(value) + days);
}

function diffIsoDays(startIso: string, endIsoExclusive: string): number {
  return isoToEpochDay(endIsoExclusive) - isoToEpochDay(startIso);
}

function gregorianMonthLength(year: number, month: number): number {
  return utcDate(year, month + 1, 0).getUTCDate();
}

function hijriDateFromIso(value: string): CalendarDate | null {
  if (!isValidIsoDate(value)) {
    return null;
  }

  const cached = hijriFromIsoCache.get(value);

  if (cached !== undefined) {
    return cached;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parts: Record<string, string> = {};

  for (const part of hijriFormatter.formatToParts(
    utcDate(year, month, day),
  )) {
    if (part.type !== "literal") {
      parts[part.type] = part.value;
    }
  }

  const hijriYear = Number(parts.year);
  const hijriMonth = Number(parts.month);
  const hijriDay = Number(parts.day);

  if (
    !Number.isInteger(hijriYear) ||
    !Number.isInteger(hijriMonth) ||
    !Number.isInteger(hijriDay)
  ) {
    hijriFromIsoCache.set(value, null);
    return null;
  }

  const result = {
    year: hijriYear,
    month: hijriMonth,
    day: hijriDay,
  };

  hijriFromIsoCache.set(value, result);
  return result;
}

function hijriKey(date: CalendarDate): number {
  return date.year * 10_000 + date.month * 100 + date.day;
}

function hijriDateToIso(date: CalendarDate): string | null {
  if (
    !Number.isInteger(date.year) ||
    !Number.isInteger(date.month) ||
    !Number.isInteger(date.day) ||
    date.year < 1 ||
    date.year > 9999 ||
    date.month < 1 ||
    date.month > 12 ||
    date.day < 1 ||
    date.day > 30
  ) {
    return null;
  }

  const cacheKey = `${date.year}-${date.month}-${date.day}`;
  const cached = hijriIsoCache.get(cacheKey);

  if (cached !== undefined) {
    return cached;
  }

  const targetKey = hijriKey(date);
  let low = isoToEpochDay(HIJRI_SEARCH_MIN_ISO);
  let high = isoToEpochDay(HIJRI_SEARCH_MAX_ISO);
  let result: string | null = null;

  while (low <= high) {
    const middle = low + Math.floor((high - low) / 2);
    const middleIso = epochDayToIso(middle);
    const middleDate = hijriDateFromIso(middleIso);

    if (!middleDate) {
      high = middle - 1;
      continue;
    }

    const middleKey = hijriKey(middleDate);

    if (middleKey === targetKey) {
      result = middleIso;
      break;
    }

    if (middleKey < targetKey) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  hijriIsoCache.set(cacheKey, result);
  return result;
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

  if (calendar === "hijri") {
    return hijriDateToIso(date) !== null;
  }

  return day <= gregorianMonthLength(year, month);
}

export function calendarDateFromIso(
  value: string,
  calendar: CalendarSystem,
  hijriOffset: number = 0,
): CalendarDate | null {
  if (!isValidIsoDate(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (calendar === "gregorian") {
    return { year, month, day };
  }

  if (calendar === "hijri") {
    return hijriDateFromIso(
      addIsoDays(value, clampHijriOffset(hijriOffset)),
    );
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
  hijriOffset: number = 0,
): string | null {
  if (!isValidCalendarDate(calendar, date)) {
    return null;
  }

  if (calendar === "gregorian") {
    const value = isoDate(date.year, date.month, date.day);
    return isValidIsoDate(value) ? value : null;
  }

  if (calendar === "hijri") {
    const rawIso = hijriDateToIso(date);

    return rawIso
      ? addIsoDays(rawIso, -clampHijriOffset(hijriOffset))
      : null;
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

  if (calendar === "hijri") {
    const startIso = hijriDateToIso({ year, month, day: 1 });
    const nextMonth = addCalendarMonths(year, month, 1);
    const nextIso = hijriDateToIso(nextMonth);

    if (!startIso || !nextIso) {
      return 0;
    }

    return diffIsoDays(startIso, nextIso);
  }

  return gregorianMonthLength(year, month);
}

export function getWeekday(iso: string): number | null {
  if (!isValidIsoDate(iso)) {
    return null;
  }

  const [year, month, day] = iso.split("-").map(Number);
  return utcDate(year, month, day).getUTCDay();
}

export function getCalendarMonthInfo(
  calendar: CalendarSystem,
  year: number,
  month: number,
  hijriOffset: number = 0,
): CalendarMonthInfo {
  const days = getCalendarMonthLength(calendar, year, month);
  const firstIso =
    days > 0
      ? isoFromCalendarDate(
          { year, month, day: 1 },
          calendar,
          hijriOffset,
        )
      : null;

  return {
    year,
    month,
    days,
    firstWeekday: firstIso ? getWeekday(firstIso) ?? 0 : 0,
    firstIso,
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
    month: (((index % 12) + 12) % 12) + 1,
    day: 1,
  };
}

export function getCalendarPeriod(
  calendar: CalendarSystem,
  now = new Date(),
  hijriOffset: number = 0,
): CalendarPeriod {
  const localIso = todayIso(now);
  const current = calendarDateFromIso(
    localIso,
    calendar,
    hijriOffset,
  );

  if (!current) {
    throw new RangeError("Unable to resolve the current calendar date.");
  }

  const nextMonth = addCalendarMonths(current.year, current.month, 1);
  const nextYear = addCalendarMonths(current.year, 1, 12);
  const monthStartIso = isoFromCalendarDate(
    { year: current.year, month: current.month, day: 1 },
    calendar,
    hijriOffset,
  );
  const monthEndIso = isoFromCalendarDate(
    nextMonth,
    calendar,
    hijriOffset,
  );
  const yearStartIso = isoFromCalendarDate(
    { year: current.year, month: 1, day: 1 },
    calendar,
    hijriOffset,
  );
  const yearEndIso = isoFromCalendarDate(
    nextYear,
    calendar,
    hijriOffset,
  );

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
  hijriOffset: number = 0,
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
    hijriOffset,
  );
}

export function formatCalendarDateInput(
  value: string,
  calendar: CalendarSystem,
  locale: string,
  hijriOffset: number = 0,
): string {
  const date = calendarDateFromIso(value, calendar, hijriOffset);

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
