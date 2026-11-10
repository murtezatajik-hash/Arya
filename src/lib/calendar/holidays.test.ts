import assert from "node:assert/strict";
import test from "node:test";
import {
  addIsoDays,
  isoFromCalendarDate,
} from "../dates/calendar";
import {
  defaultHolidaySets,
  holidayCategory,
  holidayMatchesIso,
  holidaysForIso,
  resolveHolidaySets,
  safeExternalUrl,
  type HolidayRow,
} from "./holidays";

function holiday(
  overrides: Partial<HolidayRow> & Pick<HolidayRow, "set_key" | "calendar" | "month" | "day" | "title_fa" | "title_en">,
): HolidayRow {
  return {
    id: `${overrides.set_key}-${overrides.calendar}-${overrides.month}-${overrides.day}`,
    description_fa: null,
    description_en: null,
    is_official: false,
    source_url: null,
    verified: false,
    ...overrides,
  };
}

const NOWRUZ = holiday({
  set_key: "aryan",
  calendar: "jalali",
  month: 1,
  day: 1,
  title_fa: "نوروز",
  title_en: "Nowruz",
});

const TAJIKISTAN_INDEPENDENCE = holiday({
  set_key: "tajikistan",
  calendar: "gregorian",
  month: 9,
  day: 9,
  title_fa: "روز استقلال تاجیکستان",
  title_en: "Independence Day of Tajikistan",
  is_official: true,
});

const ASHURA = holiday({
  set_key: "shia",
  calendar: "hijri",
  month: 1,
  day: 10,
  title_fa: "عاشورا",
  title_en: "Ashura",
});

test("matches 1 Farvardin 1405 as Nowruz", () => {
  assert.equal(holidayMatchesIso(NOWRUZ, "2026-03-21", 0), true);
  assert.equal(holidayMatchesIso(NOWRUZ, "2026-03-22", 0), false);
});

test("matches 9 September 2026 as Tajikistan Independence Day", () => {
  assert.equal(
    holidayMatchesIso(TAJIKISTAN_INDEPENDENCE, "2026-09-09", 0),
    true,
  );
  assert.equal(
    holidayMatchesIso(TAJIKISTAN_INDEPENDENCE, "2026-09-10", 0),
    false,
  );
});

test("applies the Hijri offset when matching a lunar holiday", () => {
  const zeroOffsetIso = isoFromCalendarDate(
    { year: 1448, month: 1, day: 10 },
    "hijri",
    0,
  );

  assert.ok(zeroOffsetIso);
  assert.equal(holidayMatchesIso(ASHURA, zeroOffsetIso, 0), true);
  assert.equal(holidayMatchesIso(ASHURA, zeroOffsetIso, 1), false);
  assert.equal(holidayMatchesIso(ASHURA, addIsoDays(zeroOffsetIso, -1), 1), true);
});

test("does not show holidays from a disabled set", () => {
  const holidays = [NOWRUZ, TAJIKISTAN_INDEPENDENCE];

  assert.deepEqual(
    holidaysForIso(holidays, "2026-03-21", ["aryan"]).map(
      (item) => item.set_key,
    ),
    ["aryan"],
  );
  assert.deepEqual(
    holidaysForIso(holidays, "2026-03-21", ["tajikistan"]),
    [],
  );
});

test("resolves holiday set defaults from the profile region", () => {
  assert.deepEqual(defaultHolidaySets("Iran"), [
    "aryan",
    "iran",
    "islamic",
    "shia",
  ]);
  assert.deepEqual(defaultHolidaySets("TJ"), [
    "aryan",
    "tajikistan",
    "islamic",
    "sunni",
  ]);
  assert.deepEqual(defaultHolidaySets(null), ["aryan", "islamic"]);
  assert.deepEqual(resolveHolidaySets([], "Iran"), []);
  assert.deepEqual(
    resolveHolidaySets(["iran", "unknown", "aryan", "iran"], "TJ"),
    ["aryan", "iran"],
  );
});

test("classifies holidays into cultural, official, and religious", () => {
  assert.equal(holidayCategory(NOWRUZ), "cultural");
  assert.equal(holidayCategory(TAJIKISTAN_INDEPENDENCE), "official");
  assert.equal(holidayCategory(ASHURA), "religious");
  assert.equal(
    holidayCategory({
      set_key: "aryan",
      is_official: true,
    }),
    "cultural",
  );
});

test("only accepts http and https source links", () => {
  assert.equal(
    safeExternalUrl("https://example.com/holiday"),
    "https://example.com/holiday",
  );
  assert.equal(safeExternalUrl("javascript:alert(1)"), null);
  assert.equal(safeExternalUrl(null), null);
});
