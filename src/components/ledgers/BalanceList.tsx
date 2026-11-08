"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { orderCurrencies } from "@/lib/ledgers/balances";
import { formatMoney } from "@/lib/money";

type BalanceListProps = {
  balances: Record<string, number>;
  className?: string;
};

export function BalanceList({ balances, className }: BalanceListProps) {
  const t = useTranslations("ledgers.balance");
  const locale = useLocale();
  const currencies = orderCurrencies(Object.keys(balances)).filter(
    (currency) => (balances[currency] ?? 0) !== 0,
  );

  if (currencies.length === 0) {
    return (
      <p className={cn("text-xs text-muted/70", className)}>{t("zero")}</p>
    );
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {currencies.map((currency) => {
        const amount = balances[currency];
        const isReceivable = amount > 0;

        return (
          <li
            key={currency}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                isReceivable
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-500/25 bg-rose-500/10 text-rose-200",
              )}
            >
              {isReceivable ? t("receivable") : t("payable")}
            </span>
            <span
              dir="ltr"
              className={cn(
                "tabular-nums text-xs font-semibold",
                isReceivable ? "text-emerald-200" : "text-rose-200",
              )}
            >
              {formatMoney(Math.abs(amount), currency, locale)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
