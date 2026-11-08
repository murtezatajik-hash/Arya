"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import type { CurrencyTotals } from "@/lib/ledgers/balances";
import { LEDGER_CURRENCIES } from "@/lib/ledgers/constants";
import {
  formatMinorForInput,
  parseSignedAmountToMinor,
  type AmountParseError,
} from "@/lib/money";

type OpeningBalancesFormProps = {
  openings: CurrencyTotals;
  onSave: (amounts: CurrencyTotals) => Promise<boolean>;
  onCancel: () => void;
};

function initialValues(openings: CurrencyTotals): Record<string, string> {
  return Object.fromEntries(
    LEDGER_CURRENCIES.map((currency) => [
      currency,
      formatMinorForInput(openings[currency] ?? 0, currency),
    ]),
  );
}

export function OpeningBalancesForm({
  openings,
  onSave,
  onCancel,
}: OpeningBalancesFormProps) {
  const t = useTranslations("ledgers.openingBalances");
  const currencies = useTranslations("ledgers.currencies");
  const common = useTranslations("ledgers.common");
  const feedback = useTranslations("common");
  const [values, setValues] = useState<Record<string, string>>(() =>
    initialValues(openings),
  );
  const [errors, setErrors] = useState<Record<string, AmountParseError>>({});
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  function amountErrorMessage(code: AmountParseError): string {
    switch (code) {
      case "noFraction":
        return t("errors.amountNoFraction");
      case "tooManyFractions":
        return t("errors.amountTooManyFractions");
      default:
        return t("errors.amountInvalid");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);

    const nextErrors: Record<string, AmountParseError> = {};
    const amounts: CurrencyTotals = {};

    for (const currency of LEDGER_CURRENCIES) {
      const rawValue = values[currency]?.trim()
        ? values[currency]
        : "0";
      const parsed = parseSignedAmountToMinor(rawValue, currency);

      if (!parsed.ok) {
        nextErrors[currency] = parsed.error;
      } else {
        amounts[currency] = parsed.amount;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setPending(true);

    try {
      const saved = await onSave(amounts);

      if (!saved) {
        setError(true);
        return;
      }

      onCancel();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="rounded-2xl border border-accent/20 bg-surface/80 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] sm:p-6"
    >
      <h2 className="text-base font-semibold text-ink">{t("title")}</h2>
      <p className="mt-1 text-xs leading-5 text-muted">{t("hint")}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEDGER_CURRENCIES.map((currency, index) => (
          <TextField
            key={currency}
            autoFocus={index === 0}
            label={`${currencies(currency)} (${currency})`}
            name={`opening_${currency}`}
            value={values[currency] ?? ""}
            onChange={(event) => {
              setValues((current) => ({
                ...current,
                [currency]: event.target.value,
              }));
              setErrors((current) => {
                if (!current[currency]) {
                  return current;
                }

                const next = { ...current };
                delete next[currency];
                return next;
              });
              setError(false);
            }}
            error={
              errors[currency]
                ? amountErrorMessage(errors[currency])
                : undefined
            }
            placeholder="0"
            inputMode="text"
            autoComplete="off"
            dir="ltr"
          />
        ))}
      </div>

      {error ? (
        <div className="mt-4">
          <Alert>{t("errors.generic")}</Alert>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={pending}
        >
          {common("cancel")}
        </Button>
        <Button
          type="submit"
          loading={pending}
          loadingLabel={feedback("loading")}
        >
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
