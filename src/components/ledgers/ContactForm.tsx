"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import type { Contact } from "@/lib/ledgers/constants";
import type { ContactInput } from "@/lib/ledgers/transactions";

type ContactFormProps = {
  contact?: Contact | null;
  onSave: (input: ContactInput) => Promise<boolean>;
  onCancel: () => void;
};

export function ContactForm({
  contact,
  onSave,
  onCancel,
}: ContactFormProps) {
  const t = useTranslations("ledgers.contactForm");
  const common = useTranslations("ledgers.common");
  const feedback = useTranslations("common");
  const [name, setName] = useState(contact?.name ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [note, setNote] = useState(contact?.note ?? "");
  const [nameError, setNameError] = useState(false);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError(true);
      return;
    }

    setNameError(false);
    setPending(true);

    try {
      const saved = await onSave({
        name: trimmedName,
        phone: phone.trim() || null,
        note: note.trim() || null,
      });

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
      <h2 className="text-base font-semibold text-ink">
        {contact ? t("editTitle") : t("createTitle")}
      </h2>

      <div className="mt-4 space-y-4">
        <TextField
          autoFocus
          label={t("nameLabel")}
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setNameError(false);
            setError(false);
          }}
          placeholder={t("namePlaceholder")}
          error={nameError ? t("errors.nameRequired") : undefined}
          required
        />

        <TextField
          label={t("phoneLabel")}
          name="phone"
          type="tel"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setError(false);
          }}
          placeholder={t("phonePlaceholder")}
          autoComplete="tel"
          dir="ltr"
        />

        <TextArea
          label={t("noteLabel")}
          name="note"
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            setError(false);
          }}
          placeholder={t("notePlaceholder")}
        />

        {error ? <Alert>{t("errors.generic")}</Alert> : null}

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
