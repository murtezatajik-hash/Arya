import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  resolveProfileCalendar,
  type ProfileCalendar,
} from "./calendar";

type ProfileCalendarRow = {
  calendar: unknown;
  hijri_offset: unknown;
};

type ProfileUser = Pick<User, "id">;

export async function loadProfileCalendar(
  supabase: SupabaseClient,
  user: ProfileUser,
  locale: string,
): Promise<ProfileCalendar> {
  const { data, error } = await supabase
    .from("profiles")
    .select("calendar, hijri_offset")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as ProfileCalendarRow | null;

  return resolveProfileCalendar(
    row?.calendar,
    row?.hijri_offset,
    locale,
  );
}
