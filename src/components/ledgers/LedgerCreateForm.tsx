"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import {
  isLedgerCurrency,
  isLedgerLimitError,
  LEDGER_CURRENCIES,
  type LedgerCurrency,
} from "@/lib/ledgers/constants";
import { createClient } from "@/lib/supabase/client";

type CreateError = "limit" | "generic" | null;

type LedgerCreateFormProps = {
  ownerId: string;
  onCancel: () => void;
  onCreated: () => void;
};

export function LedgerCreateForm({
  ownerId,
  onCancel,
  onCreated,
}: LedgerCreateFormProps) {
  const t = useTranslations("ledgers");
  const common = useTranslations("common");
  const selectId = useId();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<LedgerCurrency>("TJS");
  const [nameError, setNameError] = useState(false);
  const [error, setError] = useState<CreateError>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError(true);
      return;
    }

    setNameError(false);
    setPending(true);

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("ledgers").insert({
        owner_id: ownerId,
        name: trimmedName,
        default_currency: currency,
      });

      if (insertError) {
        setError(isLedgerLimitError(insertError) ? "limit" : "generic");
        setPending(false);
        return;
      }

      setPending(false);
      onCreated();
    } catch {
      setError("generic");
      setPending(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="rounded-2xl border border-accent/20 bg-surface/80 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] sm:p-6"
    >
      <h2 className="text-base font-semibold text-ink">{t("form.title")}</h2>

      <div className="mt-4 space-y-4">
        <TextField
          autoFocus
          label={t("form.nameLabel")}
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setNameError(false);
            setError(null);
          }}
          placeholder={t("form.namePlaceholder")}
          error={nameError ? t("errors.nameRequired") : undefined}
          required
        />

        <div className="space-y-1.5">
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-muted"
          >
            {t("form.currencyLabel")}
          </label>
          <select
            id={selectId}
            name="default_currency"
            value={currency}
            onChange={(event) => {
              const nextCurrency = event.target.value;
              if (isLedgerCurrency(nextCurrency)) {
                setCurrency(nextCurrency);
              }
            }}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/15"
          >
            {LEDGER_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {t(`currencies.${code}`)} ({code})
              </option>
            ))}
          </select>
        </div>

        {error === "limit" ? (
          <div className="space-y-3">
            <Alert>{t("errors.limitReached")}</Alert>
            <Button type="button" variant="secondary">
              {t("actions.upgrade")}
            </Button>
          </div>
        ) : null}

        {error === "generic" ? <Alert>{t("errors.generic")}</Alert> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={pending}
          >
            {t("form.cancel")}
          </Button>
          <Button
            type="submit"
            loading={pending}
            loadingLabel={common("loading")}
          >
            {t("form.submit")}
          </Button>
        </div>
      </div>
    </form>
  );
}
