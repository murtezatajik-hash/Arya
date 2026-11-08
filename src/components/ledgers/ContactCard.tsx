"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { BalanceList } from "@/components/ledgers/BalanceList";
import { Link } from "@/i18n/navigation";
import type { Contact } from "@/lib/ledgers/constants";

type ContactCardProps = {
  ledgerId: string;
  contact: Contact;
  balances: Record<string, number>;
  onEdit: () => void;
  onDelete: (id: string) => Promise<boolean>;
};

const iconButtonClass =
  "inline-flex size-9 items-center justify-center rounded-lg border border-line/70 bg-canvas/50 text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function ContactCard({
  ledgerId,
  contact,
  balances,
  onEdit,
  onDelete,
}: ContactCardProps) {
  const t = useTranslations("ledgers.contacts");
  const common = useTranslations("ledgers.common");
  const feedback = useTranslations("common");
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleDelete() {
    setPending(true);
    setError(false);

    try {
      const deleted = await onDelete(contact.id);

      if (!deleted) {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  if (confirming) {
    return (
      <article className="rounded-2xl border border-accent/20 bg-surface/80 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] sm:p-6">
        <h3 className="text-base font-semibold text-ink">
          {t("deleteQuestion")}
        </h3>
        <p className="mt-1 break-words text-sm text-muted">{contact.name}</p>
        <p className="mt-1 text-xs leading-5 text-muted/70">
          {t("deleteDescription")}
        </p>

        {error ? (
          <div className="mt-3">
            <Alert>{t("deleteError")}</Alert>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
      </article>
    );
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-line bg-surface/80 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-colors hover:border-accent/40 focus-within:border-accent/40">
      <Link
        href={`/ledgers/${ledgerId}/contacts/${contact.id}`}
        aria-label={t("view", { name: contact.name })}
        className="block rounded-2xl p-5 pe-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40 sm:p-6 sm:pe-28"
      >
        <h3 className="line-clamp-2 break-words text-base font-semibold tracking-tight text-ink">
          {contact.name}
        </h3>

        {contact.phone ? (
          <p className="mt-1 text-xs text-muted">
            <span dir="ltr">{contact.phone}</span>
          </p>
        ) : null}

        {contact.note ? (
          <p className="mt-2 line-clamp-2 break-words text-xs leading-5 text-muted/80">
            {contact.note}
          </p>
        ) : null}

        <div className="mt-4 border-t border-line/70 pt-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted/70 rtl:tracking-normal">
            {t("balance")}
          </p>
          <BalanceList balances={balances} className="mt-2" />
        </div>
      </Link>

      <div className="absolute end-4 top-4 flex items-center gap-1.5">
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
      </div>
    </article>
  );
}
