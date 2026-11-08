import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("common");

  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">{t("loading")}</span>

      <div className="space-y-3">
        <div className="h-3 w-20 animate-pulse rounded-full bg-line/60" />
        <div className="h-9 w-48 animate-pulse rounded-xl bg-line/60" />
        <div className="h-4 w-full max-w-md animate-pulse rounded-full bg-line/40" />
      </div>

      <div className="h-11 w-32 animate-pulse rounded-xl bg-line/50" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-36 animate-pulse rounded-2xl border border-line/70 bg-surface/60" />
        <div className="h-36 animate-pulse rounded-2xl border border-line/70 bg-surface/60" />
      </div>
    </div>
  );
}
