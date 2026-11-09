"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { TransactionForm } from "@/components/ledgers/TransactionForm";
import { TransactionRow } from "@/components/ledgers/TransactionRow";
import {
  calendarDateFromIso,
  type CalendarSystem,
} from "@/lib/dates/calendar";
import {
  formatDisplayDate,
  formatMonthName,
  formatYear,
  type CalendarMonthNames,
} from "@/lib/dates/display";
import { todayIso } from "@/lib/dates/values";
import {
  TRANSACTION_KINDS,
  type Contact,
  type LedgerCurrency,
  type LedgerTransaction,
  type TransactionKind,
} from "@/lib/ledgers/constants";
import type {
  ContactInput,
  TransactionInput,
} from "@/lib/ledgers/transactions";
import { groupTransactionsByDate } from "@/lib/ledgers/transactions";

type RecordsTabProps = {
  calendar: CalendarSystem;
  hijriOffset: number;
  defaultCurrency: LedgerCurrency;
  contacts: Contact[];
  transactions: LedgerTransaction[];
  createContact: (input: ContactInput) => Promise<Contact | null>;
  createTransaction: (input: TransactionInput) => Promise<boolean>;
  updateTransaction: (
    id: string,
    input: TransactionInput,
  ) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
};

type FormState =
  | { mode: "create" }
  | { mode: "edit"; transaction: LedgerTransaction }
  | null;

type Filters = {
  month: string;
  year: string;
  kind: "" | TransactionKind;
  contact: string;
  search: string;
};

const emptyFilters: Filters = {
  month: "",
  year: "",
  kind: "",
  contact: "",
  search: "",
};

