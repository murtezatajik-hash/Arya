import { getTranslations } from "next-intl/server";
import { Brand } from "@/components/brand/Brand";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { MainNav } from "@/components/layout/MainNav";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

type AppFrameProps = {
  children: React.ReactNode;
  locale: Locale;
};

export async function AppFrame({ children, locale }: AppFrameProps) {
  const t = await getTranslations("settings");

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-56 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-64 right-0 size-[30rem] rounded-full bg-accent-strong/5 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-line/60 bg-canvas/50 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Brand />
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              aria-label={t("open")}
              title={t("open")}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface/70 px-2.5 text-[11px] font-medium text-muted backdrop-blur transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
              >
                <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.86l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.35a1.7 1.7 0 0 0-1 .65 1.7 1.7 0 0 0-.35 1.05V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.7 19.3a1.7 1.7 0 0 0-1.86.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.35 15a1.7 1.7 0 0 0-.65-1 1.7 1.7 0 0 0-1.05-.35H2.5a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.3 8.7a1.7 1.7 0 0 0-.34-1.86l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.65 4.35a1.7 1.7 0 0 0 1-.65 1.7 1.7 0 0 0 .35-1.05V2.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 .65 1.41 1.7 1.7 0 0 0 1.86-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.65 8.7c.13.38.35.72.65 1 .3.28.66.4 1.05.35h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.95.95Z" />
              </svg>
              <span className="hidden sm:inline">{t("open")}</span>
              <span className="sr-only sm:hidden">{t("open")}</span>
            </Link>
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 gap-6 px-5 sm:px-8">
        <aside className="hidden w-48 shrink-0 py-8 lg:block">
          <div className="sticky top-8">
            <MainNav variant="side" />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="w-full flex-1 pb-28 pt-8 sm:pt-12 lg:pb-10">
            {children}
          </main>

          <footer className="w-full pb-28 lg:pb-8">
            <div className="flex justify-end border-t border-line/60 pt-5">
              <div className="w-full sm:w-auto">
                <SignOutButton locale={locale} />
              </div>
            </div>
          </footer>
        </div>
      </div>

      <MainNav variant="bottom" />
    </div>
  );
}
