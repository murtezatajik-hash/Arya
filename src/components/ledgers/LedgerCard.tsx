"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Link } from "@/i18n/navigation";
import {
  isLedgerCurrency,
  type Ledger,
} from "@/lib/ledgers/constants";
import { createClient } from "@/lib/supabase/client";

type CardMode = "view" | "rename" | "delete";

type LedgerCardProps = {
  ledger: Ledger;
  ownerId: string;
  onChanged: () => void;
};

const iconButtonClass =
  "inline-flex size-9 items-center justify-center rounded-lg border border-line/70 bg-canvas/50 text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function LedgerCard({ ledger, ownerId, onChanged }: LedgerCardProps) {
  const t = useTranslations("ledgers");
  const common = useTranslations("common");
  const [mode, setMode] = useState<CardMode>("view");
  const [displayName, setDisplayName] = useState(ledger.name);
  const [draftName, setDraftName] = useState(ledger.name);
  const [nameError, setNameError] = useState(false);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  const [hidden, setHidden] = useState(false);

  const currencyLabel = isLedgerCurrency(ledger.default_currency)
    ? t(`currencies.${ledger.default_currency}`)
    : ledger.default_currency;

  function startRename() {
    setDraftName(displayName);
    setNameError(false);
    setError(false);
    setMode("rename");
  }

  function startDelete() {
    setError(false);
    setMode("delete");
  }

  function cancel() {
    setNameError(false);
    setError(false);
    setDraftName(displayName);
    setMode("view");
  }

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);

    const trimmedName = draftName.trim();

    if (!trimmedName) {
      setNameError(true);
      return;
    }

    setNameError(false);
    setPending(true);

    try {
      const supabase = createClient();
      const { data, error: updateError } = await supabase
        .from("ledgers")
        .update({ name: trimmedName })
        .eq("id", ledger.id)
        .eq("owner_id", ownerId)
        .select("id");

      if (updateError || !data || data.length === 0) {
        setError(true);
        setPending(false);
        return;
      }

      setDisplayName(trimmedName);
      setPending(false);
      setMode("view");
      onChanged();
    } catch {
      setError(true);
      setPending(false);
    }
  }

  async function handleDelete() {
    setError(false);
    setPending(true);

    try {
      const supabase = createClient();
      const { data, error: deleteError } = await supabase
        .from("ledgers")
        .delete()
        .eq("id", ledger.id)
        .eq("owner_id", ownerId)
        .select("id");

      if (deleteError || !data || data.length === 0) {
        setError(true);
        setPending(false);
        return;
      }

      setPending(false);
      setHidden(true);
      onChanged();
    } catch {
      setError(true);
      setPending(false);
    }
  }

  if (hidden) {
    return null;
  }

  if (mode === "rename") {
    return (
      <article className="rounded-2xl border border-accent/20 bg-surface/80 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] sm:p-6">
        <form noValidate onSubmit={handleRename} className="space-y-4">
          <TextField
            autoFocus
            label={t("form.nameLabel")}
            name={`ledger-name-${ledger.id}`}
            value={draftName}
            onChange={(event) => {
              setDraftName(event.target.value);
              setNameError(false);
              setError(false);
            }}
            error={nameError ? t("errors.nameRequired") : undefined}
            required
          />

          {error ? <Alert>{t("errors.generic")}</Alert> : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={cancel}
              disabled={pending}
            >
              {t("actions.cancel")}
            </Button>
            <Button
              type="submit"
              loading={pending}
              loadingLabel={common("loading")}
            >
              {t("actions.save")}
            </Button>
          </div>
        </form>
      </article>
    );
  }

  if (mode === "delete") {
    return (
      <article className="rounded-2xl border border-accent/20 bg-surface/80 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] sm:p-6">
        <h2 className="text-base font-semibold text-ink">
          {t("delete.question")}
        </h2>
        <p className="mt-1 break-words text-sm text-muted">{displayName}</p>
        <p className="mt-1 text-xs leading-5 text-muted/70">
          {t("delete.description")}
        </p>

        {error ? (
          <div className="mt-3">
            <Alert>{t("errors.generic")}</Alert>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={cancel}
            disabled={pending}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            type="button"
            loading={pending}
            loadingLabel={common("loading")}
            onClick={handleDelete}
          >
            {t("actions.delete")}
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-line bg-surface/80 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-colors hover:border-accent/40 focus-within:border-accent/40">
      <Link
        href={`/ledgers/${ledger.id}`}
        className="block rounded-2xl p-5 pe-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40 sm:p-6 sm:pe-28"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            dir="ltr"
            className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent"
          >
            {ledger.default_currency}
          </span>
          <span className="text-xs text-muted">{currencyLabel}</span>
        </div>

        <h2 className="mt-4 line-clamp-2 break-words text-lg font-semibold tracking-tight text-ink">
          {displayName}
        </h2>
        <p className="mt-1 text-xs text-muted">{t("card.open")}</p>
      </Link>

      <div className="absolute end-4 top-4 flex items-center gap-1.5">
        <button
          type="button"
          onClick={startRename}
          aria-label={t("card.rename")}
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
          onClick={startDelete}
          aria-label={t("card.delete")}
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
