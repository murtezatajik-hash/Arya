"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { authErrorKey, type AuthErrorKey } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

type LoginFormProps = {
  initialError?: AuthErrorKey;
};

const linkClass =
  "w-fit rounded-sm text-sm text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const strongLinkClass =
  "rounded-sm font-medium text-accent transition-colors hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function LoginForm({ initialError }: LoginFormProps) {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const router = useRouter();
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(
    initialError ?? null,
  );
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorKey(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      });

      if (error) {
        setErrorKey(authErrorKey(error));
        return;
      }

      router.replace("/ledgers");
      router.refresh();
    } catch {
      setErrorKey("generic");
    } finally {
      setPending(false);
    }
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
          autoComplete="current-password"
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
          {t("login.submit")}
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        <Link href="/forgot-password" className={linkClass}>
          {t("login.forgotPassword")}
        </Link>
        <p className="text-sm text-muted">
          {t("login.noAccount")}{" "}
          <Link href="/register" className={strongLinkClass}>
            {t("login.registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
