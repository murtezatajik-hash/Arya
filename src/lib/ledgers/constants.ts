export const LEDGER_CURRENCIES = [
  "TJS",
  "IRR",
  "AFN",
  "RUB",
  "USD",
  "EUR",
] as const;

export type LedgerCurrency = (typeof LEDGER_CURRENCIES)[number];

export type Ledger = {
  id: string;
  name: string;
  default_currency: string;
  created_at: string;
};

export const TRANSACTION_KINDS = [
  "received",
  "paid",
  "lent",
  "borrowed",
] as const;

export type TransactionKind = (typeof TRANSACTION_KINDS)[number];

export type Contact = {
  id: string;
  ledger_id: string;
  name: string;
  phone: string | null;
  note: string | null;
  created_at: string;
};

export type LedgerTransaction = {
  id: string;
  ledger_id: string;
  contact_id: string | null;
  kind: TransactionKind;
  amount: number;
  currency: string;
  occurred_on: string;
  description: string | null;
  created_at: string;
};

export function isLedgerCurrency(value: string): value is LedgerCurrency {
  return (LEDGER_CURRENCIES as readonly string[]).includes(value);
}

export function isTransactionKind(value: string): value is TransactionKind {
  return (TRANSACTION_KINDS as readonly string[]).includes(value);
}

type DataError = {
  message?: string | null;
  details?: string | null;
  hint?: string | null;
  code?: string | null;
};

export function isLedgerLimitError(error: DataError): boolean {
  return [error.message, error.details, error.hint].some((part) =>
    part?.includes("ledger_limit_reached"),
  );
}
