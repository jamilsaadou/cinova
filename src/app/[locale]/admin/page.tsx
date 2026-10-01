import { requireBackoffice } from "@/lib/admin";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listTeams, getAdminStats, getRegionQuota } from "@/lib/admin";
import { CHALLENGE_CODE_TO_KEY } from "@/lib/candidature";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { IconUsers, IconCheck, IconArrowRight, IconShield, IconSpark } from "@/components/icons";
import { Kpi, Breakdown, StatusBadge } from "@/components/admin/widgets";

export const metadata: Metadata = { title: "Administration" };
export const dynamic = "force-dynamic";

const REGIONS = [
  "AGADEZ", "DIFFA", "DOSSO", "MARADI", "NIAMEY", "TAHOUA", "TILLABERI", "ZINDER",
] as const;

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireBackoffice();

  const [stats, recent, quota] = await Promise.all([
    getAdminStats(),
    listTeams({}),
    getRegionQuota(),
  ]);

  const t = await getTranslations("admin");
  const tStatus = await getTranslations("status");
  const tRegions = await getTranslations("regions");
  const tCh = await getTranslations("challenges");
  const tGenders = await getTranslations("genders");

  const challengeName = (code?: string | null) =>
    code ? tCh(`items.${CHALLENGE_CODE_TO_KEY[code] ?? "alert"}.title`) : "—";

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <Reveal>
        <p className="eyebrow text-accent-600">{t("eyebrow")}</p>
        <h1 className="font-display text-3xl font-bold text-forest">{t("dashTitle")}</h1>
        <p className="mt-2 text-muted">{t("subtitle")}</p>
      </Reveal>

      <Reveal delay={60} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi icon={<IconSpark className="h-5 w-5" />} label={t("kpiTotal")} value={stats.total} />
        <Kpi icon={<IconCheck className="h-5 w-5" />} label={t("kpiSubmitted")} value={stats.submitted} accent />
        <Kpi icon={<IconShield className="h-5 w-5" />} label={tStatus("PRESELECTED")} value={stats.byStatus.PRESELECTED ?? 0} />
        <Kpi icon={<IconUsers className="h-5 w-5" />} label={t("kpiNeedsDev")} value={stats.needsDev} />
      </Reveal>

      <Reveal delay={100} className="mt-4 grid gap-4 lg:grid-cols-2">
        <Breakdown
          title={t("byRegion")}
          entries={REGIONS.map((r) => [tRegions(r), stats.byRegion[r] ?? 0])}
        />
        <Breakdown
          title={t("byGender")}
          entries={[
            [tGenders("FEMALE"), stats.gender.FEMALE ?? 0],
            [tGenders("MALE"), stats.gender.MALE ?? 0],
            [tGenders("UNDISCLOSED"), (stats.gender.UNDISCLOSED ?? 0) + (stats.gender.NA ?? 0)],
          ]}
        />
      </Reveal>

      {/* Quota régional */}
      {quota.target > 0 && (
        <Reveal delay={120} className="mt-4">
          <div className="rounded-2xl border border-sand bg-cream-50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-forest-700">{t("quotaTitle")}</h2>
              <span className="text-xs text-muted">{t("quotaTargetLabel", { n: quota.target })}</span>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {REGIONS.map((r) => {
                const n = quota.byRegion[r] ?? 0;
                const pct = Math.min(100, Math.round((n / quota.target) * 100));
                const reached = n >= quota.target;
                return (
                  <li key={r} className="flex items-center gap-3 text-sm">
                    <span className="w-20 flex-none text-muted">{tRegions(r)}</span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-sand">
                      <span
                        className={`block h-full rounded-full ${reached ? "bg-green" : "bg-accent"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className={`w-14 flex-none text-right font-medium ${reached ? "text-green" : "text-forest-700"}`}>
                      {n}/{quota.target}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      )}

      {/* Candidatures récentes */}
      <Reveal delay={140} className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-forest-700">{t("recent")}</h2>
          <Link href="/admin/candidatures" className="inline-flex items-center gap-1 text-sm font-semibold text-green hover:underline">
            {t("seeAll")} <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-sand">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-cream-200/60 text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("colProject")}</th>
                  <th className="px-4 py-3 font-semibold">{t("colRegion")}</th>
                  <th className="px-4 py-3 font-semibold">{t("colChallenge")}</th>
                  <th className="px-4 py-3 font-semibold">{t("colStatus")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sand bg-cream-50">
                {recent.slice(0, 6).map((team) => (
                  <tr key={team.id} className="transition hover:bg-cream-200/40">
                    <td className="px-4 py-3 font-medium text-forest-700">{team.name || t("untitled")}</td>
                    <td className="px-4 py-3 text-ink/80">{team.region ? tRegions(team.region) : "—"}</td>
                    <td className="px-4 py-3 text-ink/80">{challengeName(team.challenge?.code)}</td>
                    <td className="px-4 py-3"><StatusBadge status={team.status} label={tStatus(team.status)} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/candidatures/${team.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-green hover:underline">
                        {t("open")} <IconArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">{t("empty")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