export function RecordsTab({
  calendar,
  hijriOffset,
  defaultCurrency,
  contacts,
  transactions,
  createContact,
  createTransaction,
  updateTransaction,
  deleteTransaction,
}: RecordsTabProps) {
  const t = useTranslations("ledgers.records");
  const common = useTranslations("ledgers.common");
  const kinds = useTranslations("ledgers.kinds");
  const calendarMessages = useTranslations("calendar");
  const locale = useLocale();
  const monthNames = calendarMessages.raw(
    "months",
  ) as CalendarMonthNames;
  const [formState, setFormState] = useState<FormState>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const deferredSearch = useDeferredValue(filters.search);

  const contactsById = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact])),
    [contacts],
  );

  const years = useMemo(() => {
    const values = new Set<string>();

    for (const transaction of transactions) {
      const date = calendarDateFromIso(
        transaction.occurred_on,
        calendar,
        hijriOffset,
      );

      if (date) {
        values.add(String(date.year));
      }
    }

    const currentYear = calendarDateFromIso(
      todayIso(),
      calendar,
      hijriOffset,
    )?.year;

    if (currentYear) {
      values.add(String(currentYear));
    }

    return Array.from(values).sort(
      (first, second) => Number(second) - Number(first),
    );
  }, [transactions, calendar, hijriOffset]);

  const needle = deferredSearch.trim().toLocaleLowerCase(locale);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (
        filters.kind &&
        transaction.kind !== filters.kind
      ) {
        return false;
      }

      if (filters.contact === "none" && transaction.contact_id) {
        return false;
      }

      if (
        filters.contact &&
        filters.contact !== "none" &&
        transaction.contact_id !== filters.contact
      ) {
        return false;
      }

      if (filters.year || filters.month) {
        const date = calendarDateFromIso(
          transaction.occurred_on,
          calendar,
          hijriOffset,
        );

        if (!date) {
          return false;
        }

        if (filters.year && String(date.year) !== filters.year) {
          return false;
        }

        if (
          filters.month &&
          String(date.month).padStart(2, "0") !== filters.month
        ) {
          return false;
        }
      }

      if (
        needle &&
        !(transaction.description ?? "")
          .toLocaleLowerCase(locale)
          .includes(needle)
      ) {
        return false;
      }

      return true;
    });
  }, [
    transactions,
    filters,
    needle,
    locale,
    calendar,
    hijriOffset,
  ]);

  const groups = useMemo(
    () => groupTransactionsByDate(filteredTransactions),
    [filteredTransactions],
  );

  const hasFilters = Boolean(
    filters.month ||
      filters.year ||
      filters.kind ||
      filters.contact ||
      filters.search.trim(),
  );

  const editingTransaction =
    formState?.mode === "edit" ? formState.transaction : null;

  async function handleSave(
    input: TransactionInput,
    id?: string,
  ): Promise<boolean> {
    const saved = id
      ? await updateTransaction(id, input)
      : await createTransaction(input);

    if (saved && !id) {
      setFilters(emptyFilters);
    }

    return saved;
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            {t("title")}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            {t("subtitle")}
          </p>
        </div>

        {formState ? null : (
          <Button
            type="button"
            onClick={() => setFormState({ mode: "create" })}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="size-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t("new")}
          </Button>
        )}
      </div>

      {formState ? (
        <div className="mt-5">
          <TransactionForm
            key={editingTransaction?.id ?? "new"}
            calendar={calendar}
            hijriOffset={hijriOffset}
            defaultCurrency={defaultCurrency}
            contacts={contacts}
            transaction={editingTransaction}
            onSave={handleSave}
            onCreateContact={createContact}
            onCancel={() => setFormState(null)}
          />
        </div>
      ) : null}

      <section className="mt-5 rounded-2xl border border-line bg-surface/60 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink">
            {common("filters")}
          </h3>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => setFilters(emptyFilters)}
              className="rounded-sm text-xs text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {common("clearFilters")}
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            label={common("month")}
            value={filters.month}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                month: event.target.value,
              }))
            }
          >
            <option value="">{common("allMonths")}</option>
            {Array.from({ length: 12 }, (_, index) => index + 1).map(
              (month) => {
                const value = String(month).padStart(2, "0");

                return (
                  <option key={value} value={value}>
                    {formatMonthName(month, {
                      calendar,
                      locale,
                      monthNames,
                      hijriOffset,
                    })}
                  </option>
                );
              },
            )}
          </SelectField>

          <SelectField
            label={common("year")}
            value={filters.year}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                year: event.target.value,
              }))
            }
          >
            <option value="">{common("allYears")}</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {formatYear(Number(year), locale)}
              </option>
            ))}
          </SelectField>

          <SelectField
            label={common("kind")}
            value={filters.kind}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                kind: event.target.value as "" | TransactionKind,
              }))
            }
          >
            <option value="">{common("allKinds")}</option>
            {TRANSACTION_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kinds(kind)}
              </option>
            ))}
          </SelectField>

          <SelectField
            label={common("contact")}
            value={filters.contact}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                contact: event.target.value,
              }))
            }
          >
            <option value="">{common("allContacts")}</option>
            <option value="none">{common("noContact")}</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="mt-3">
          <TextField
            type="search"
            label={t("searchLabel")}
            placeholder={t("searchPlaceholder")}
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
            autoComplete="off"
          />
        </div>
      </section>

      {transactions.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={t("noResultsTitle")}
            description={t("noResultsDescription")}
            action={
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFilters(emptyFilters)}
              >
                {common("clearFilters")}
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map((group) => (
            <section key={group.date}>
              <div className="flex items-center gap-3">
                <h3 className="shrink-0 text-xs font-medium text-muted">
                  {formatDisplayDate(group.date, {
                    calendar,
                    locale,
                    monthNames,
                    hijriOffset,
                  })}
                </h3>
                <span className="h-px flex-1 bg-line/70" />
              </div>

              <ul className="mt-3 space-y-2">
                {group.transactions.map((transaction) => (
                  <li key={transaction.id}>
                    <TransactionRow
                      transaction={transaction}
                      contact={
                        transaction.contact_id
                          ? contactsById.get(transaction.contact_id)
                          : undefined
                      }
                      onEdit={() =>
                        setFormState({ mode: "edit", transaction })
                      }
                      onDelete={deleteTransaction}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
