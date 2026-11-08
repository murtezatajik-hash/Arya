"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { authErrorKey, type AuthErrorKey } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const strongLinkClass =
  "w-fit rounded-sm text-sm font-medium text-accent transition-colors hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function RegisterForm() {
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

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setErrorKey("passwordMismatch");
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: String(formData.get("email") ?? "").trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/ledgers`,
        },
      });

      if (error) {
        setErrorKey(authErrorKey(error));
        return;
      }

      if (data.session) {
        router.replace("/ledgers");
        router.refresh();
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
        <Alert tone="success">{t("messages.confirmationSent")}</Alert>
        <p className="text-xs leading-5 text-muted">
          {t("messages.checkSpam")}
        </p>
        <Link href="/login" className={strongLinkClass}>
          {t("register.loginLink")}
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
        <TextField
          label={common("password")}
          name="password"
          type="password"
          dir="ltr"
          autoComplete="new-password"
          placeholder={common("passwordPlaceholder")}
          hint={common("passwordHint")}
          minLength={6}
          required
        />
        <TextField
          label={common("confirmPassword")}
          name="confirmPassword"
          type="password"
          dir="ltr"
          autoComplete="new-password"
          placeholder={common("passwordPlaceholder")}
          minLength={6}
          required
        />

        {errorKey ? <Alert>{t(`errors.${errorKey}`)}</Alert> : null}

        <Button
          type="submit"
          loading={pending}
          loadingLabel={common("loading")}
          className="w-full"
        >
          {t("register.submit")}
        </Button>
      </form>

      <p className="text-sm text-muted">
        {t("register.hasAccount")}{" "}
        <Link href="/login" className={strongLinkClass}>
          {t("register.loginLink")}
        </Link>
      </p>
    </div>
  );
}
