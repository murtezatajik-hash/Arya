"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import { formatMonthYear, formatYear } from "@/lib/dates/display";
import { getCurrentPeriod } from "@/lib/dates/values";
import {
  calculateContactBalanceMap,
  calculateContactTotals,
  calculateLedgerBalances,
  collectLedgerCurrencies,
  orderCurrencies,
  sumTransactions,
  type CurrencyTotals,
} from "@/lib/ledgers/balances";
import type {
  Contact,
  LedgerCurrency,
  LedgerTransaction,
} from "@/lib/ledgers/constants";
import { formatMoney } from "@/lib/money";

type SummaryTabProps = {
  defaultCurrency: LedgerCurrency;
  contacts: Contact[];
  transactions: LedgerTransaction[];
  openings: CurrencyTotals;
};

type TotalsCardProps = {
  title: string;
  totals: CurrencyTotals;
  defaultCurrency: LedgerCurrency;
  tone: "positive" | "negative";
};

function TotalsCard({
  title,
  totals,
  defaultCurrency,
  tone,
}: TotalsCardProps) {
  const locale = useLocale();
  const currencies = orderCurrencies(
    Object.entries(totals)
      .filter(([, amount]) => amount !== 0)
      .map(([currency]) => currency),
  );
  const rows = currencies.length > 0 ? currencies : [defaultCurrency];

  return (
    <section className="rounded-2xl border border-line bg-surface/75 p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] sm:p-5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <dl className="mt-4 space-y-2">
        {rows.map((currency) => (
          <div
            key={currency}
            className="flex items-center justify-between gap-3 border-t border-line/60 pt-2 first:border-t-0 first:pt-0"
          >
            <dt
              dir="ltr"
              className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted"
            >
              {currency}
            </dt>
            <dd
              dir="ltr"
              className={cn(
                "tabular-nums text-sm font-semibold",
                tone === "positive"
                  ? "text-emerald-200"
                  : "text-rose-200",
              )}
            >
              {formatMoney(totals[currency] ?? 0, currency, locale)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

type CurrencySummaryCardProps = {
  currency: string;
  opening: number;
  balance: number;
  receivable: number;
  payable: number;
};

function CurrencySummaryCard({
  currency,
  opening,
  balance,
  receivable,
  payable,
}: CurrencySummaryCardProps) {
  const t = useTranslations("ledgers.summary");
  const locale = useLocale();

  return (
    <section className="rounded-2xl border border-line bg-surface/75 p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] sm:p-5">
      <h4
        dir="ltr"
        className="font-mono text-sm font-semibold tracking-[0.08em] text-ink"
      >
        {currency}
      </h4>

      <dl className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-3 border-t border-line/60 pt-2 first:border-t-0 first:pt-0">
          <dt className="text-xs text-muted">{t("opening")}</dt>
          <dd
            dir="ltr"
            className={cn(
              "tabular-nums text-sm font-semibold",
              opening < 0 ? "text-rose-200" : "text-ink",
            )}
          >
            {formatMoney(opening, currency, locale)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line/60 pt-2">
          <dt className="text-xs text-muted">{t("balance")}</dt>
          <dd
            dir="ltr"
            className={cn(
              "tabular-nums text-sm font-semibold",
              balance < 0 ? "text-rose-200" : "text-ink",
            )}
          >
            {formatMoney(balance, currency, locale)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line/60 pt-2">
          <dt className="text-xs text-muted">{t("receivable")}</dt>
          <dd
            dir="ltr"
            className="tabular-nums text-sm font-semibold text-emerald-200"
          >
            {formatMoney(receivable, currency, locale)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line/60 pt-2">
          <dt className="text-xs text-muted">{t("payable")}</dt>
          <dd
            dir="ltr"
            className="tabular-nums text-sm font-semibold text-rose-200"
          >
            {formatMoney(payable, currency, locale)}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function SummaryTab({
  defaultCurrency,
  contacts,
  transactions,
  openings,
}: SummaryTabProps) {
  const t = useTranslations("ledgers.summary");
  const locale = useLocale();
  const period = getCurrentPeriod();

  const ledgerBalances = useMemo(
    () => calculateLedgerBalances(transactions, openings),
    [transactions, openings],
  );

  const hasOpeningBalance = useMemo(
    () => Object.values(openings).some((amount) => amount !== 0),
    [openings],
  );

  const monthReceived = useMemo(
    () =>
      sumTransactions(
        transactions,
        (transaction) =>
          transaction.kind === "received" &&
          transaction.occurred_on.startsWith(period.monthKey),
      ),
    [transactions, period.monthKey],
  );

  const monthPaid = useMemo(
    () =>
      sumTransactions(
        transactions,
        (transaction) =>
          transaction.kind === "paid" &&
          transaction.occurred_on.startsWith(period.monthKey),
      ),
    [transactions, period.monthKey],
  );

  const yearReceived = useMemo(
    () =>
      sumTransactions(
        transactions,
        (transaction) =>
          transaction.kind === "received" &&
          transaction.occurred_on.startsWith(period.yearKey),
      ),
    [transactions, period.yearKey],
  );

  const yearPaid = useMemo(
    () =>
      sumTransactions(
        transactions,
        (transaction) =>
          transaction.kind === "paid" &&
          transaction.occurred_on.startsWith(period.yearKey),
      ),
    [transactions, period.yearKey],
  );

  const contactTotals = useMemo(() => {
    const balances = calculateContactBalanceMap(transactions, contacts);

    return calculateContactTotals(balances);
  }, [transactions, contacts]);

  const currencies = useMemo(() => {
    const values = new Set([
      ...collectLedgerCurrencies(transactions, openings),
      ...Object.keys(contactTotals.receivables),
      ...Object.keys(contactTotals.payables),
    ]);

    return orderCurrencies(values);
  }, [transactions, openings, contactTotals]);

  const rows =
    currencies.length > 0 ? currencies : [defaultCurrency];

  return (
    <div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          {t("title")}
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          {t("subtitle")}
        </p>
      </div>

      {transactions.length === 0 &&
      contacts.length === 0 &&
      !hasOpeningBalance ? (
        <div className="mt-6">
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          <section>
            <div>
              <h3 className="text-sm font-semibold text-ink">
                {t("currencyBalances")}
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted">
                {t("currencyBalancesHint")}
              </p>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {rows.map((currency) => (
                <CurrencySummaryCard
                  key={currency}
                  currency={currency}
                  opening={openings[currency] ?? 0}
                  balance={ledgerBalances[currency] ?? 0}
                  receivable={contactTotals.receivables[currency] ?? 0}
                  payable={contactTotals.payables[currency] ?? 0}
                />
              ))}
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">
                {t("currentMonth")}
              </h3>
              <span className="text-xs text-muted">
                {formatMonthYear(period.year, period.month, locale)}
              </span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <TotalsCard
                title={t("received")}
                totals={monthReceived}
                defaultCurrency={defaultCurrency}
                tone="positive"
              />
              <TotalsCard
                title={t("paid")}
                totals={monthPaid}
                defaultCurrency={defaultCurrency}
                tone="negative"
              />
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">
                {t("currentYear")}
              </h3>
              <span className="text-xs text-muted">
                {formatYear(period.year, locale)}
              </span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <TotalsCard
                title={t("received")}
                totals={yearReceived}
                defaultCurrency={defaultCurrency}
                tone="positive"
              />
              <TotalsCard
                title={t("paid")}
                totals={yearPaid}
                defaultCurrency={defaultCurrency}
                tone="negative"
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
