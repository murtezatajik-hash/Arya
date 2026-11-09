import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BalanceList } from "@/components/ledgers/BalanceList";
import { EmptyState } from "@/components/ui/EmptyState";
import { Link, redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { formatDisplayDate } from "@/lib/dates/display";
import { calculateContactBalances } from "@/lib/ledgers/balances";
import {
  isTransactionKind,
  type Contact,
  type LedgerTransaction,
} from "@/lib/ledgers/constants";
import { TRANSACTION_KIND_BADGE } from "@/lib/ledgers/presentation";
import { groupTransactionsByDate } from "@/lib/ledgers/transactions";
import { loadProfileCalendar } from "@/lib/profile/server";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ContactPage({
  params,
}: {
  params: Promise<{ id: string; contactId: string }>;
}) {
  const { id, contactId } = await params;

  if (!UUID_PATTERN.test(id) || !UUID_PATTERN.test(contactId)) {
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

  const calendar = await loadProfileCalendar(
    supabase,
    user,
    activeLocale,
  );

  const { data: ledger, error: ledgerError } = await supabase
    .from("ledgers")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (ledgerError) {
    throw new Error(ledgerError.message);
  }

  if (!ledger) {
    notFound();
  }

  const { data: contactData, error: contactError } = await supabase
    .from("contacts")
    .select("id, ledger_id, name, phone, note, created_at")
    .eq("id", contactId)
    .eq("ledger_id", id)
    .maybeSingle();

  if (contactError) {
    throw new Error(contactError.message);
  }

  if (!contactData) {
    notFound();
  }

  const contact = contactData as Contact;

  const { data: transactionData, error: transactionError } =
    await supabase
      .from("transactions")
      .select(
        "id, ledger_id, contact_id, kind, amount, currency, occurred_on, description, created_at",
      )
      .eq("ledger_id", id)
      .eq("contact_id", contactId)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<LedgerTransaction[]>();

  if (transactionError) {
    throw new Error(transactionError.message);
  }

  const transactions = (transactionData ?? []).map((transaction) => ({
    ...transaction,
    amount: Number(transaction.amount),
    kind: isTransactionKind(transaction.kind)
      ? transaction.kind
      : ("received" as const),
  }));
  const balances = calculateContactBalances(transactions, contact.id);
  const groups = groupTransactionsByDate(transactions);
  const t = await getTranslations("ledgers.contactDetail");
  const kinds = await getTranslations("ledgers.kinds");
  const calendarMessages = await getTranslations("calendar");
  const monthNames = calendarMessages.raw("months.jalali") as string[];

  return (
    <div className="space-y-6">
      <Link
        href={`/ledgers/${id}?tab=contacts`}
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
        {t("back")}
      </Link>

      <section className="relative overflow-hidden rounded-2xl border border-line bg-surface/80 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-20 -top-24 size-56 rounded-full bg-accent/10 blur-3xl"
        />
        <p className="relative text-[11px] font-medium uppercase tracking-[0.22em] text-accent rtl:tracking-normal">
          {t("eyebrow")}
        </p>
        <h1 className="relative mt-2 break-words text-3xl font-semibold tracking-tight text-ink">
          {contact.name}
        </h1>

        {contact.phone ? (
          <p className="relative mt-3 text-sm text-muted">
            <span>{t("phone")}: </span>
            <span dir="ltr">{contact.phone}</span>
          </p>
        ) : null}

        {contact.note ? (
          <div className="relative mt-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted/70 rtl:tracking-normal">
              {t("note")}
            </p>
            <p className="mt-1 break-words text-sm leading-6 text-muted">
              {contact.note}
            </p>
          </div>
        ) : null}

        <div className="relative mt-6 rounded-xl border border-line/70 bg-canvas/30 p-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted/70 rtl:tracking-normal">
            {t("balance")}
          </h2>
          <BalanceList balances={balances} className="mt-3" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          {t("history")}
        </h2>

        {transactions.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title={t("emptyHistoryTitle")}
              description={t("emptyHistoryDescription")}
            />
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {groups.map((group) => (
              <section key={group.date}>
                <div className="flex items-center gap-3">
                  <h3 className="shrink-0 text-xs font-medium text-muted">
                    {formatDisplayDate(group.date, {
                      calendar,
                      locale,
                      monthNames,
                    })}
                  </h3>
                  <span className="h-px flex-1 bg-line/70" />
                </div>

                <ul className="mt-3 space-y-2">
                  {group.transactions.map((transaction) => (
                    <li key={transaction.id}>
                      <article className="rounded-2xl border border-line bg-surface/75 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium",
                              TRANSACTION_KIND_BADGE[transaction.kind],
                            )}
                          >
                            {kinds(transaction.kind)}
                          </span>
                          <span
                            dir="ltr"
                            className="tabular-nums text-sm font-semibold text-ink"
                          >
                            {formatMoney(
                              transaction.amount,
                              transaction.currency,
                              locale,
                            )}
                          </span>
                        </div>

                        {transaction.description ? (
                          <p className="mt-2 break-words text-sm leading-6 text-ink/90">
                            {transaction.description}
                          </p>
                        ) : null}
                      </article>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
