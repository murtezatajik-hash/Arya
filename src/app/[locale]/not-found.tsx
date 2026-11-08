import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Brand } from "@/components/brand/Brand";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 size-[30rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />
      <div className="relative z-10 flex flex-col items-center">
        <Brand />
        <p className="mt-10 text-6xl font-semibold tracking-tight text-accent/90">
          {t("code")}
        </p>
        <h1 className="mt-3 text-xl font-semibold text-ink">{t("title")}</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
          {t("description")}
        </p>
        <ButtonLink href="/" className="mt-7">
          {t("backHome")}
        </ButtonLink>
      </div>
    </main>
  );
}
