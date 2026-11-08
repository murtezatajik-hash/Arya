import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth.resetPassword");

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <ResetPasswordForm />
    </AuthCard>
  );
}
