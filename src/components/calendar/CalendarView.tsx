"use client";

import { useMemo, useSyncExternalStore, useState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";
import { CalendarMonthGrid } from "@/components/calendar/CalendarMonthGrid";
import { CalendarQuickSwitcher } from "@/components/calendar/CalendarQuickSwitcher";
import { DayDetailsPanel } from "@/components/calendar/DayDetailsPanel";
import { TodayHero } from "@/components/calendar/TodayHero";
import { ZodiacCard } from "@/components/calendar/ZodiacCard";
import { useCalendarLedger } from "@/components/calendar/use-calendar-ledger";
import {
  addCalendarMonths,
  calendarDateFromIso,
  type CalendarSystem,
} from "@/lib/dates/calendar";
import {
  formatMonthYear,
  type CalendarMonthNames,
} from "@/lib/dates/display";
import { todayIso } from "@/lib/dates/values";
import {
  holidayCategory,
  holidayTitle,
  holidaysForIso,
  type HolidayRow,
} from "@/lib/calendar/holidays";
import {
  getCalendarMonthGrid,
  weekStartForCalendar,
} from "@/lib/calendar/month-grid";
import {
  isLedgerCurrency,
  type Ledger,
  type LedgerCurrency,
  type LedgerTransaction,
} from "@/lib/ledgers/constants";
import { readLastOpenedLedger } from "@/lib/ledgers/last-opened";
import { saveProfileCalendar } from "@/lib/profile/save-calendar";
import type { ProfileCalendarProfile } from "@/lib/profile/server";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

type CalendarViewProps = {
  userId: string;
  locale: string;
  initialProfile: ProfileCalendarProfile;
  initialToday: string;
  holidays: HolidayRow[];
  holidaysError: boolean;
  ledgers: Ledger[];
  ledgersError: boolean;
};

type QuickSaveStatus = "idle" | "saved" | "error";

const subscribeToNothing = () => () => undefined;

const CATEGORY_DOT: Record<string, string> = {
  cultural: "bg-amber-400",
  official: "bg-sky-400",
  religious: "bg-rose-400",
};

export function CalendarView({
  userId,
  locale,
  initialProfile,
  initialToday,
  holidays,
  holidaysError,
  ledgers,
  ledgersError,
}: CalendarViewProps) {
  const t = useTranslations("calendar");
  const categories = useTranslations("calendar.holidayCategory");
  const router = useRouter();
  const holidaySets = initialProfile.holidaySets;
  const [calendar, setCalendar] = useState<CalendarSystem>(
    initialProfile.calendar,
  );
  const [hijriOffset] = useState(initialProfile.hijriOffset);
  const today = useSyncExternalStore(
    subscribeToNothing,
    todayIso,
    () => initialToday,
  );
  const [month, setMonth] = useState(() => {
    const current = calendarDateFromIso(
      initialToday,
      initialProfile.calendar,
      initialProfile.hijriOffset,
    );

    return {
      year: current?.year ?? 1,
      month: current?.month ?? 1,
    };
  });
  const [selectedIso, setSelectedIso] = useState(initialToday);
  const [calendarStatus, setCalendarStatus] =
    useState<QuickSaveStatus>("idle");
  const [calendarPending, setCalendarPending] = useState(false);
  const [manualLedgerId, setManualLedgerId] = useState<string | null>(null);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const storedLedgerId = useSyncExternalStore(
    subscribeToNothing,
    readLastOpenedLedger,
    () => null,
  );
  const manualLedger =
    manualLedgerId &&
    ledgers.some((ledger) => ledger.id === manualLedgerId)
      ? manualLedgerId
      : null;
  const storedLedger =
    storedLedgerId &&
    ledgers.some((ledger) => ledger.id === storedLedgerId)
      ? storedLedgerId
      : null;
  const ledgerId = manualLedger ?? storedLedger ?? ledgers[0]?.id ?? null;
  const selectedLedger =
    ledgers.find((ledger) => ledger.id === ledgerId) ?? null;
  const defaultCurrency: LedgerCurrency =
    selectedLedger && isLedgerCurrency(selectedLedger.default_currency)
      ? selectedLedger.default_currency
      : "TJS";
  const monthNames = t.raw("months") as CalendarMonthNames;
  const weekStart = weekStartForCalendar(calendar, locale);
  const grid = useMemo(
    () =>
      getCalendarMonthGrid(
        calendar,
        month.year,
        month.month,
        hijriOffset,
        weekStart,
      ),
    [calendar, month.year, month.month, hijriOffset, weekStart],
  );
  const monthTitle = formatMonthYear(month.year, month.month, {
    calendar,
    locale,
    monthNames,
    hijriOffset,
  });
  const ledgerData = useCalendarLedger(
    ledgerId,
    grid.startIso,
    grid.endIsoExclusive,
  );
  const transactionsByIso = useMemo(() => {
    const grouped: Record<string, LedgerTransaction[]> = {};

    for (const transaction of ledgerData.transactions) {
      (grouped[transaction.occurred_on] ??= []).push(transaction);
    }

    return grouped;
  }, [ledgerData.transactions]);
  const transactionCountsByIso = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const [iso, transactions] of Object.entries(transactionsByIso)) {
      counts[iso] = transactions.length;
    }

    return counts;
  }, [transactionsByIso]);
  const holidayMaps = useMemo(() => {
    const categoriesByIso: Record<string, string[]> = {};
    const titlesByIso: Record<string, string[]> = {};

    for (const cell of grid.cells) {
      const items = holidaysForIso(
        holidays,
        cell.iso,
        holidaySets,
        hijriOffset,
      );

      if (items.length === 0) {
        continue;
      }

      categoriesByIso[cell.iso] = Array.from(
        new Set(items.map((item) => holidayCategory(item))),
      );
      titlesByIso[cell.iso] = items.map((item) =>
        holidayTitle(item, locale),
      );
    }

    return { categoriesByIso, titlesByIso };
  }, [grid.cells, holidays, holidaySets, hijriOffset, locale]);
  const selectedHolidays = holidaysForIso(
    holidays,
    selectedIso,
    holidaySets,
    hijriOffset,
  );

  function goToday() {
    const current = calendarDateFromIso(today, calendar, hijriOffset);

    if (!current) {
      return;
    }

    setMonth({ year: current.year, month: current.month });
    setSelectedIso(today);
    setTransactionFormOpen(false);
  }

  function changeMonth(delta: number) {
    const next = addCalendarMonths(month.year, month.month, delta);
    setMonth({ year: next.year, month: next.month });
    setTransactionFormOpen(false);
  }

  function selectDay(iso: string) {
    const selected = calendarDateFromIso(iso, calendar, hijriOffset);

    setSelectedIso(iso);
    setTransactionFormOpen(false);

    if (
      selected &&
      (selected.year !== month.year || selected.month !== month.month)
    ) {
      setMonth({ year: selected.year, month: selected.month });
    }
  }

  async function changeCalendar(nextCalendar: CalendarSystem) {
    if (nextCalendar === calendar || calendarPending) {
      return;
    }

    setCalendarPending(true);
    setCalendarStatus("idle");

    try {
      const supabase = createClient();

      await saveProfileCalendar(
        (values, options) =>
          supabase.from("profiles").upsert(values, options),
        {
          userId,
          calendar: nextCalendar,
          hijriOffset,
          locale,
        },
      );

      setCalendar(nextCalendar);

      const current = calendarDateFromIso(
        today,
        nextCalendar,
        hijriOffset,
      );

      if (current) {
        setMonth({ year: current.year, month: current.month });
      }

      setTransactionFormOpen(false);
      setCalendarStatus("saved");
    } catch (error) {
      console.error("Calendar page display calendar save failed", error);
      setCalendarStatus("error");
    } finally {
      setCalendarPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <TodayHero
        todayIso={today}
        calendar={calendar}
        hijriOffset={hijriOffset}
        locale={locale}
        monthNames={monthNames}
      />

      <ZodiacCard todayIso={today} birthDate={initialProfile.birthDate} />

      <section className="rounded-2xl border border-line bg-surface/60 p-4 sm:p-5">
        <CalendarQuickSwitcher
          calendar={calendar}
          pending={calendarPending}
          onChange={changeCalendar}
        />

        {calendarStatus === "saved" ? (
          <div className="mt-3">
            <Alert tone="success">{t("page.calendarSaved")}</Alert>
          </div>
        ) : null}
        {calendarStatus === "error" ? (
          <div className="mt-3">
            <Alert>{t("page.calendarSaveError")}</Alert>
          </div>
        ) : null}

        {ledgersError ? (
          <div className="mt-4 space-y-3 border-t border-line/60 pt-4">
            <Alert>{t("page.ledgersLoadError")}</Alert>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.refresh()}
            >
              {t("page.retry")}
            </Button>
          </div>
        ) : ledgers.length > 0 ? (
          <div className="mt-4 border-t border-line/60 pt-4">
            <SelectField
              label={t("page.ledgerLabel")}
              value={ledgerId ?? ""}
              onChange={(event) => {
                setManualLedgerId(event.target.value);
                setTransactionFormOpen(false);
              }}
            >
              {ledgers.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>
                  {ledger.name}
                </option>
              ))}
            </SelectField>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label={t("previousMonth")}
            className="flex size-9 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 rtl:-scale-x-100"
            >
              <path d="m14.5 6-6 6 6 6" />
            </svg>
          </button>

          <div className="min-w-0 text-center">
            <p className="truncate text-base font-semibold text-ink sm:text-lg">
              {monthTitle}
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              {t(`systems.${calendar}`)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label={t("nextMonth")}
            className="flex size-9 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 rtl:-scale-x-100"
            >
              <path d="m9.5 6 6 6-6 6" />
            </svg>
          </button>
        </div>

        <div className="mt-3 flex justify-center">
          <Button type="button" variant="secondary" onClick={goToday}>
            {t("today")}
          </Button>
        </div>

        <div className="mt-4">
          <CalendarMonthGrid
            calendar={calendar}
            hijriOffset={hijriOffset}
            locale={locale}
            weekStart={weekStart}
            selectedIso={selectedIso}
            todayIso={today}
            onSelect={selectDay}
            grid={grid}
            holidayCategoriesByIso={holidayMaps.categoriesByIso}
            holidayTitlesByIso={holidayMaps.titlesByIso}
            transactionCountsByIso={transactionCountsByIso}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-line/60 pt-3">
          {(["cultural", "official", "religious"] as const).map(
            (category) => (
              <span
                key={category}
                className="inline-flex items-center gap-1.5 text-[10px] text-muted"
              >
                <span
                  aria-hidden="true"
                  className={`size-1.5 rounded-full ${CATEGORY_DOT[category]}`}
                />
                {categories(category)}
              </span>
            ),
          )}
        </div>
      </section>

      <DayDetailsPanel
        iso={selectedIso}
        calendar={calendar}
        hijriOffset={hijriOffset}
        locale={locale}
        monthNames={monthNames}
        holidays={selectedHolidays}
        holidaysError={holidaysError}
        ledger={selectedLedger}
        defaultCurrency={defaultCurrency}
        contacts={ledgerData.contacts}
        transactions={transactionsByIso[selectedIso] ?? []}
        loading={ledgerData.loading}
        error={ledgerData.error}
        onRetry={ledgerData.reload}
        formOpen={transactionFormOpen}
        onOpenForm={() => setTransactionFormOpen(true)}
        onCloseForm={() => setTransactionFormOpen(false)}
        createTransaction={ledgerData.createTransaction}
        createContact={ledgerData.createContact}
      />
    </div>
  );
}
