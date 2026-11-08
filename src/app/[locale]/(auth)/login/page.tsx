import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import type { AuthErrorKey } from "@/lib/auth/errors";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const t = await getTranslations("auth.login");
  const { error } = await searchParams;
  const initialError: AuthErrorKey | undefined =
    error === "auth" ? "callback" : undefined;

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <LoginForm initialError={initialError} />
    </AuthCard>
  );
}
