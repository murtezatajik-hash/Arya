"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { CalendarDateField } from "@/components/ui/CalendarDateField";
import { SelectField } from "@/components/ui/SelectField";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import type { CalendarSystem } from "@/lib/dates/calendar";
import { isValidIsoDate, todayIso } from "@/lib/dates/values";
import {
  isLedgerCurrency,
  LEDGER_CURRENCIES,
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
import {
  formatMinorForInput,
  parseAmountToMinor,
  type AmountParseError,
} from "@/lib/money";

type TransactionFormProps = {
  calendar: CalendarSystem;
  hijriOffset: number;
  defaultCurrency: LedgerCurrency;
  contacts: Contact[];
  transaction?: LedgerTransaction | null;
  initialDate?: string;
  onSave: (input: TransactionInput, id?: string) => Promise<boolean>;
  onCreateContact: (input: ContactInput) => Promise<Contact | null>;
  onCancel: () => void;
};

type FormError = "contact" | "generic" | null;

export function TransactionForm({
  calendar,
  hijriOffset,
  defaultCurrency,
  contacts,
  transaction,
  initialDate,
  onSave,
  onCreateContact,
  onCancel,
}: TransactionFormProps) {
  const t = useTranslations("ledgers.transactionForm");
  const calendarMessages = useTranslations("calendar");
  const kinds = useTranslations("ledgers.kinds");
  const currencies = useTranslations("ledgers.currencies");
  const common = useTranslations("ledgers.common");
  const feedback = useTranslations("common");
  const initialCurrency =
    transaction && isLedgerCurrency(transaction.currency)
      ? transaction.currency
      : defaultCurrency;
  const [kind, setKind] = useState<TransactionKind>(
    transaction?.kind ?? "received",
  );
  const [amount, setAmount] = useState(
    transaction
      ? formatMinorForInput(transaction.amount, initialCurrency)
      : "",
  );
  const [currency, setCurrency] =
    useState<LedgerCurrency>(initialCurrency);
  const [occurredOn, setOccurredOn] = useState<string | null>(
    transaction?.occurred_on ?? initialDate ?? todayIso(),
  );
  const [contactId, setContactId] = useState(
    transaction?.contact_id ?? "",
  );
  const [newContactName, setNewContactName] = useState("");
  const [description, setDescription] = useState(
    transaction?.description ?? "",
  );
  const [amountError, setAmountError] = useState<AmountParseError | null>(
    null,
  );
  const [dateError, setDateError] = useState(false);
  const [contactNameError, setContactNameError] = useState(false);
  const [error, setError] = useState<FormError>(null);
  const [pending, setPending] = useState(false);

  function amountErrorMessage(code: AmountParseError): string {
    switch (code) {
      case "required":
        return t("errors.amountRequired");
      case "positive":
        return t("errors.amountPositive");
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
    setError(null);

    const trimmedContactName = newContactName.trim();

    if (contactId === "new" && !trimmedContactName) {
      setContactNameError(true);
      return;
    }

    const parsedAmount = parseAmountToMinor(amount, currency);

    if (!parsedAmount.ok) {
      setAmountError(parsedAmount.error);
      return;
    }

    if (!occurredOn || !isValidIsoDate(occurredOn)) {
      setDateError(true);
      return;
    }

    const occurredOnIso = occurredOn;

    setAmountError(null);
    setDateError(false);
    setContactNameError(false);
    setPending(true);

    try {
      let finalContactId =
        contactId && contactId !== "new" ? contactId : null;

      if (contactId === "new") {
        const contact = await onCreateContact({
          name: trimmedContactName,
          phone: null,
          note: null,
        });

        if (!contact) {
          setError("contact");
          return;
        }

        finalContactId = contact.id;
        setContactId(contact.id);
      }

      const saved = await onSave(
        {
          kind,
          amount: parsedAmount.amount,
          currency,
          occurredOn: occurredOnIso,
          contactId: finalContactId,
          description: description.trim() || null,
        },
        transaction?.id,
      );

      if (!saved) {
        setError("generic");
        return;
      }

      onCancel();
    } catch {
      setError("generic");
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
      <h2 className="text-base font-semibold text-ink">
        {transaction ? t("editTitle") : t("createTitle")}
      </h2>

      <div className="mt-4 space-y-4">
        <SelectField
          label={t("kindLabel")}
          value={kind}
          onChange={(event) => {
            const nextKind = event.target.value;
            if (
              (TRANSACTION_KINDS as readonly string[]).includes(nextKind)
            ) {
              setKind(nextKind as TransactionKind);
            }
            setError(null);
          }}
        >
          {TRANSACTION_KINDS.map((kindValue) => (
            <option key={kindValue} value={kindValue}>
              {kinds(kindValue)}
            </option>
          ))}
        </SelectField>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
          <TextField
            autoFocus
            label={t("amountLabel")}
            name="amount"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setAmountError(null);
              setError(null);
            }}
            placeholder={t("amountPlaceholder")}
            error={
              amountError ? amountErrorMessage(amountError) : undefined
            }
            inputMode="decimal"
            autoComplete="off"
            dir="ltr"
            required
          />

          <SelectField
            label={t("currencyLabel")}
            value={currency}
            onChange={(event) => {
              const nextCurrency = event.target.value;
              if (isLedgerCurrency(nextCurrency)) {
                setCurrency(nextCurrency);
              }
              setAmountError(null);
              setError(null);
            }}
          >
            {LEDGER_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {currencies(code)} ({code})
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CalendarDateField
            calendar={calendar}
            hijriOffset={hijriOffset}
            label={t("dateLabel")}
            value={occurredOn ?? ""}
            onChange={(value) => {
              setOccurredOn(value);
              setDateError(false);
              setError(null);
            }}
            error={dateError ? t("errors.dateInvalid") : undefined}
            hint={calendarMessages("dateHint", {
              calendar: calendarMessages(`systems.${calendar}`),
            })}
            required
          />

          <SelectField
            label={t("contactLabel")}
            value={contactId}
            onChange={(event) => {
              setContactId(event.target.value);
              setContactNameError(false);
              setError(null);
            }}
          >
            <option value="">{t("contactNone")}</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
            <option value="new">{t("contactNew")}</option>
          </SelectField>
        </div>

        {contactId === "new" ? (
          <TextField
            label={t("newContactNameLabel")}
            name="new_contact_name"
            value={newContactName}
            onChange={(event) => {
              setNewContactName(event.target.value);
              setContactNameError(false);
              setError(null);
            }}
            placeholder={t("newContactNamePlaceholder")}
            error={
              contactNameError
                ? t("errors.contactNameRequired")
                : undefined
            }
            required
          />
        ) : null}

        <TextArea
          label={t("descriptionLabel")}
          name="description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setError(null);
          }}
          placeholder={t("descriptionPlaceholder")}
        />

        {error === "contact" ? <Alert>{t("errors.contactCreate")}</Alert> : null}
        {error === "generic" ? <Alert>{t("errors.generic")}</Alert> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
      </div>
    </form>
  );
}
