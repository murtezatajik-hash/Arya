"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Contact, LedgerTransaction } from "@/lib/ledgers/constants";
import { TRANSACTION_KIND_BADGE } from "@/lib/ledgers/presentation";
import { formatMoney } from "@/lib/money";

type TransactionRowProps = {
  transaction: LedgerTransaction;
  contact?: Contact;
  onEdit: () => void;
  onDelete: (id: string) => Promise<boolean>;
};

const iconButtonClass =
  "inline-flex size-9 items-center justify-center rounded-lg border border-line/70 bg-canvas/50 text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function TransactionRow({
  transaction,
  contact,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const t = useTranslations("ledgers.transactionList");
  const kinds = useTranslations("ledgers.kinds");
  const common = useTranslations("ledgers.common");
  const feedback = useTranslations("common");
  const locale = useLocale();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleDelete() {
    setPending(true);
    setError(false);

    try {
      const deleted = await onDelete(transaction.id);

      if (!deleted) {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="rounded-2xl border border-line bg-surface/75 p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium",
                TRANSACTION_KIND_BADGE[transaction.kind],
              )}
            >
              {kinds(transaction.kind)}
            </span>
            {contact ? (
              <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5 shrink-0"
                >
                  <circle cx="12" cy="8" r="3.2" />
                  <path d="M5 20c.7-3.3 3.2-5.2 7-5.2s6.3 1.9 7 5.2" />
                </svg>
                <span className="truncate">{contact.name}</span>
              </span>
            ) : null}
          </div>

          {transaction.description ? (
            <p className="mt-2 break-words text-sm leading-6 text-ink/90">
              {transaction.description}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <span
            dir="ltr"
            className="tabular-nums text-sm font-semibold text-ink"
          >
            {formatMoney(transaction.amount, transaction.currency, locale)}
          </span>

          {!confirming ? (
            <>
              <button
                type="button"
                onClick={onEdit}
                aria-label={t("edit")}
                className={iconButtonClass}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
                  <path d="m13.5 5.5 3 3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(false);
                  setConfirming(true);
                }}
                aria-label={t("delete")}
                className={iconButtonClass}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
                  <path d="m6.5 7 .8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {confirming ? (
        <div className="mt-4 rounded-xl border border-accent-strong/25 bg-accent-strong/10 p-3.5">
          <p className="text-sm font-medium text-ink">{t("deleteQuestion")}</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            {t("deleteDescription")}
          </p>

          {error ? (
            <div className="mt-3">
              <Alert>{t("deleteError")}</Alert>
            </div>
          ) : null}

          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConfirming(false);
                setError(false);
              }}
              disabled={pending}
            >
              {common("cancel")}
            </Button>
            <Button
              type="button"
              loading={pending}
              loadingLabel={feedback("loading")}
              onClick={handleDelete}
            >
              {common("delete")}
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
