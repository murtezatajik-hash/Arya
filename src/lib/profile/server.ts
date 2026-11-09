import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  defaultCalendarForLocale,
  type CalendarSystem,
} from "@/lib/dates/calendar";
import { resolveProfileCalendar } from "./calendar";

type ProfileCalendarRow = {
  calendar: unknown;
};

type ProfileUser = Pick<User, "id" | "user_metadata">;

export async function loadProfileCalendar(
  supabase: SupabaseClient,
  user: ProfileUser,
  locale: string,
): Promise<CalendarSystem> {
  const { data, error } = await supabase
    .from("profiles")
    .select("calendar")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const storedCalendar = (data as ProfileCalendarRow | null)?.calendar;
  const hasExplicitChoice = user.user_metadata?.calendar_explicit === true;

  // New profiles get a database default of "gregorian". Until the user saves
  // an explicit choice, follow the language default instead. This lets a
  // Persian account start on the Jalali calendar without changing the schema
  // and still lets the user switch back to Gregorian from settings.
  if (!hasExplicitChoice && !isNonDefaultCalendar(storedCalendar)) {
    return defaultCalendarForLocale(locale);
  }

  return resolveProfileCalendar(storedCalendar, locale);
}

function isNonDefaultCalendar(value: unknown): boolean {
  return value === "jalali";
}
