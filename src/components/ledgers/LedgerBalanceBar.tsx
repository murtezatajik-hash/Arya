"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  calculateLedgerBalances,
  collectLedgerCurrencies,
  orderCurrencies,
  type CurrencyTotals,
} from "@/lib/ledgers/balances";
import type { LedgerTransaction } from "@/lib/ledgers/constants";
import { formatMoney } from "@/lib/money";

type LedgerBalanceBarProps = {
  transactions: LedgerTransaction[];
  openings: CurrencyTotals;
  onEditOpening: () => void;
};

export function LedgerBalanceBar({
  transactions,
  openings,
  onEditOpening,
}: LedgerBalanceBarProps) {
  const t = useTranslations("ledgers.balanceBar");
  const openingT = useTranslations("ledgers.openingBalances");
  const locale = useLocale();
  const balances = useMemo(
    () => calculateLedgerBalances(transactions, openings),
    [transactions, openings],
  );
  const currencies = orderCurrencies(
    collectLedgerCurrencies(transactions, openings),
  );

  return (
    <section
      aria-label={t("ariaLabel")}
      aria-live="polite"
      className="rounded-2xl border border-accent/20 bg-surface/80 p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] sm:p-5"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">{t("label")}</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={onEditOpening}
            className="px-3 py-1.5 text-xs"
          >
            {openingT("title")}
          </Button>
        </div>

        {currencies.length === 0 ? (
          <p className="text-sm text-muted">{t("empty")}</p>
        ) : (
          <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            {currencies.map((currency) => {
              const amount = balances[currency] ?? 0;

              return (
                <div
                  key={currency}
                  className="flex items-baseline gap-2"
                >
                  <dt
                    dir="ltr"
                    className="font-mono text-[10px] font-semibold tracking-[0.14em] text-muted"
                  >
                    {currency}
                  </dt>
                  <dd
                    dir="ltr"
                    className={cn(
                      "tabular-nums text-xl font-semibold tracking-tight sm:text-2xl",
                      amount < 0 ? "text-rose-200" : "text-ink",
                    )}
                  >
                    {formatMoney(amount, currency, locale)}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}
      </div>
    </section>
  );
}
