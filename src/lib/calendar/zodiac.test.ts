import assert from "node:assert/strict";
import test from "node:test";
import { zodiacSignForIso } from "./zodiac";

test("resolves zodiac signs on month boundaries", () => {
  assert.equal(zodiacSignForIso("2026-01-19"), "capricorn");
  assert.equal(zodiacSignForIso("2026-01-20"), "aquarius");
  assert.equal(zodiacSignForIso("2026-02-18"), "aquarius");
  assert.equal(zodiacSignForIso("2026-02-19"), "pisces");
  assert.equal(zodiacSignForIso("2026-03-20"), "pisces");
  assert.equal(zodiacSignForIso("2026-03-21"), "aries");
  assert.equal(zodiacSignForIso("2026-04-19"), "aries");
  assert.equal(zodiacSignForIso("2026-04-20"), "taurus");
  assert.equal(zodiacSignForIso("2026-05-20"), "taurus");
  assert.equal(zodiacSignForIso("2026-05-21"), "gemini");
  assert.equal(zodiacSignForIso("2026-06-20"), "gemini");
  assert.equal(zodiacSignForIso("2026-06-21"), "cancer");
  assert.equal(zodiacSignForIso("2026-07-22"), "cancer");
  assert.equal(zodiacSignForIso("2026-07-23"), "leo");
  assert.equal(zodiacSignForIso("2026-08-22"), "leo");
  assert.equal(zodiacSignForIso("2026-08-23"), "virgo");
  assert.equal(zodiacSignForIso("2026-09-22"), "virgo");
  assert.equal(zodiacSignForIso("2026-09-23"), "libra");
  assert.equal(zodiacSignForIso("2026-10-22"), "libra");
  assert.equal(zodiacSignForIso("2026-10-23"), "scorpio");
  assert.equal(zodiacSignForIso("2026-11-21"), "scorpio");
  assert.equal(zodiacSignForIso("2026-11-22"), "sagittarius");
  assert.equal(zodiacSignForIso("2026-12-21"), "sagittarius");
  assert.equal(zodiacSignForIso("2026-12-22"), "capricorn");
  assert.equal(zodiacSignForIso("2026-12-31"), "capricorn");
});

test("returns null for an invalid date", () => {
  assert.equal(zodiacSignForIso("2026-02-30"), null);
  assert.equal(zodiacSignForIso("not-a-date"), null);
});
