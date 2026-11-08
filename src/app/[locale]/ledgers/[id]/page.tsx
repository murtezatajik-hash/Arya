import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { LedgerWorkspace, type LedgerTab } from "@/components/ledgers/LedgerWorkspace";
import { Link, redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  isLedgerCurrency,
  type Ledger,
} from "@/lib/ledgers/constants";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type LedgerSummary = Pick<Ledger, "id" | "name" | "default_currency">;

export default async function LedgerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const locale = await getLocale();
  const activeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale: activeLocale });
    return null;
  }

  const { data, error } = await supabase
    .from("ledgers")
    .select("id, name, default_currency")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const ledger = data as LedgerSummary;
  const { tab } = await searchParams;
  const requestedTab = Array.isArray(tab) ? tab[0] : tab;
  const initialTab: LedgerTab =
    requestedTab === "contacts" || requestedTab === "summary"
      ? requestedTab
      : "records";
  const detailT = await getTranslations("ledgers.detail");
  const ledgersT = await getTranslations("ledgers");
  const currencyLabel = isLedgerCurrency(ledger.default_currency)
    ? ledgersT(`currencies.${ledger.default_currency}`)
    : ledger.default_currency;

  return (
    <div className="space-y-6">
      <Link
        href="/ledgers"
        className="inline-flex w-fit items-center gap-2 rounded-sm text-sm text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 rtl:-scale-x-100"
        >
          <path d="M15 18 9 12l6-6" />
        </svg>
        {detailT("back")}
      </Link>

      <section className="relative overflow-hidden rounded-2xl border border-line bg-surface/80 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-20 -top-24 size-56 rounded-full bg-accent/10 blur-3xl"
        />
        <p className="relative text-[11px] font-medium uppercase tracking-[0.22em] text-accent rtl:tracking-normal">
          {detailT("eyebrow")}
        </p>
        <h1 className="relative mt-2 break-words text-3xl font-semibold tracking-tight text-ink">
          {ledger.name}
        </h1>
        <div className="relative mt-3 flex flex-wrap items-center gap-2">
          <span
            dir="ltr"
            className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent"
          >
            {ledger.default_currency}
          </span>
          <span className="text-xs text-muted">{currencyLabel}</span>
          <span className="text-xs text-muted/60">
            {detailT("defaultCurrency")}
          </span>
        </div>
      </section>

      <LedgerWorkspace
        key={initialTab}
        ledger={ledger}
        initialTab={initialTab}
      />
    </div>
  );
}
