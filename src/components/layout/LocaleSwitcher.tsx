"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="flex items-center gap-0.5 rounded-full border border-line bg-surface/70 p-0.5 backdrop-blur"
    >
      {routing.locales.map((item) => {
        const isActive = item === locale;

        return (
          <button
            key={item}
            type="button"
            onClick={() => switchLocale(item)}
            aria-pressed={isActive}
            disabled={isPending}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-70",
              isActive
                ? "bg-accent/15 text-accent"
                : "text-muted hover:text-ink",
            )}
          >
            {t(`locales.${item}`)}
          </button>
        );
      })}
    </div>
  );
}
