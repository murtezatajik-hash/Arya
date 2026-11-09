import {
  clampHijriOffset,
  type CalendarSystem,
} from "../dates/calendar";

export type ProfileCalendarUpsertValues = {
  id: string;
  calendar: CalendarSystem;
  hijri_offset: number;
};

export type ProfileCalendarSaveError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

export type ProfileCalendarUpsert = (
  values: ProfileCalendarUpsertValues,
  options: { onConflict: "id" },
) => PromiseLike<{ error: ProfileCalendarSaveError | null }>;

export type SaveProfileCalendarInput = {
  userId: string;
  calendar: CalendarSystem;
  hijriOffset: number;
  locale?: string;
};

export async function saveProfileCalendar(
  upsert: ProfileCalendarUpsert,
  input: SaveProfileCalendarInput,
): Promise<void> {
  const values: ProfileCalendarUpsertValues = {
    id: input.userId,
    calendar: input.calendar,
    hijri_offset: clampHijriOffset(input.hijriOffset),
  };

  const { error } = await upsert(values, { onConflict: "id" });

  if (error) {
    // Keep the actual PostgREST/Supabase error visible in the browser console.
    // Without this, the UI only showed a generic "could not save" message.
    console.error("Failed to save calendar settings", {
      table: "profiles",
      operation: "upsert",
      locale: input.locale ?? null,
      calendar: input.calendar,
      hijriOffset: input.hijriOffset,
      code: error.code ?? null,
      message: error.message ?? null,
      details: error.details ?? null,
      hint: error.hint ?? null,
    });

    throw new Error(
      error.message ?? "Unable to save the profile calendar.",
    );
  }
}
