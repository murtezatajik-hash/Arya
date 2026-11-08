import { getTranslations } from "next-intl/server";
import { Brand } from "@/components/brand/Brand";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("footer");

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-56 right-0 size-[28rem] rounded-full bg-accent-strong/5 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-5 sm:px-8 sm:py-6">
        <Brand />
        <LocaleSwitcher />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-10 pt-2 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="relative z-10 px-5 pb-6 text-center">
        <p className="text-[11px] text-muted/70">{t("note")}</p>
      </footer>
    </div>
  );
}
