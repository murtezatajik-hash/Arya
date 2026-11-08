import {
  isLedgerCurrency,
  type LedgerCurrency,
} from "@/lib/ledgers/constants";

export const CURRENCY_EXPONENTS: Record<LedgerCurrency, 0 | 2> = {
  TJS: 2,
  IRR: 0,
  AFN: 0,
  RUB: 2,
  USD: 2,
  EUR: 2,
};

export type AmountParseError =
  | "required"
  | "invalid"
  | "positive"
  | "noFraction"
  | "tooManyFractions";

export type AmountParseResult =
  | { ok: true; amount: number }
  | { ok: false; error: AmountParseError };

const integerFormatters = new Map<string, Intl.NumberFormat>();
const fractionFormatters = new Map<string, Intl.NumberFormat>();
const decimalSeparators = new Map<string, string>();
const minusSigns = new Map<string, string>();

function normalizeDigit(character: string): string {
  const code = character.charCodeAt(0);

  if (code >= 0x06f0 && code <= 0x06f9) {
    return String(code - 0x06f0);
  }

  if (code >= 0x0660 && code <= 0x0669) {
    return String(code - 0x0660);
  }

  return character;
}

export function normalizeAmountInput(value: string): string {
  return value
    .replace(/[\u06F0-\u06F9\u0660-\u0669]/g, normalizeDigit)
    .replace(/\u066B/g, ".")
    .replace(/\u2212/g, "-")
    .replace(/[\u066C,\s\u00A0\u202F]/g, "");
}

export function getCurrencyExponent(currency: string): 0 | 2 {
  return isLedgerCurrency(currency) ? CURRENCY_EXPONENTS[currency] : 0;
}

type AmountParseOptions = {
  allowZero: boolean;
  allowNegative: boolean;
};

function parseAmount(
  value: string,
  currency: string,
  options: AmountParseOptions,
): AmountParseResult {
  let normalized = normalizeAmountInput(value);

  if (!normalized) {
    return { ok: false, error: "required" };
  }

  let sign: 1 | -1 = 1;

  if (normalized.startsWith("-")) {
    if (!options.allowNegative) {
      return { ok: false, error: "positive" };
    }

    sign = -1;
    normalized = normalized.slice(1);
  } else if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }

  if (!normalized || !/^\d+(?:\.\d+)?$/.test(normalized)) {
    return { ok: false, error: "invalid" };
  }

  const [wholePart, fractionPart = ""] = normalized.split(".");
  const exponent = getCurrencyExponent(currency);

  if (exponent === 0 && fractionPart.length > 0) {
    return { ok: false, error: "noFraction" };
  }

  if (fractionPart.length > exponent) {
    return { ok: false, error: "tooManyFractions" };
  }

  const digits =
    exponent > 0
      ? `${wholePart}${fractionPart.padEnd(exponent, "0")}`
      : wholePart;
  const absolute = Number(digits);

  if (!Number.isSafeInteger(absolute)) {
    return { ok: false, error: "invalid" };
  }

  const amount = sign * absolute;

  if (amount === 0 && !options.allowZero) {
    return { ok: false, error: "positive" };
  }

  return { ok: true, amount: amount === 0 ? 0 : amount };
}

export function parseAmountToMinor(
  value: string,
  currency: string,
): AmountParseResult {
  return parseAmount(value, currency, {
    allowZero: false,
    allowNegative: false,
  });
}

export function parseSignedAmountToMinor(
  value: string,
  currency: string,
): AmountParseResult {
  return parseAmount(value, currency, {
    allowZero: true,
    allowNegative: true,
  });
}

function getIntegerFormatter(locale: string): Intl.NumberFormat {
  let formatter = integerFormatters.get(locale);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      useGrouping: true,
    });
    integerFormatters.set(locale, formatter);
  }

  return formatter;
}

function getFractionFormatter(
  locale: string,
  exponent: number,
): Intl.NumberFormat {
  const key = `${locale}:${exponent}`;
  let formatter = fractionFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      minimumIntegerDigits: exponent,
      useGrouping: false,
    });
    fractionFormatters.set(key, formatter);
  }

  return formatter;
}

function getDecimalSeparator(locale: string): string {
  let separator = decimalSeparators.get(locale);

  if (separator === undefined) {
    separator =
      new Intl.NumberFormat(locale)
        .formatToParts(1.1)
        .find((part) => part.type === "decimal")?.value ?? ".";
    decimalSeparators.set(locale, separator);
  }

  return separator;
}

function getMinusSign(locale: string): string {
  let sign = minusSigns.get(locale);

  if (sign === undefined) {
    sign =
      new Intl.NumberFormat(locale)
        .formatToParts(-1)
        .find((part) => part.type === "minusSign")?.value ?? "-";
    minusSigns.set(locale, sign);
  }

  return sign;
}

export function formatMinorAmount(
  amount: number,
  currency: string,
  locale: string,
): string {
  const exponent = getCurrencyExponent(currency);
  const sign = amount < 0 ? getMinusSign(locale) : "";
  const absolute = Math.abs(amount);
  const factor = 10 ** exponent;
  const wholePart = Math.trunc(absolute / factor);
  const fractionPart = absolute % factor;
  const wholeText = getIntegerFormatter(locale).format(wholePart);

  if (exponent === 0) {
    return `${sign}${wholeText}`;
  }

  const fractionText = getFractionFormatter(locale, exponent).format(
    fractionPart,
  );

  return `${sign}${wholeText}${getDecimalSeparator(locale)}${fractionText}`;
}

export function formatMoney(
  amount: number,
  currency: string,
  locale: string,
): string {
  return `${formatMinorAmount(amount, currency, locale)} ${currency}`;
}

export function formatMinorForInput(
  amount: number,
  currency: string,
): string {
  const exponent = getCurrencyExponent(currency);
  const sign = amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  const factor = 10 ** exponent;
  const wholePart = Math.trunc(absolute / factor);
  const fractionPart = absolute % factor;

  if (exponent === 0) {
    return `${sign}${wholePart}`;
  }

  return `${sign}${wholePart}.${String(fractionPart).padStart(exponent, "0")}`;
}
