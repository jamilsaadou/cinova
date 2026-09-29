import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { AuthShell } from "@/components/auth/AuthShell";
import { IconCheck, IconShield } from "@/components/icons";

export const metadata: Metadata = { title: "Vérification" };
export const dynamic = "force-dynamic";

type Status = "success" | "invalid" | "expired" | "missing";

async function verifyToken(token?: string): Promise<Status> {
  if (!token) return "missing";
  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt) return "invalid";
  if (vt.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return "expired";
  }
  await prisma.user.update({
    where: { email: vt.identifier },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.delete({ where: { token } });
  return "success";
}

export default async function VerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token } = await searchParams;
  const status = await verifyToken(token);
  const t = await getTranslations("auth.verify");

  const titleKey = `${status}Title` as const;
  const textKey = `${status}Text` as const;
  const ok = status === "success";

  return (
    <AuthShell title={t(titleKey)}>
      <div className="text-center">
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            ok ? "bg-green/15 text-green" : "bg-accent/15 text-accent-600"
          }`}
        >
          {ok ? <IconCheck className="h-7 w-7" /> : <IconShield className="h-7 w-7" />}
        </span>
        <p className="mt-4 text-sm text-muted">{t(textKey)}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-green px-6 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-700"
        >
          {t("toLogin")}
        </Link>
      </div>
    </AuthShell>
  );
}
