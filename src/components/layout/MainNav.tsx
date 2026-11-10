"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type MainNavProps = {
  variant: "side" | "bottom";
};

type NavItem = {
  href: "/ledgers" | "/calendar";
  labelKey: "ledgers" | "calendar";
  icon: "ledger" | "calendar";
};

const ITEMS: NavItem[] = [
  { href: "/ledgers", labelKey: "ledgers", icon: "ledger" },
  { href: "/calendar", labelKey: "calendar", icon: "calendar" },
];

function NavIcon({ icon }: { icon: NavItem["icon"] }) {
  if (icon === "ledger") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v12.5H8a2 2 0 0 1-2-2V4.5Z" />
        <path d="M6 17.5a2 2 0 0 1 2-2h10" />
        <path d="M9.5 8.5h5M9.5 11.5h5" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M8 3.5v4M16 3.5v4M3.5 10h17" />
      <path d="M7.5 13.5h.01M12 13.5h.01M16.5 13.5h.01M7.5 17h.01M12 17h.01" />
    </svg>
  );
}

function isActive(pathname: string, href: NavItem["href"]): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav({ variant }: MainNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  if (variant === "side") {
    return (
      <nav
        aria-label={t("label")}
        className="flex flex-col gap-1"
      >
        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted/60 rtl:tracking-normal">
          {t("label")}
        </p>
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                active
                  ? "border-accent/25 bg-accent/10 text-accent"
                  : "border-transparent text-muted hover:border-line hover:bg-surface/60 hover:text-ink",
              )}
            >
              <NavIcon icon={item.icon} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label={t("label")}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-canvas/95 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-18px_50px_-28px_rgba(0,0,0,0.95)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-1 px-3">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                active ? "text-accent" : "text-muted hover:text-ink",
              )}
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-5 -top-1.5 h-0.5 rounded-full bg-accent"
                />
              ) : null}
              <NavIcon icon={item.icon} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
