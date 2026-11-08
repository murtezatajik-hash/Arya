import { getTranslations } from "next-intl/server";
import { signOutAction } from "@/app/[locale]/dashboard/actions";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/routing";

export async function SignOutButton({ locale }: { locale: Locale }) {
  const t = await getTranslations("dashboard");

  return (
    <form action={signOutAction.bind(null, locale)}>
      <Button
        type="submit"
        variant="secondary"
        className="w-full sm:w-auto"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 rtl:-scale-x-100"
        >
          <path d="M14 8.5V6a1.5 1.5 0 0 0-1.5-1.5h-7A1.5 1.5 0 0 0 4 6v12a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 14 18v-2.5" />
          <path d="M10 12h10m0 0-3-3m3 3-3 3" />
        </svg>
        {t("signOut")}
      </Button>
    </form>
  );
}
