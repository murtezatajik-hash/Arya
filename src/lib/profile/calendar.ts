import {
  clampHijriOffset,
  defaultCalendarForLocale,
  isCalendarSystem,
  type CalendarSystem,
  type HijriOffset,
} from "../dates/calendar";

export type ProfileCalendar = {
  calendar: CalendarSystem;
  hijriOffset: HijriOffset;
};

export function resolveProfileCalendar(
  value: unknown,
  hijriOffset: unknown,
  locale: string,
): ProfileCalendar {
  return {
    calendar: isCalendarSystem(value)
      ? value
      : defaultCalendarForLocale(locale),
    hijriOffset: clampHijriOffset(hijriOffset),
  };
}
