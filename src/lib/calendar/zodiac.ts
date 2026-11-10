import { isValidIsoDate } from "../dates/values";

export const ZODIAC_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

type MonthDay = {
  month: number;
  day: number;
};

const START_DATES: Record<ZodiacSign, MonthDay> = {
  aries: { month: 3, day: 21 },
  taurus: { month: 4, day: 20 },
  gemini: { month: 5, day: 21 },
  cancer: { month: 6, day: 21 },
  leo: { month: 7, day: 23 },
  virgo: { month: 8, day: 23 },
  libra: { month: 9, day: 23 },
  scorpio: { month: 10, day: 23 },
  sagittarius: { month: 11, day: 22 },
  capricorn: { month: 12, day: 22 },
  aquarius: { month: 1, day: 20 },
  pisces: { month: 2, day: 19 },
};

const ORDERED_SIGNS: ZodiacSign[] = [
  "aquarius",
  "pisces",
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
];

function monthDayKey({ month, day }: MonthDay): number {
  return month * 100 + day;
}

export function zodiacSignForIso(iso: string): ZodiacSign | null {
  if (!isValidIsoDate(iso)) {
    return null;
  }

  const [, month, day] = iso.split("-").map(Number);
  const key = monthDayKey({ month, day });

  if (
    (month === 12 && day >= START_DATES.capricorn.day) ||
    (month === 1 && day <= 19)
  ) {
    return "capricorn";
  }

  let current: ZodiacSign = "capricorn";

  for (const sign of ORDERED_SIGNS) {
    if (key >= monthDayKey(START_DATES[sign])) {
      current = sign;
    }
  }

  return current;
}
