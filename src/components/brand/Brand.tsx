import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Brand() {
  const t = useTranslations("brand");

  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      <span
        aria-hidden="true"
        className="relative flex size-9 items-center justify-center rounded-xl border border-accent/25 bg-gradient-to-br from-accent/20 to-accent-strong/5 shadow-[0_0_24px_-8px_rgba(244,63,94,0.55)]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5 text-accent"
        >
          <path d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v12.5H8a2 2 0 0 1-2-2V4.5Z" />
          <path d="M6 17.5a2 2 0 0 1 2-2h10" />
          <path d="M9.5 8.5h5M9.5 11.5h5" />
          <circle cx="15.5" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="flex flex-col text-start leading-none">
        <span className="text-sm font-semibold tracking-tight text-ink transition-colors group-hover:text-accent">
          {t("name")}
        </span>
        <span className="mt-1 text-[11px] text-muted">{t("tagline")}</span>
      </span>
    </Link>
  );
}
