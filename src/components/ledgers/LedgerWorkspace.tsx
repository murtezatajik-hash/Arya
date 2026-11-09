"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ContactsTab } from "@/components/ledgers/ContactsTab";
import { LedgerBalanceBar } from "@/components/ledgers/LedgerBalanceBar";
import { OpeningBalancesForm } from "@/components/ledgers/OpeningBalancesForm";
import { RecordsTab } from "@/components/ledgers/RecordsTab";
import { SummaryTab } from "@/components/ledgers/SummaryTab";
import { useLedgerData } from "@/components/ledgers/use-ledger-data";
import { cn } from "@/lib/cn";
import type { CalendarSystem } from "@/lib/dates/calendar";
import {
  isLedgerCurrency,
  type Ledger,
} from "@/lib/ledgers/constants";

export type LedgerTab = "records" | "contacts" | "summary";

const TABS: LedgerTab[] = ["records", "contacts", "summary"];

type LedgerWorkspaceProps = {
  calendar: CalendarSystem;
  hijriOffset: number;
  ledger: Pick<Ledger, "id" | "name" | "default_currency">;
  initialTab: LedgerTab;
};

export function LedgerWorkspace({
  calendar,
  hijriOffset,
  ledger,
  initialTab,
}: LedgerWorkspaceProps) {
  const t = useTranslations("ledgers");
  const feedback = useTranslations("common");
  const [tab, setTab] = useState<LedgerTab>(initialTab);
  const [openingFormOpen, setOpeningFormOpen] = useState(false);
  const data = useLedgerData(ledger.id);
  const defaultCurrency = isLedgerCurrency(ledger.default_currency)
    ? ledger.default_currency
    : "TJS";

  if (data.loading) {
    return (
      <div role="status" aria-live="polite" className="space-y-4">
        <span className="sr-only">{feedback("loading")}</span>
        <div className="h-24 animate-pulse rounded-2xl border border-line/70 bg-surface/60" />
        <div className="h-12 animate-pulse rounded-2xl border border-line/70 bg-surface/60" />
        <div className="h-24 animate-pulse rounded-2xl border border-line/70 bg-surface/60" />
        <div className="space-y-2">
          <div className="h-20 animate-pulse rounded-2xl border border-line/70 bg-surface/60" />
          <div className="h-20 animate-pulse rounded-2xl border border-line/70 bg-surface/60" />
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="space-y-4">
        <Alert>{t("workspace.loadError")}</Alert>
        <Button type="button" variant="secondary" onClick={data.reload}>
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <LedgerBalanceBar
        transactions={data.transactions}
        openings={data.openings}
        onEditOpening={() => setOpeningFormOpen(true)}
      />

      {openingFormOpen ? (
        <div className="mt-4">
          <OpeningBalancesForm
            openings={data.openings}
            onSave={data.saveOpenings}
            onCancel={() => setOpeningFormOpen(false)}
          />
        </div>
      ) : null}

      <div
        role="tablist"
        aria-label={t("tabs.label")}
        className="mt-4 grid grid-cols-3 gap-1 rounded-2xl border border-line bg-surface/70 p-1"
      >
        {TABS.map((tabKey) => {
          const active = tab === tabKey;

          return (
            <button
              key={tabKey}
              id={`ledger-tab-${tabKey}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`ledger-panel-${tabKey}`}
              onClick={() => setTab(tabKey)}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                active
                  ? "bg-accent-strong text-white shadow-[0_10px_28px_-16px_rgba(225,29,72,0.9)]"
                  : "text-muted hover:text-ink",
              )}
            >
              {t(`tabs.${tabKey}`)}
            </button>
          );
        })}
      </div>

      <div
        id={`ledger-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`ledger-tab-${tab}`}
        className="mt-6"
      >
        {tab === "records" ? (
          <RecordsTab
            calendar={calendar}
            hijriOffset={hijriOffset}
            defaultCurrency={defaultCurrency}
            contacts={data.contacts}
            transactions={data.transactions}
            createContact={data.createContact}
            createTransaction={data.createTransaction}
            updateTransaction={data.updateTransaction}
            deleteTransaction={data.deleteTransaction}
          />
        ) : null}

        {tab === "contacts" ? (
          <ContactsTab
            ledgerId={ledger.id}
            contacts={data.contacts}
            transactions={data.transactions}
            createContact={data.createContact}
            updateContact={data.updateContact}
            deleteContact={data.deleteContact}
          />
        ) : null}

        {tab === "summary" ? (
          <SummaryTab
            calendar={calendar}
            hijriOffset={hijriOffset}
            defaultCurrency={defaultCurrency}
            contacts={data.contacts}
            transactions={data.transactions}
            openings={data.openings}
          />
        ) : null}
      </div>
    </div>
  );
}
