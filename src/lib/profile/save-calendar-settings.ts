import {
  clampHijriOffset,
  type CalendarSystem,
} from "../dates/calendar";
import { isValidIsoDate } from "../dates/values";
import {
  HOLIDAY_SET_KEYS,
  type HolidaySetKey,
} from "../calendar/holidays";
import type {
  ProfileCalendarSaveError,
  ProfileCalendarUpsert,
} from "./save-calendar";

export type ProfileCalendarSettingsValues = {
  id: string;
  calendar: CalendarSystem;
  hijri_offset: number;
  holiday_sets: HolidaySetKey[];
  birth_date: string | null;
};

export type SaveProfileCalendarSettingsInput = {
  userId: string;
  calendar: CalendarSystem;
  hijriOffset: number;
  holidaySets: readonly string[];
  birthDate: string | null;
  locale?: string;
};

export async function saveProfileCalendarSettings(
  upsert: ProfileCalendarUpsert,
  input: SaveProfileCalendarSettingsInput,
): Promise<void> {
  const requestedSets = new Set(
    Array.isArray(input.holidaySets) ? input.holidaySets : [],
  );
  const holidaySets = HOLIDAY_SET_KEYS.filter((key) =>
    requestedSets.has(key),
  );
  const birthDate =
    input.birthDate && isValidIsoDate(input.birthDate)
      ? input.birthDate
      : null;
  const values: ProfileCalendarSettingsValues = {
    id: input.userId,
    calendar: input.calendar,
    hijri_offset: clampHijriOffset(input.hijriOffset),
    holiday_sets: holidaySets,
    birth_date: birthDate,
  };

  const { error } = await upsert(values, { onConflict: "id" });

  if (error) {
    console.error("Failed to save calendar page settings", {
      table: "profiles",
      operation: "upsert",
      locale: input.locale ?? null,
      calendar: input.calendar,
      hijriOffset: input.hijriOffset,
      holidaySets,
      hasBirthDate: birthDate !== null,
      code: error.code ?? null,
      message: error.message ?? null,
      details: error.details ?? null,
      hint: error.hint ?? null,
    });

    throw new Error(
      error.message ?? "Unable to save the calendar settings.",
    );
  }
}

export type { ProfileCalendarSaveError };
