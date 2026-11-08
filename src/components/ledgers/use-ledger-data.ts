"use client";

import { useCallback, useEffect, useState } from "react";
import type { CurrencyTotals } from "@/lib/ledgers/balances";
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
const OPENING_FIELDS = "ledger_id, currency, amount";

type LedgerOpening = {
  ledger_id: string;
  currency: string;
  amount: number;
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

export type LedgerData = {
  contacts: Contact[];
  transactions: LedgerTransaction[];
  openings: CurrencyTotals;
  loading: boolean;
  error: boolean;
  reload: () => void;
  createContact: (input: ContactInput) => Promise<Contact | null>;
  updateContact: (id: string, input: ContactInput) => Promise<boolean>;
  deleteContact: (id: string) => Promise<boolean>;
  createTransaction: (input: TransactionInput) => Promise<boolean>;
  updateTransaction: (
    id: string,
    input: TransactionInput,
  ) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  saveOpenings: (amounts: CurrencyTotals) => Promise<boolean>;
};

export function useLedgerData(ledgerId: string): LedgerData {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [openings, setOpenings] = useState<CurrencyTotals>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const supabase = createClient();
        const [contactsResult, transactionsResult, openingsResult] =
          await Promise.all([
            supabase
              .from("contacts")
              .select(CONTACT_FIELDS)
              .eq("ledger_id", ledgerId)
              .returns<Contact[]>(),
            supabase
              .from("transactions")
              .select(TRANSACTION_FIELDS)
              .eq("ledger_id", ledgerId)
              .order("occurred_on", { ascending: false })
              .order("created_at", { ascending: false })
              .returns<LedgerTransaction[]>(),
            supabase
              .from("ledger_openings")
              .select(OPENING_FIELDS)
              .eq("ledger_id", ledgerId)
              .returns<LedgerOpening[]>(),
          ]);

        if (cancelled) {
          return;
        }

        if (
          contactsResult.error ||
          transactionsResult.error ||
          openingsResult.error
        ) {
          setError(true);
          return;
        }

        const nextOpenings: CurrencyTotals = {};

        for (const opening of openingsResult.data ?? []) {
          nextOpenings[opening.currency] = Number(opening.amount);
        }

        setContacts(sortContacts(contactsResult.data ?? []));
        setTransactions(
          sortTransactionsDesc(
            (transactionsResult.data ?? []).map(normalizeTransaction),
          ),
        );
        setOpenings(nextOpenings);
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
  }, [ledgerId, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  async function createContact(input: ContactInput): Promise<Contact | null> {
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

  async function updateContact(
    id: string,
    input: ContactInput,
  ): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data, error: updateError } = await supabase
        .from("contacts")
        .update({
          name: input.name,
          phone: input.phone,
          note: input.note,
        })
        .eq("id", id)
        .eq("ledger_id", ledgerId)
        .select(CONTACT_FIELDS)
        .single();

      if (updateError || !data) {
        return false;
      }

      const contact = data as Contact;
      setContacts((current) =>
        sortContacts(
          current.map((item) => (item.id === id ? contact : item)),
        ),
      );

      return true;
    } catch {
      return false;
    }
  }

  async function deleteContact(id: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error: unlinkError } = await supabase
        .from("transactions")
        .update({ contact_id: null })
        .eq("ledger_id", ledgerId)
        .eq("contact_id", id);

      if (unlinkError) {
        return false;
      }

      const { data, error: deleteError } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id)
        .eq("ledger_id", ledgerId)
        .select("id");

      if (deleteError || !data || data.length === 0) {
        return false;
      }

      setContacts((current) => current.filter((contact) => contact.id !== id));
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.contact_id === id
            ? { ...transaction, contact_id: null }
            : transaction,
        ),
      );

      return true;
    } catch {
      return false;
    }
  }

  async function createTransaction(
    input: TransactionInput,
  ): Promise<boolean> {
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

  async function updateTransaction(
    id: string,
    input: TransactionInput,
  ): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data, error: updateError } = await supabase
        .from("transactions")
        .update({
          contact_id: input.contactId,
          kind: input.kind,
          amount: input.amount,
          currency: input.currency,
          occurred_on: input.occurredOn,
          description: input.description,
        })
        .eq("id", id)
        .eq("ledger_id", ledgerId)
        .select(TRANSACTION_FIELDS)
        .single();

      if (updateError || !data) {
        return false;
      }

      const transaction = normalizeTransaction(
        data as LedgerTransaction,
      );
      setTransactions((current) =>
        sortTransactionsDesc(
          current.map((item) => (item.id === id ? transaction : item)),
        ),
      );

      return true;
    } catch {
      return false;
    }
  }

  async function deleteTransaction(id: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data, error: deleteError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("ledger_id", ledgerId)
        .select("id");

      if (deleteError || !data || data.length === 0) {
        return false;
      }

      setTransactions((current) =>
        current.filter((transaction) => transaction.id !== id),
      );

      return true;
    } catch {
      return false;
    }
  }

  async function saveOpenings(amounts: CurrencyTotals): Promise<boolean> {
    const rows = Object.entries(amounts).map(([currency, amount]) => ({
      ledger_id: ledgerId,
      currency,
      amount,
    }));

    if (rows.length === 0) {
      return true;
    }

    try {
      const supabase = createClient();
      const { data, error: upsertError } = await supabase
        .from("ledger_openings")
        .upsert(rows, { onConflict: "ledger_id,currency" })
        .select(OPENING_FIELDS);

      if (upsertError || !data) {
        return false;
      }

      setOpenings((current) => {
        const next = { ...current };

        for (const opening of data as LedgerOpening[]) {
          next[opening.currency] = Number(opening.amount);
        }

        return next;
      });

      return true;
    } catch {
      return false;
    }
  }

  return {
    contacts,
    transactions,
    openings,
    loading,
    error,
    reload,
    createContact,
    updateContact,
    deleteContact,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    saveOpenings,
  };
}
