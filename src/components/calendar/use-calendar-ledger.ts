"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isTransactionKind,
  type Contact,
  type LedgerTransaction,
} from "@/lib/ledgers/constants";
import type {
  ContactInput,
  TransactionInput,
} from "@/lib/ledgers/transactions";
import {
  sortContacts,
  sortTransactionsDesc,
} from "@/lib/ledgers/transactions";
import { createClient } from "@/lib/supabase/client";

const CONTACT_FIELDS = "id, ledger_id, name, phone, note, created_at";
const TRANSACTION_FIELDS =
  "id, ledger_id, contact_id, kind, amount, currency, occurred_on, description, created_at";

export type CalendarLedgerData = {
  contacts: Contact[];
  transactions: LedgerTransaction[];
  loading: boolean;
  error: boolean;
  reload: () => void;
  createContact: (input: ContactInput) => Promise<Contact | null>;
  createTransaction: (input: TransactionInput) => Promise<boolean>;
};

function normalizeTransaction(
  transaction: LedgerTransaction,
): LedgerTransaction {
  return {
    ...transaction,
    amount: Number(transaction.amount),
    kind: isTransactionKind(transaction.kind)
      ? transaction.kind
      : "received",
  };
}

export function useCalendarLedger(
  ledgerId: string | null,
  startIso: string,
  endIsoExclusive: string,
): CalendarLedgerData {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!ledgerId || !startIso || !endIsoExclusive) {
        setContacts([]);
        setTransactions([]);
        setLoading(false);
        setError(false);
        return;
      }

      setLoading(true);
      setError(false);
      setTransactions([]);

      try {
        const supabase = createClient();
        const [contactsResult, transactionsResult] = await Promise.all([
          supabase
            .from("contacts")
            .select(CONTACT_FIELDS)
            .eq("ledger_id", ledgerId)
            .returns<Contact[]>(),
          supabase
            .from("transactions")
            .select(TRANSACTION_FIELDS)
            .eq("ledger_id", ledgerId)
            .gte("occurred_on", startIso)
            .lt("occurred_on", endIsoExclusive)
            .order("occurred_on", { ascending: false })
            .order("created_at", { ascending: false })
            .returns<LedgerTransaction[]>(),
        ]);

        if (cancelled) {
          return;
        }

        if (contactsResult.error || transactionsResult.error) {
          setError(true);
          return;
        }

        setContacts(sortContacts(contactsResult.data ?? []));
        setTransactions(
          sortTransactionsDesc(
            (transactionsResult.data ?? []).map(normalizeTransaction),
          ),
        );
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [ledgerId, startIso, endIsoExclusive, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  async function createContact(input: ContactInput): Promise<Contact | null> {
    if (!ledgerId) {
      return null;
    }

    try {
      const supabase = createClient();
      const { data, error: insertError } = await supabase
        .from("contacts")
        .insert({
          ledger_id: ledgerId,
          name: input.name,
          phone: input.phone,
          note: input.note,
        })
        .select(CONTACT_FIELDS)
        .single();

      if (insertError || !data) {
        return null;
      }

      const contact = data as Contact;
      setContacts((current) => sortContacts([...current, contact]));

      return contact;
    } catch {
      return null;
    }
  }

  async function createTransaction(
    input: TransactionInput,
  ): Promise<boolean> {
    if (!ledgerId) {
      return false;
    }

    try {
      const supabase = createClient();
      const { data, error: insertError } = await supabase
        .from("transactions")
        .insert({
          ledger_id: ledgerId,
          contact_id: input.contactId,
          kind: input.kind,
          amount: input.amount,
          currency: input.currency,
          occurred_on: input.occurredOn,
          description: input.description,
        })
        .select(TRANSACTION_FIELDS)
        .single();

      if (insertError || !data) {
        return false;
      }

      const transaction = normalizeTransaction(
        data as LedgerTransaction,
      );
      setTransactions((current) =>
        sortTransactionsDesc([...current, transaction]),
      );

      return true;
    } catch {
      return false;
    }
  }

  return {
    contacts,
    transactions,
    loading,
    error,
    reload,
    createContact,
    createTransaction,
  };
}
