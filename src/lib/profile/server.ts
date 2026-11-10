import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  resolveHolidaySets,
  type HolidaySetKey,
} from "../calendar/holidays";
import { isValidIsoDate } from "../dates/values";
import {
  resolveProfileCalendar,
  type ProfileCalendar,
} from "./calendar";

type ProfileRow = {
  calendar: unknown;
  hijri_offset: unknown;
  holiday_sets: unknown;
  region: unknown;
  birth_date: unknown;
};

type ProfileUser = Pick<User, "id">;

export type ProfileCalendarProfile = ProfileCalendar & {
  holidaySets: HolidaySetKey[];
  region: string | null;
  birthDate: string | null;
};

export async function loadCalendarProfile(
  supabase: SupabaseClient,
  user: ProfileUser,
  locale: string,
): Promise<ProfileCalendarProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "calendar, hijri_offset, holiday_sets, region, birth_date",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as ProfileRow | null;
  const region = typeof row?.region === "string" ? row.region : null;
  const birthDate =
    typeof row?.birth_date === "string" &&
    isValidIsoDate(row.birth_date)
      ? row.birth_date
      : null;
  const calendar = resolveProfileCalendar(
    row?.calendar,
    row?.hijri_offset,
    locale,
  );

  return {
    ...calendar,
    holidaySets: resolveHolidaySets(row?.holiday_sets, region),
    region,
    birthDate,
  };
}

export async function loadProfileCalendar(
  supabase: SupabaseClient,
  user: ProfileUser,
  locale: string,
): Promise<ProfileCalendar> {
  const profile = await loadCalendarProfile(supabase, user, locale);

  return {
    calendar: profile.calendar,
    hijriOffset: profile.hijriOffset,
  };
}
