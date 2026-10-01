import { requireBackoffice } from "@/lib/admin";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getRanking } from "@/lib/ranking";
import { getActiveEdition } from "@/lib/candidature";
import { RankingView } from "@/components/RankingView";

export const metadata: Metadata = { title: "Classement" };
export const dynamic = "force-dynamic";

export default async function AdminClassementPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ challengeId?: string; region?: string; q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireBackoffice();
  const sp = await searchParams;

  const [rows, edition] = await Promise.all([getRanking(sp), getActiveEdition()]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <RankingView
        rows={rows}
        challenges={(edition?.challenges ?? []).map((c) => ({ id: c.id, code: c.code }))}
        filters={sp}
        basePath="/admin/classement"
      />
    </div>
  );
}
