import assert from "node:assert/strict";
import test from "node:test";
import { getCalendarMonthGrid, weekStartForCalendar } from "./month-grid";

test("builds a Jalali month grid starting on Saturday", () => {
  const grid = getCalendarMonthGrid("jalali", 1405, 1, 0, 6);

  assert.equal(grid.firstIso, "2026-03-21");
  assert.equal(grid.days, 31);
  assert.equal(grid.cells.length, 42);
  assert.equal(grid.cells[0]?.iso, "2026-03-21");
  assert.equal(grid.cells[0]?.inMonth, true);
  assert.equal(grid.cells[30]?.iso, "2026-04-20");
  assert.equal(grid.cells[30]?.inMonth, true);
  assert.equal(grid.cells[31]?.inMonth, false);
});

test("pads a Gregorian month according to the locale week start", () => {
  const sundayGrid = getCalendarMonthGrid("gregorian", 2026, 9, 0, 0);
  const saturdayGrid = getCalendarMonthGrid("gregorian", 2026, 9, 0, 6);

  assert.equal(sundayGrid.firstIso, "2026-09-01");
  assert.equal(sundayGrid.cells[0]?.iso, "2026-08-30");
  assert.equal(saturdayGrid.cells[0]?.iso, "2026-08-29");
});

test("uses Saturday for Jalali and locale-aware weeks for other calendars", () => {
  assert.equal(weekStartForCalendar("jalali", "en"), 6);
  assert.equal(weekStartForCalendar("gregorian", "fa"), 6);
  assert.equal(weekStartForCalendar("gregorian", "en"), 0);
  assert.equal(weekStartForCalendar("hijri", "fa"), 6);
  assert.equal(weekStartForCalendar("hijri", "en"), 0);
});
