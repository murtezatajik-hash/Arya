import {
  addIsoDays,
  calendarDateFromIso,
  getCalendarMonthInfo,
  type CalendarDate,
  type CalendarSystem,
} from "../dates/calendar";

export type CalendarMonthGridCell = {
  iso: string;
  date: CalendarDate | null;
  inMonth: boolean;
};

export type CalendarMonthGrid = {
  startIso: string;
  endIsoExclusive: string;
  cells: CalendarMonthGridCell[];
  firstIso: string | null;
  days: number;
};

const CELL_COUNT = 42;

export function getCalendarMonthGrid(
  calendar: CalendarSystem,
  year: number,
  month: number,
  hijriOffset: number = 0,
  weekStart: number = 6,
): CalendarMonthGrid {
  const info = getCalendarMonthInfo(
    calendar,
    year,
    month,
    hijriOffset,
  );
  const safeWeekStart = ((Math.trunc(weekStart) % 7) + 7) % 7;

  if (!info.firstIso || info.days === 0) {
    return {
      startIso: "",
      endIsoExclusive: "",
      cells: [],
      firstIso: null,
      days: 0,
    };
  }

  const leading = (info.firstWeekday - safeWeekStart + 7) % 7;
  const startIso = addIsoDays(info.firstIso, -leading);
  const cells = Array.from({ length: CELL_COUNT }, (_, index) => {
    const iso = addIsoDays(startIso, index);
    const date = calendarDateFromIso(iso, calendar, hijriOffset);

    return {
      iso,
      date,
      inMonth:
        date?.year === year &&
        date.month === month &&
        date.day >= 1 &&
        date.day <= info.days,
    };
  });

  return {
    startIso,
    endIsoExclusive: addIsoDays(startIso, CELL_COUNT),
    cells,
    firstIso: info.firstIso,
    days: info.days,
  };
}

export function weekStartForCalendar(
  calendar: CalendarSystem,
  locale: string,
): number {
  if (calendar === "jalali") {
    return 6;
  }

  return locale.startsWith("fa") ? 6 : 0;
}
