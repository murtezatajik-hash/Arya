import assert from "node:assert/strict";
import test from "node:test";
import {
  saveProfileCalendarSettings,
  type ProfileCalendarSettingsValues,
} from "./save-calendar-settings";
import type { ProfileCalendarUpsert } from "./save-calendar";

test("saves the full calendar settings payload in one upsert", async () => {
  const calls: Array<{
    values: ProfileCalendarSettingsValues;
    options: { onConflict: "id" };
  }> = [];

  await saveProfileCalendarSettings(
    (async (values, options) => {
      calls.push({
        values: values as ProfileCalendarSettingsValues,
        options,
      });
      return { error: null };
    }) as ProfileCalendarUpsert,
    {
      userId: "user-id",
      calendar: "hijri",
      hijriOffset: 1,
      holidaySets: ["aryan", "iran", "islamic", "shia"],
      birthDate: "1990-04-12",
      locale: "fa",
    },
  );

  assert.deepEqual(calls, [
    {
      values: {
        id: "user-id",
        calendar: "hijri",
        hijri_offset: 1,
        holiday_sets: ["aryan", "iran", "shia", "islamic"],
        birth_date: "1990-04-12",
      },
      options: { onConflict: "id" },
    },
  ]);
});

test("filters unknown sets, clamps the offset, and clears an invalid birth date", async () => {
  const calls: ProfileCalendarSettingsValues[] = [];

  await saveProfileCalendarSettings(
    (async (values) => {
      calls.push(values as ProfileCalendarSettingsValues);
      return { error: null };
    }) as ProfileCalendarUpsert,
    {
      userId: "user-id",
      calendar: "jalali",
      hijriOffset: 99,
      holidaySets: ["sunni", "unknown", "sunni", "tajikistan"],
      birthDate: "2026-02-30",
    },
  );

  assert.deepEqual(calls[0], {
    id: "user-id",
    calendar: "jalali",
    hijri_offset: 2,
    holiday_sets: ["tajikistan", "sunni"],
    birth_date: null,
  });
});

test("stores an empty set list when the user turns every set off", async () => {
  const calls: ProfileCalendarSettingsValues[] = [];

  await saveProfileCalendarSettings(
    (async (values) => {
      calls.push(values as ProfileCalendarSettingsValues);
      return { error: null };
    }) as ProfileCalendarUpsert,
    {
      userId: "user-id",
      calendar: "gregorian",
      hijriOffset: 0,
      holidaySets: [],
      birthDate: null,
    },
  );

  assert.deepEqual(calls[0]?.holiday_sets, []);
});

test("reports the actual Supabase error", async () => {
  const originalConsoleError = console.error;
  console.error = () => undefined;

  try {
    await assert.rejects(
      saveProfileCalendarSettings(
        (async () => ({
          error: {
            code: "42501",
            message:
              'new row violates row-level security policy for table "profiles"',
          },
        })) as ProfileCalendarUpsert,
        {
          userId: "user-id",
          calendar: "hijri",
          hijriOffset: 0,
          holidaySets: ["islamic"],
          birthDate: null,
        },
      ),
      /row-level security policy/,
    );
  } finally {
    console.error = originalConsoleError;
  }
});
