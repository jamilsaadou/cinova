import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Se connecter" };

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session) redirect(`/${locale}/espace`);

  const t = await getTranslations("auth.login");
  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <LoginForm />
    </AuthShell>
  );
}
