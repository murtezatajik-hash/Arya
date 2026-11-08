import {
  isLedgerCurrency,
  LEDGER_CURRENCIES,
  type Contact,
  type LedgerTransaction,
  type TransactionKind,
} from "./constants";

export type CurrencyTotals = Record<string, number>;

export function balanceSign(kind: TransactionKind): 1 | -1 {
  return kind === "lent" || kind === "paid" ? 1 : -1;
}

function addAmount(
  totals: CurrencyTotals,
  currency: string,
  amount: number,
): void {
  totals[currency] = (totals[currency] ?? 0) + amount;
}

export function ledgerBalanceSign(kind: TransactionKind): 1 | -1 {
  return kind === "received" || kind === "borrowed" ? 1 : -1;
}

export function calculateLedgerBalances(
  transactions: LedgerTransaction[],
  openings: CurrencyTotals = {},
): CurrencyTotals {
  const totals: CurrencyTotals = { ...openings };

  for (const transaction of transactions) {
    addAmount(
      totals,
      transaction.currency,
      ledgerBalanceSign(transaction.kind) * transaction.amount,
    );
  }

  return totals;
}

export function collectLedgerCurrencies(
  transactions: LedgerTransaction[],
  openings: CurrencyTotals,
): Set<string> {
  const currencies = new Set<string>();

  for (const transaction of transactions) {
    currencies.add(transaction.currency);
  }

  for (const [currency, amount] of Object.entries(openings)) {
    if (amount !== 0) {
      currencies.add(currency);
    }
  }

  return currencies;
}

export function calculateContactBalances(
  transactions: LedgerTransaction[],
  contactId: string,
): CurrencyTotals {
  const totals: CurrencyTotals = {};

  for (const transaction of transactions) {
    if (transaction.contact_id !== contactId) {
      continue;
    }

    addAmount(
      totals,
      transaction.currency,
      balanceSign(transaction.kind) * transaction.amount,
    );
  }

  return totals;
}

export function calculateContactBalanceMap(
  transactions: LedgerTransaction[],
  contacts: Contact[],
): Map<string, CurrencyTotals> {
  const balances = new Map<string, CurrencyTotals>();
  const contactIds = new Set(contacts.map((contact) => contact.id));

  for (const transaction of transactions) {
    if (!transaction.contact_id || !contactIds.has(transaction.contact_id)) {
      continue;
    }

    const contactBalance = balances.get(transaction.contact_id) ?? {};
    addAmount(
      contactBalance,
      transaction.currency,
      balanceSign(transaction.kind) * transaction.amount,
    );
    balances.set(transaction.contact_id, contactBalance);
  }

  return balances;
}

export function sumTransactions(
  transactions: LedgerTransaction[],
  predicate: (transaction: LedgerTransaction) => boolean,
): CurrencyTotals {
  const totals: CurrencyTotals = {};

  for (const transaction of transactions) {
    if (!predicate(transaction)) {
      continue;
    }

    addAmount(totals, transaction.currency, transaction.amount);
  }

  return totals;
}

export function calculateContactTotals(
  balances: Map<string, CurrencyTotals>,
): { receivables: CurrencyTotals; payables: CurrencyTotals } {
  const receivables: CurrencyTotals = {};
  const payables: CurrencyTotals = {};

  for (const contactBalance of balances.values()) {
    for (const [currency, amount] of Object.entries(contactBalance)) {
      if (amount > 0) {
        addAmount(receivables, currency, amount);
      } else if (amount < 0) {
        addAmount(payables, currency, Math.abs(amount));
      }
    }
  }

  return { receivables, payables };
}

export function orderCurrencies(currencies: Iterable<string>): string[] {
  const values = new Set(currencies);
  const known = LEDGER_CURRENCIES.filter((currency) => values.has(currency));
  const unknown = Array.from(values)
    .filter((currency) => !isLedgerCurrency(currency))
    .sort();

  return [...known, ...unknown];
}
