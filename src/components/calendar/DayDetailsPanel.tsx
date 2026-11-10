"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TransactionForm } from "@/components/ledgers/TransactionForm";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import {
  holidayCategory,
  holidayDescription,
  holidayTitle,
  safeExternalUrl,
  type HolidayRow,
} from "@/lib/calendar/holidays";
import type { CalendarSystem } from "@/lib/dates/calendar";
import {
  formatDisplayDate,
  type CalendarMonthNames,
} from "@/lib/dates/display";
import type {
  Contact,
  Ledger,
  LedgerCurrency,
  LedgerTransaction,
} from "@/lib/ledgers/constants";
import { TRANSACTION_KIND_BADGE } from "@/lib/ledgers/presentation";
import type {
  ContactInput,
  TransactionInput,
} from "@/lib/ledgers/transactions";
import { formatMoney } from "@/lib/money";

type DayDetailsPanelProps = {
  iso: string;
  calendar: CalendarSystem;
  hijriOffset: number;
  locale: string;
  monthNames: CalendarMonthNames;
  holidays: HolidayRow[];
  holidaysError: boolean;
  ledger: Pick<Ledger, "id" | "name" | "default_currency"> | null;
  defaultCurrency: LedgerCurrency;
  contacts: Contact[];
  transactions: LedgerTransaction[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  formOpen: boolean;
  onOpenForm: () => void;
  onCloseForm: () => void;
  createTransaction: (input: TransactionInput) => Promise<boolean>;
  createContact: (input: ContactInput) => Promise<Contact | null>;
};

const CATEGORY_BADGE: Record<string, string> = {
  cultural: "border-amber-500/25 bg-amber-500/10 text-amber-200",
  official: "border-sky-500/25 bg-sky-500/10 text-sky-200",
  religious: "border-rose-500/25 bg-rose-500/10 text-rose-200",
};

export function DayDetailsPanel({
  iso,
  calendar,
  hijriOffset,
  locale,
  monthNames,
  holidays,
  holidaysError,
  ledger,
  defaultCurrency,
  contacts,
  transactions,
  loading,
  error,
  onRetry,
  formOpen,
  onOpenForm,
  onCloseForm,
  createTransaction,
  createContact,
}: DayDetailsPanelProps) {
  const t = useTranslations("calendar.page");
  const categories = useTranslations("calendar.holidayCategory");
  const kinds = useTranslations("ledgers.kinds");
  const selectedLabel = formatDisplayDate(iso, {
    calendar,
    locale,
    monthNames,
    hijriOffset,
  });
  const contactsById = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact])),
    [contacts],
  );

  return (
    <section className="rounded-2xl border border-line bg-surface/60 p-5 sm:p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent rtl:tracking-normal">
        {t("selectedDay")}
      </p>
      <h2 className="mt-1 text-lg font-semibold text-ink">
        {selectedLabel}
      </h2>

      <div className="mt-5 border-t border-line/70 pt-4">
        <h3 className="text-sm font-semibold text-ink">
          {t("holidaysTitle")}
        </h3>

        {holidaysError ? (
          <div className="mt-3">
            <Alert>{t("holidaysLoadError")}</Alert>
          </div>
        ) : null}

        {!holidaysError && holidays.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-muted">
            {t("noHolidays")}
          </p>
        ) : null}

        {holidays.length > 0 ? (
          <ul className="mt-3 space-y-2.5">
            {holidays.map((holiday) => {
              const category = holidayCategory(holiday);
              const sourceUrl = safeExternalUrl(holiday.source_url);
              const description = holidayDescription(holiday, locale);

              return (
                <li
                  key={holiday.id}
                  className="rounded-xl border border-line/70 bg-surface/70 p-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {holidayTitle(holiday, locale)}
                    </p>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        CATEGORY_BADGE[category],
                      )}
                    >
                      {categories(category)}
                    </span>
                  </div>

                  {description ? (
                    <p className="mt-1.5 text-xs leading-5 text-muted">
                      {description}
                    </p>
                  ) : null}

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {!holiday.verified ? (
                      <span className="inline-flex items-center rounded-full border border-line bg-canvas/60 px-2 py-0.5 text-[10px] text-muted">
                        {t("unverified")}
                      </span>
                    ) : null}

                    {sourceUrl ? (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-sm text-[11px] font-medium text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                      >
                        {t("source")}
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-3"
                        >
                          <path d="M14 5h5v5M19 5l-8 8" />
                          <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
                        </svg>
                      </a>
                    ) : null}
                  </div>

                  {holiday.calendar === "hijri" ? (
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-5 text-muted/75">
                      <span>{t("moonSighting")}</span>
                      <Link
                        href="/calendar/settings"
                        className="rounded-sm font-medium text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                      >
                        {t("moonSightingLink")}
                      </Link>
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <div className="mt-5 border-t border-line/70 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink">
              {t("transactionsTitle")}
            </h3>
            {ledger ? (
              <p className="mt-0.5 truncate text-[11px] text-muted">
                {ledger.name}
              </p>
            ) : null}
          </div>

          {ledger && !loading && !formOpen ? (
            <Button type="button" variant="secondary" onClick={onOpenForm}>
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
              {t("newTransaction")}
            </Button>
          ) : null}
        </div>

        {!ledger ? (
          <div className="mt-3 rounded-xl border border-dashed border-line bg-surface/40 px-4 py-5 text-center">
            <p className="text-sm font-medium text-ink">
              {t("noLedgerTitle")}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted">
              {t("noLedgerDescription")}
            </p>
            <Link
              href="/ledgers"
              className="mt-3 inline-flex rounded-sm text-xs font-medium text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {t("goToLedgers")}
            </Link>
          </div>
        ) : error ? (
          <div className="mt-3 space-y-3">
            <Alert>{t("monthlyLoadError")}</Alert>
            <Button type="button" variant="secondary" onClick={onRetry}>
              {t("retry")}
            </Button>
          </div>
        ) : loading ? (
          <p
            role="status"
            className="mt-3 inline-flex items-center gap-2 text-sm text-muted"
          >
            <Spinner className="size-3.5" />
            {t("loadingMonth")}
          </p>
        ) : transactions.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-muted">
            {t("noTransactions")}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {transactions.map((transaction) => {
              const contact = transaction.contact_id
                ? contactsById.get(transaction.contact_id)
                : undefined;

              return (
                <li
                  key={transaction.id}
                  className="rounded-xl border border-line/70 bg-surface/70 p-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium",
                        TRANSACTION_KIND_BADGE[transaction.kind],
                      )}
                    >
                      {kinds(transaction.kind)}
                    </span>
                    <span
                      dir="ltr"
                      className="tabular-nums text-sm font-semibold text-ink"
                    >
                      {formatMoney(
                        transaction.amount,
                        transaction.currency,
                        locale,
                      )}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-muted">
                    <span>{contact?.name ?? t("noContact")}</span>
                    {transaction.description ? (
                      <span className="min-w-0 break-words text-ink/80">
                        {transaction.description}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {ledger && formOpen ? (
          <div className="mt-4">
            <TransactionForm
              key={iso}
              calendar={calendar}
              hijriOffset={hijriOffset}
              defaultCurrency={defaultCurrency}
              contacts={contacts}
              initialDate={iso}
              onSave={createTransaction}
              onCreateContact={createContact}
              onCancel={onCloseForm}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
