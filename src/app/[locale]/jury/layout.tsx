import { setRequestLocale } from "next-intl/server";
import { requireJury } from "@/lib/jury";
import { JuryChrome } from "@/components/jury/JuryChrome";

export default async function JuryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireJury();

  return (
    <JuryChrome user={{ name: user.name ?? null, email: user.email ?? null }}>
      {children}
    </JuryChrome>
  );
}
