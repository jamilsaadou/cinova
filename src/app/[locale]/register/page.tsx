import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session) redirect(`/${locale}/espace`);

  const t = await getTranslations("auth.register");
  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <RegisterForm />
    </AuthShell>
  );
}
