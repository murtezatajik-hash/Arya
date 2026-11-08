import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { Brand } from "@/components/brand/Brand";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { routing } from "@/i18n/routing";

export default async function LedgersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const activeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-56 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-64 right-0 size-[30rem] rounded-full bg-accent-strong/5 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-line/60 bg-canvas/50 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Brand />
          <LocaleSwitcher />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
        {children}
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-8 sm:px-8">
        <div className="flex justify-end border-t border-line/60 pt-5">
          <div className="w-full sm:w-auto">
            <SignOutButton locale={activeLocale} />
          </div>
        </div>
      </footer>
    </div>
  );
}
