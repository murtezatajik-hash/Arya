import assert from "node:assert/strict";
import test from "node:test";
import {
  addIsoDays,
  clampHijriOffset,
  getCalendarMonthInfo,
  getCalendarPeriod,
  isIsoInRange,
  isoFromCalendarDate,
  calendarDateFromIso,
  parseCalendarDateInput,
} from "./calendar";

test("converts 1 Farvardin 1405 to and from Gregorian", () => {
  assert.equal(
    isoFromCalendarDate({ year: 1405, month: 1, day: 1 }, "jalali"),
    "2026-03-21",
  );
  assert.deepEqual(calendarDateFromIso("2026-03-21", "jalali"), {
    year: 1405,
    month: 1,
    day: 1,
  });
});

test("supports the end of Esfand in a leap year", () => {
  assert.equal(
    isoFromCalendarDate({ year: 1403, month: 12, day: 30 }, "jalali"),
    "2025-03-20",
  );
  assert.equal(getCalendarMonthInfo("jalali", 1403, 12).days, 30);

  assert.equal(
    isoFromCalendarDate({ year: 1404, month: 12, day: 30 }, "jalali"),
    null,
  );
  assert.equal(getCalendarMonthInfo("jalali", 1404, 12).days, 29);
});

test("calculates Jalali month and year boundaries on local dates", () => {
  const period = getCalendarPeriod(
    "jalali",
    new Date(2026, 2, 21, 0, 30),
  );

  assert.equal(period.year, 1405);
  assert.equal(period.month, 1);
  assert.equal(period.monthStartIso, "2026-03-21");
  assert.equal(period.monthEndIso, "2026-04-21");
  assert.equal(period.yearStartIso, "2026-03-21");

  assert.equal(
    isIsoInRange("2026-03-21", period.monthStartIso, period.monthEndIso),
    true,
  );
  assert.equal(
    isIsoInRange("2026-04-20", period.monthStartIso, period.monthEndIso),
    true,
  );
  assert.equal(
    isIsoInRange("2026-04-21", period.monthStartIso, period.monthEndIso),
    false,
  );
});

test("calculates Gregorian month and year boundaries", () => {
  const period = getCalendarPeriod(
    "gregorian",
    new Date(2026, 0, 15, 12),
  );

  assert.equal(period.year, 2026);
  assert.equal(period.month, 1);
  assert.equal(period.monthStartIso, "2026-01-01");
  assert.equal(period.monthEndIso, "2026-02-01");
  assert.equal(period.yearStartIso, "2026-01-01");
  assert.equal(period.yearEndIso, "2027-01-01");
});

test("parses Persian digits and common separators", () => {
  assert.equal(
    parseCalendarDateInput("۱۴۰۵/۰۱/۰۱", "jalali"),
    "2026-03-21",
  );
  assert.equal(
    parseCalendarDateInput("۱۴۰۵ ۱ ۱", "jalali"),
    "2026-03-21",
  );
  assert.equal(
    parseCalendarDateInput("۱۴۰۵۰۱۰۱", "jalali"),
    "2026-03-21",
  );
  assert.equal(
    parseCalendarDateInput("2026-03-21", "gregorian"),
    "2026-03-21",
  );
  assert.equal(parseCalendarDateInput("1404/12/30", "jalali"), null);
});

test("handles Gregorian leap days", () => {
  assert.equal(getCalendarMonthInfo("gregorian", 2024, 2).days, 29);
  assert.equal(getCalendarMonthInfo("gregorian", 2025, 2).days, 28);
  assert.equal(
    isoFromCalendarDate({ year: 2024, month: 2, day: 29 }, "gregorian"),
    "2024-02-29",
  );
  assert.equal(
    isoFromCalendarDate({ year: 2025, month: 2, day: 29 }, "gregorian"),
    null,
  );
});

test("converts Hijri dates using the Umm al-Qura calendar", () => {
  assert.deepEqual(calendarDateFromIso("2026-11-09", "hijri"), {
    year: 1448,
    month: 5,
    day: 29,
  });
  assert.equal(
    isoFromCalendarDate({ year: 1448, month: 5, day: 29 }, "hijri"),
    "2026-11-09",
  );
  assert.equal(
    isoFromCalendarDate({ year: 1448, month: 5, day: 1 }, "hijri"),
    "2026-10-12",
  );
  assert.equal(
    isoFromCalendarDate({ year: 1448, month: 6, day: 1 }, "hijri"),
    "2026-11-11",
  );
  assert.equal(getCalendarMonthInfo("hijri", 1448, 5).days, 30);
  assert.equal(
    isoFromCalendarDate({ year: 1447, month: 12, day: 30 }, "hijri"),
    null,
  );
});

test("applies the Hijri day offset in both directions", () => {
  assert.deepEqual(calendarDateFromIso("2026-11-09", "hijri", 1), {
    year: 1448,
    month: 5,
    day: 30,
  });
  assert.equal(
    isoFromCalendarDate({ year: 1448, month: 5, day: 30 }, "hijri", 1),
    "2026-11-09",
  );
  assert.deepEqual(calendarDateFromIso("2026-11-09", "hijri", -1), {
    year: 1448,
    month: 5,
    day: 28,
  });
  assert.equal(
    isoFromCalendarDate({ year: 1448, month: 5, day: 29 }, "hijri", -1),
    "2026-11-10",
  );
  assert.equal(clampHijriOffset(-9), -2);
  assert.equal(clampHijriOffset(9), 2);
  assert.equal(clampHijriOffset(1.8), 1);
});

test("calculates Hijri month and year boundaries with a local offset", () => {
  const period = getCalendarPeriod(
    "hijri",
    new Date(2026, 10, 9, 0, 30),
    1,
  );

  assert.equal(period.year, 1448);
  assert.equal(period.month, 5);
  assert.equal(period.monthStartIso, "2026-10-11");
  assert.equal(period.monthEndIso, "2026-11-10");
  assert.equal(period.yearStartIso, "2026-06-15");
  assert.equal(period.yearEndIso, "2027-06-05");
  assert.equal(
    isIsoInRange("2026-11-09", period.monthStartIso, period.monthEndIso),
    true,
  );
  assert.equal(
    isIsoInRange("2026-11-10", period.monthStartIso, period.monthEndIso),
    false,
  );
});

test("handles Hijri input and month navigation safely", () => {
  assert.equal(
    parseCalendarDateInput("۱۴۴۸/۰۵/۲۹", "hijri"),
    "2026-11-09",
  );
  assert.equal(
    parseCalendarDateInput("1448/05/29", "hijri", 1),
    "2026-11-08",
  );
  assert.equal(parseCalendarDateInput("1447/12/30", "hijri"), null);
  assert.equal(addIsoDays("2026-10-11", 1), "2026-10-12");
  assert.equal(getCalendarMonthInfo("hijri", 1448, 5, 1).firstIso, "2026-10-11");
});
