import assert from "node:assert/strict";
import test from "node:test";
import type { CalendarSystem } from "../dates/calendar";
import { resolveProfileCalendar } from "./calendar";
import {
  saveProfileCalendar,
  type ProfileCalendarUpsertValues,
} from "./save-calendar";

const CALENDARS: CalendarSystem[] = ["gregorian", "jalali", "hijri"];
const LOCALES = ["fa", "en"] as const;

test("resolves a language default only when profiles.calendar is empty", () => {
  assert.deepEqual(resolveProfileCalendar(null, 0, "fa"), {
    calendar: "jalali",
    hijriOffset: 0,
  });
  assert.deepEqual(resolveProfileCalendar(null, 0, "en"), {
    calendar: "gregorian",
    hijriOffset: 0,
  });

  for (const calendar of CALENDARS) {
    for (const locale of LOCALES) {
      assert.deepEqual(
        resolveProfileCalendar(calendar, 1, locale),
        { calendar, hijriOffset: 1 },
      );
    }
  }
});

for (const locale of LOCALES) {
  for (const calendar of CALENDARS) {
    test(`saves ${locale} + ${calendar} without depending on the locale`, async () => {
      const calls: Array<{
        values: ProfileCalendarUpsertValues;
        options: { onConflict: "id" };
      }> = [];

      await saveProfileCalendar(
        async (values, options) => {
          calls.push({ values, options });
          return { error: null };
        },
        {
          userId: "user-id",
          calendar,
          hijriOffset: 2,
          locale,
        },
      );

      assert.deepEqual(calls, [
        {
          values: {
            id: "user-id",
            calendar,
            hijri_offset: 2,
          },
          options: { onConflict: "id" },
        },
      ]);
    });
  }
}

test("reports the actual Supabase error through the thrown error", async () => {
  const originalConsoleError = console.error;
  console.error = () => undefined;

  try {
    await assert.rejects(
      saveProfileCalendar(
        async () => ({
          error: {
            code: "42501",
            message:
              'new row violates row-level security policy for table "profiles"',
          },
        }),
        {
          userId: "user-id",
          calendar: "hijri",
          hijriOffset: 0,
          locale: "fa",
        },
      ),
      /row-level security policy/,
    );
  } finally {
    console.error = originalConsoleError;
  }
});
