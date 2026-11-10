import {
  calendarDateFromIso,
  isCalendarSystem,
  type CalendarSystem,
} from "../dates/calendar";

export const HOLIDAY_SET_KEYS = [
  "aryan",
  "khorasan",
  "iran",
  "tajikistan",
  "shia",
  "sunni",
  "islamic",
] as const;

export type HolidaySetKey = (typeof HOLIDAY_SET_KEYS)[number];

export type HolidayCategory = "cultural" | "official" | "religious";

export type HolidayRow = {
  id: string;
  set_key: HolidaySetKey;
  calendar: CalendarSystem;
  month: number;
  day: number;
  title_fa: string;
  title_en: string;
  description_fa: string | null;
  description_en: string | null;
  is_official: boolean;
  source_url: string | null;
  verified: boolean;
};

export function isHolidaySetKey(value: unknown): value is HolidaySetKey {
  return (
    typeof value === "string" &&
    (HOLIDAY_SET_KEYS as readonly string[]).includes(value)
  );
}

function isIranRegion(region: string): boolean {
  return ["ir", "irn", "iran", "ایران"].includes(region);
}

function isTajikistanRegion(region: string): boolean {
  return ["tj", "tjk", "tajik", "tajikistan", "تاجیکستان"].includes(region);
}

export function defaultHolidaySets(
  region: string | null | undefined,
): HolidaySetKey[] {
  const normalized = region?.trim().toLowerCase() ?? "";

  if (isIranRegion(normalized)) {
    return ["aryan", "iran", "islamic", "shia"];
  }

  if (isTajikistanRegion(normalized)) {
    return ["aryan", "tajikistan", "islamic", "sunni"];
  }

  return ["aryan", "islamic"];
}

export function resolveHolidaySets(
  value: unknown,
  region: string | null | undefined,
): HolidaySetKey[] {
  if (value === null || value === undefined) {
    return defaultHolidaySets(region);
  }

  if (!Array.isArray(value)) {
    return defaultHolidaySets(region);
  }

  const selected = new Set(
    value.filter((item): item is HolidaySetKey =>
      isHolidaySetKey(item),
    ),
  );

  return HOLIDAY_SET_KEYS.filter((key) => selected.has(key));
}

export function holidayCategory(
  holiday: Pick<HolidayRow, "set_key" | "is_official">,
): HolidayCategory {
  if (holiday.set_key === "aryan" || holiday.set_key === "khorasan") {
    return "cultural";
  }

  if (
    holiday.is_official ||
    holiday.set_key === "iran" ||
    holiday.set_key === "tajikistan"
  ) {
    return "official";
  }

  return "religious";
}

export function holidayMatchesIso(
  holiday: Pick<
    HolidayRow,
    "calendar" | "month" | "day"
  >,
  iso: string,
  hijriOffset: number = 0,
): boolean {
  if (
    !isCalendarSystem(holiday.calendar) ||
    !Number.isInteger(holiday.month) ||
    !Number.isInteger(holiday.day) ||
    holiday.month < 1 ||
    holiday.month > 12 ||
    holiday.day < 1 ||
    holiday.day > 31
  ) {
    return false;
  }

  const date = calendarDateFromIso(
    iso,
    holiday.calendar,
    holiday.calendar === "hijri" ? hijriOffset : 0,
  );

  return date?.month === holiday.month && date.day === holiday.day;
}

export function holidaysForIso(
  holidays: readonly HolidayRow[],
  iso: string,
  visibleSets: readonly HolidaySetKey[],
  hijriOffset: number = 0,
): HolidayRow[] {
  const visible = new Set(visibleSets);

  return holidays.filter(
    (holiday) =>
      visible.has(holiday.set_key) &&
      holidayMatchesIso(holiday, iso, hijriOffset),
  );
}

export function holidayTitle(
  holiday: Pick<HolidayRow, "title_fa" | "title_en">,
  locale: string,
): string {
  return locale.startsWith("fa") ? holiday.title_fa : holiday.title_en;
}

export function holidayDescription(
  holiday: Pick<HolidayRow, "description_fa" | "description_en">,
  locale: string,
): string | null {
  return locale.startsWith("fa")
    ? holiday.description_fa
    : holiday.description_en;
}

export function safeExternalUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
