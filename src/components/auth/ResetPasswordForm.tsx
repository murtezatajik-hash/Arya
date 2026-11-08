"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { authErrorKey, type AuthErrorKey } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";

type Status = "checking" | "ready" | "invalid" | "updated";

const linkClass =
  "w-fit rounded-sm text-sm text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;

    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!active) {
          return;
        }
        setStatus(data.session ? "ready" : "invalid");
      })
      .catch(() => {
        if (active) {
          setStatus("invalid");
        }
      });

    return () => {
      active = false;
    };
  }, []);

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
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorKey(authErrorKey(error));
        return;
      }

      setStatus("updated");
      router.refresh();
    } catch {
      setErrorKey("generic");
    } finally {
      setPending(false);
    }
  }

  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Spinner className="text-accent" />
        <span>{common("loading")}</span>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="space-y-4">
        <Alert>
          <span className="block font-medium">{t("resetPassword.invalidTitle")}</span>
          <span className="mt-1 block text-xs leading-5 opacity-80">
            {t("resetPassword.invalidDescription")}
          </span>
        </Alert>
        <ButtonLink href="/forgot-password" className="w-full sm:w-auto">
          {t("resetPassword.requestNewLink")}
        </ButtonLink>
        <Link href="/login" className={linkClass}>
          {t("forgotPassword.backToLogin")}
        </Link>
      </div>
    );
  }

  if (status === "updated") {
    return (
      <div className="space-y-4">
        <Alert tone="success">{t("messages.passwordUpdated")}</Alert>
        <ButtonLink href="/ledgers" className="w-full sm:w-auto">
          {t("resetPassword.goToLedgers")}
        </ButtonLink>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        {t("resetPassword.submit")}
      </Button>

      <Link href="/login" className={linkClass}>
        {t("forgotPassword.backToLogin")}
      </Link>
    </form>
  );
}
