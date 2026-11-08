"use client";

import { useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export default function LedgersError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ledgers");

  return (
    <div className="space-y-4">
      <Alert>{t("errors.load")}</Alert>
      <Button type="button" variant="secondary" onClick={reset}>
        {t("errors.retry")}
      </Button>
    </div>
  );
}
