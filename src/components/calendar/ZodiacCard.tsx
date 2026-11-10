"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { zodiacSignForIso } from "@/lib/calendar/zodiac";

type ZodiacCardProps = {
  todayIso: string;
  birthDate: string | null;
};

function ZodiacSignBlock({
  title,
  sign,
  primaryLanguage,
}: {
  title: string;
  sign: string;
  primaryLanguage: "fa" | "en";
}) {
  const t = useTranslations("calendar.zodiac");
  const secondaryLanguage = primaryLanguage === "fa" ? "en" : "fa";

  return (
    <div className="rounded-xl border border-line/70 bg-surface/60 p-3.5">
      <p className="text-[11px] font-medium text-muted">{title}</p>
      <p className="mt-1 text-lg font-semibold text-ink">
        {t(`names.${sign}.${primaryLanguage}`)}
      </p>
      <p className="mt-0.5 text-xs text-muted/70">
        {t(`names.${sign}.${secondaryLanguage}`)}
      </p>
    </div>
  );
}

export function ZodiacCard({ todayIso, birthDate }: ZodiacCardProps) {
  const t = useTranslations("calendar.zodiac");
  const locale = useLocale();
  const primaryLanguage = locale.startsWith("fa") ? "fa" : "en";
  const todaySign = zodiacSignForIso(todayIso);
  const birthSign = birthDate ? zodiacSignForIso(birthDate) : null;

  if (!todaySign) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-line bg-surface/60 p-5 sm:p-6">
      <div className="grid gap-2 sm:grid-cols-2">
        <ZodiacSignBlock
          title={t("todayTitle")}
          sign={todaySign}
          primaryLanguage={primaryLanguage}
        />
        {birthSign ? (
          <ZodiacSignBlock
            title={t("birthTitle")}
            sign={birthSign}
            primaryLanguage={primaryLanguage}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-line/80 bg-surface/40 p-3.5">
            <p className="text-xs leading-5 text-muted">
              {t("addBirthDate")}
            </p>
            <Link
              href="/calendar/settings"
              className="mt-2 inline-flex rounded-sm text-xs font-medium text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {t("settingsLink")}
            </Link>
          </div>
        )}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted/70">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5 shrink-0"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
        {t("entertainment")}
      </p>
    </section>
  );
}
