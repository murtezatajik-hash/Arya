"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { LedgerCard } from "@/components/ledgers/LedgerCard";
import { LedgerCreateForm } from "@/components/ledgers/LedgerCreateForm";
import { InstallGuide } from "@/components/pwa/InstallGuide";
import { useRouter } from "@/i18n/navigation";
import type { Ledger } from "@/lib/ledgers/constants";

type LedgersViewProps = {
  ownerId: string;
  ledgers: Ledger[];
};

export function LedgersView({ ownerId, ledgers }: LedgersViewProps) {
  const t = useTranslations("ledgers");
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  function refresh() {
    router.refresh();
  }

  return (
    <div>
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent rtl:tracking-normal">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          {t("subtitle")}
        </p>
      </header>

      <InstallGuide />

      <div className="mt-6">
        {creating ? (
          <LedgerCreateForm
            ownerId={ownerId}
            onCancel={() => setCreating(false)}
            onCreated={() => {
              setCreating(false);
              refresh();
            }}
          />
        ) : (
          <Button type="button" onClick={() => setCreating(true)}>
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
            {t("newLedger")}
          </Button>
        )}
      </div>

      {ledgers.length === 0 ? (
        creating ? null : (
          <section className="mt-8 rounded-2xl border border-dashed border-line bg-surface/40 px-6 py-12 text-center">
            <span
              aria-hidden="true"
              className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
              >
                <path d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v12.5H8a2 2 0 0 1-2-2V4.5Z" />
                <path d="M6 17.5a2 2 0 0 1 2-2h10" />
                <path d="M9.5 8.5h5M9.5 11.5h5" />
              </svg>
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">
              {t("empty.title")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              {t("empty.description")}
            </p>
          </section>
        )
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {ledgers.map((ledger) => (
            <LedgerCard
              key={ledger.id}
              ledger={ledger}
              ownerId={ownerId}
              onChanged={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
