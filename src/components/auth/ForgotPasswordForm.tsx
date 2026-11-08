"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { authErrorKey, type AuthErrorKey } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const backLinkClass =
  "w-fit rounded-sm text-sm text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorKey(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(
        String(formData.get("email") ?? "").trim(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/reset-password`,
        },
      );

      if (error) {
        setErrorKey(authErrorKey(error));
        return;
      }

      setSent(true);
    } catch {
      setErrorKey("generic");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <Alert tone="success">{t("messages.resetSent")}</Alert>
        <p className="text-xs leading-5 text-muted">
          {t("messages.checkSpam")}
        </p>
        <Link href="/login" className={backLinkClass}>
          {t("forgotPassword.backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label={common("email")}
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          placeholder={common("emailPlaceholder")}
          required
        />

        {errorKey ? <Alert>{t(`errors.${errorKey}`)}</Alert> : null}

        <Button
          type="submit"
          loading={pending}
          loadingLabel={common("loading")}
          className="w-full"
        >
          {t("forgotPassword.submit")}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => router.replace("/login")}
        className={backLinkClass}
      >
        {t("forgotPassword.backToLogin")}
      </button>
    </div>
  );
}
