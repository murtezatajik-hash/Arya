"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContactCard } from "@/components/ledgers/ContactCard";
import { ContactForm } from "@/components/ledgers/ContactForm";
import { calculateContactBalanceMap } from "@/lib/ledgers/balances";
import type {
  Contact,
  LedgerTransaction,
} from "@/lib/ledgers/constants";
import type { ContactInput } from "@/lib/ledgers/transactions";

type ContactsTabProps = {
  ledgerId: string;
  contacts: Contact[];
  transactions: LedgerTransaction[];
  createContact: (input: ContactInput) => Promise<Contact | null>;
  updateContact: (id: string, input: ContactInput) => Promise<boolean>;
  deleteContact: (id: string) => Promise<boolean>;
};

type FormState =
  | { mode: "create" }
  | { mode: "edit"; contact: Contact }
  | null;

export function ContactsTab({
  ledgerId,
  contacts,
  transactions,
  createContact,
  updateContact,
  deleteContact,
}: ContactsTabProps) {
  const t = useTranslations("ledgers.contacts");
  const [formState, setFormState] = useState<FormState>(null);

  const balanceMap = useMemo(
    () => calculateContactBalanceMap(transactions, contacts),
    [transactions, contacts],
  );

  const editingContact =
    formState?.mode === "edit" ? formState.contact : null;

  async function handleSave(input: ContactInput): Promise<boolean> {
    if (formState?.mode === "edit") {
      return updateContact(formState.contact.id, input);
    }

    const contact = await createContact(input);

    return contact !== null;
  }

  async function handleDelete(id: string): Promise<boolean> {
    const deleted = await deleteContact(id);

    if (
      deleted &&
      formState?.mode === "edit" &&
      formState.contact.id === id
    ) {
      setFormState(null);
    }

    return deleted;
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            {t("title")}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            {t("subtitle")}
          </p>
        </div>

        {formState ? null : (
          <Button
            type="button"
            onClick={() => setFormState({ mode: "create" })}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="size-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t("new")}
          </Button>
        )}
      </div>

      {formState ? (
        <div className="mt-5">
          <ContactForm
            key={editingContact?.id ?? "new"}
            contact={editingContact}
            onSave={handleSave}
            onCancel={() => setFormState(null)}
          />
        </div>
      ) : null}

      {contacts.length === 0 ? (
        formState ? null : (
          <div className="mt-6">
            <EmptyState
              title={t("emptyTitle")}
              description={t("emptyDescription")}
            />
          </div>
        )
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              ledgerId={ledgerId}
              contact={contact}
              balances={balanceMap.get(contact.id) ?? {}}
              onEdit={() =>
                setFormState({ mode: "edit", contact })
              }
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
