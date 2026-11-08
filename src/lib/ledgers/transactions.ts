import type {
  Contact,
  LedgerCurrency,
  LedgerTransaction,
  TransactionKind,
} from "./constants";

export type ContactInput = {
  name: string;
  phone: string | null;
  note: string | null;
};

export type TransactionInput = {
  kind: TransactionKind;
  amount: number;
  currency: LedgerCurrency;
  occurredOn: string;
  contactId: string | null;
  description: string | null;
};

export function sortContacts(contacts: Contact[]): Contact[] {
  return [...contacts].sort((first, second) =>
    first.name.localeCompare(second.name, undefined, {
      sensitivity: "base",
    }),
  );
}

export function compareTransactionsDesc(
  first: LedgerTransaction,
  second: LedgerTransaction,
): number {
  if (first.occurred_on !== second.occurred_on) {
    return first.occurred_on < second.occurred_on ? 1 : -1;
  }

  if (first.created_at !== second.created_at) {
    return first.created_at < second.created_at ? 1 : -1;
  }

  return first.id < second.id ? 1 : -1;
}

export function sortTransactionsDesc(
  transactions: LedgerTransaction[],
): LedgerTransaction[] {
  return [...transactions].sort(compareTransactionsDesc);
}

export type TransactionDateGroup = {
  date: string;
  transactions: LedgerTransaction[];
};

export function groupTransactionsByDate(
  transactions: LedgerTransaction[],
): TransactionDateGroup[] {
  const groups = new Map<string, LedgerTransaction[]>();

  for (const transaction of transactions) {
    const group = groups.get(transaction.occurred_on);

    if (group) {
      group.push(transaction);
    } else {
      groups.set(transaction.occurred_on, [transaction]);
    }
  }

  return Array.from(groups, ([date, groupedTransactions]) => ({
    date,
    transactions: groupedTransactions,
  }));
}
