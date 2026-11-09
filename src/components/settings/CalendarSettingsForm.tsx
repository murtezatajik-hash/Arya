"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import {
  CALENDAR_SYSTEMS,
  HIJRI_OFFSETS,
  clampHijriOffset,
  formatCalendarNumber,
  type CalendarSystem,
} from "@/lib/dates/calendar";
import {
  formatDisplayDate,
  type CalendarMonthNames,
} from "@/lib/dates/display";
import { todayIso } from "@/lib/dates/values";
import { saveProfileCalendar } from "@/lib/profile/save-calendar";
import { createClient } from "@/lib/supabase/client";

type CalendarSettingsFormProps = {
  userId: string;
  initialCalendar: CalendarSystem;
  initialHijriOffset: number;
};

type SaveStatus = "idle" | "saved" | "error";

function formatOffset(value: number, locale: string): string {
  if (value === 0) {
    return formatCalendarNumber(0, locale);
  }

  const sign = value > 0 ? "+" : "-";
  return `${sign}${formatCalendarNumber(Math.abs(value), locale)}`;
}

export function CalendarSettingsForm({
  userId,
  initialCalendar,
  initialHijriOffset,
}: CalendarSettingsFormProps) {
  const t = useTranslations("settings");
  const calendarMessages = useTranslations("calendar");
  const locale = useLocale();
  const router = useRouter();
  const [calendar, setCalendar] =
    useState<CalendarSystem>(initialCalendar);
  const [hijriOffset, setHijriOffset] = useState(
    clampHijriOffset(initialHijriOffset),
  );
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [pending, setPending] = useState(false);
  const monthNames = calendarMessages.raw(
    "months",
  ) as CalendarMonthNames;
  const today = todayIso();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus("idle");

    try {
      const supabase = createClient();

      await saveProfileCalendar(
        (values, options) =>
          supabase.from("profiles").upsert(values, options),
        {
          userId,
          calendar,
          hijriOffset,
          locale,
        },
      );

      setStatus("saved");
      router.refresh();
    } catch (error) {
      console.error("Calendar settings save failed", error);
      setStatus("error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-line bg-surface/60 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] sm:p-6"
    >
      <fieldset>
        <legend className="text-base font-semibold text-ink">
          {t("calendarTitle")}
        </legend>
        <p className="mt-1 text-sm leading-6 text-muted">
          {t("calendarDescription")}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted/70">
          {t("calendarHint")}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {CALENDAR_SYSTEMS.map((system) => {
            const selected = calendar === system;

            return (
              <label
                key={system}
                className={cn(
                  "cursor-pointer rounded-2xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-accent/40 focus-within:ring-offset-2 focus-within:ring-offset-surface",
                  selected
                    ? "border-accent/50 bg-accent/10"
                    : "border-line bg-surface/70 hover:border-accent/30",
                )}
              >
                <input
                  type="radio"
                  name="calendar"
                  value={system}
                  checked={selected}
                  onChange={() => {
                    setCalendar(system);
                    setStatus("idle");
                  }}
                  className="sr-only"
                />

                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-ink">
                    {calendarMessages(`systems.${system}`)}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border",
                      selected
                        ? "border-accent bg-accent"
                        : "border-line",
                    )}
                  >
                    {selected ? (
                      <span className="size-1.5 rounded-full bg-canvas" />
                    ) : null}
                  </span>
                </span>

                <span className="mt-2 block text-xs leading-5 text-muted">
                  {t("preview")}:{" "}
                  <span className="text-ink/90">
                    {formatDisplayDate(today, {
                      calendar: system,
                      locale,
                      monthNames,
                      hijriOffset,
                    })}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {calendar === "hijri" ? (
          <div className="mt-4 rounded-2xl border border-line bg-surface/70 p-4">
            <SelectField
              label={t("hijriOffsetTitle")}
              value={String(hijriOffset)}
              onChange={(event) => {
                setHijriOffset(
                  clampHijriOffset(Number(event.target.value)),
                );
                setStatus("idle");
              }}
              hint={t("hijriOffsetDescription")}
            >
              {HIJRI_OFFSETS.map((offset) => (
                <option key={offset} value={offset}>
                  {formatOffset(offset, locale)}
                </option>
              ))}
            </SelectField>
          </div>
        ) : null}
      </fieldset>

      <div className="mt-5 space-y-3">
        {status === "saved" ? (
          <Alert tone="success">{t("saved")}</Alert>
        ) : null}
        {status === "error" ? <Alert>{t("errors.generic")}</Alert> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            loading={pending}
            loadingLabel={t("saving")}
          >
            {t("save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
