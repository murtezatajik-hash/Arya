import {
  defaultCalendarForLocale,
  isCalendarSystem,
  type CalendarSystem,
} from "@/lib/dates/calendar";

export function resolveProfileCalendar(
  value: unknown,
  locale: string,
): CalendarSystem {
  return isCalendarSystem(value) ? value : defaultCalendarForLocale(locale);
}
