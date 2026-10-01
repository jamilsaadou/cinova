import { BENEFICIARY_KEYS, HEARD_ABOUT_KEYS } from "@/lib/candidature-options";
import { requireBackoffice } from "@/lib/admin";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getStatsDetail } from "@/lib/admin";
import { getVisitStats } from "@/lib/analytics";
import { CHALLENGE_CODE_TO_KEY } from "@/lib/candidature";
import { Reveal } from "@/components/Reveal";
import { Kpi, Breakdown } from "@/components/admin/widgets";
import { Donut, VBars, AreaChart, CHART_COLORS } from "@/components/charts";
import { IconSpark, IconCheck, IconUsers, IconShield, IconMap, IconClock } from "@/components/icons";

export const metadata: Metadata = { title: "Statistiques" };
export const dynamic = "force-dynamic";

const REGIONS = [
  "AGADEZ", "DIFFA", "DOSSO", "MARADI", "NIAMEY", "TAHOUA", "TILLABERI", "ZINDER",
] as const;
const CHALLENGE_CODES = ["AGROECOLOGY", "ADVISORY", "ALERT", "MARKET", "INPUTS", "WARRANTAGE", "COOP", "SOIL", "RELIABILITY"] as const;
const STATUS_LIST = ["SUBMITTED", "UNDER_REVIEW", "PRESELECTED", "REJECTED", "FINALIST", "WINNER"] as const;

const COUNTRY_NAMES: Record<string, string> = {
  NE: "Niger", FR: "France", NG: "Nigeria", BF: "Burkina Faso", ML: "Mali",
  CI: "Côte d'Ivoire", TD: "Tchad", BJ: "Bénin", SN: "Sénégal", TG: "Togo",
  GH: "Ghana", DZ: "Algérie", MA: "Maroc", US: "États-Unis", CA: "Canada", BE: "Belgique",
};
function flagEmoji(code: string) {
  if (code.length !== 2) return "🏳️";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-sand bg-cream-50 p-5">
      <h2 className="font-display mb-4 flex items-center gap-2 text-sm font-semibold text-forest-700">
        {icon && <span className="text-green">{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireBackoffice();

  const [stats, visits] = await Promise.all([getStatsDetail(), getVisitStats()]);
  const t = await getTranslations("admin");
  const tStatus = await getTranslations("status");
  const tRegions = await getTranslations("regions");
  const tTracks = await getTranslations("tracks");
  const tCh = await getTranslations("challenges");
  const tb = await getTranslations("beneficiaries");
  const th = await getTranslations("heardAbout");
  const tp = await getTranslations("espace.projet");
  const tGenders = await getTranslations("genders");

  const countryLabel = (code: string) =>
    code === "??" ? t("unknownCountry") : `${flagEmoji(code)} ${COUNTRY_NAMES[code] ?? code}`;

  const trackSegments = [
    { label: tTracks("creation.title"), value: stats.byTrack.CREATION ?? 0, color: CHART_COLORS[0] },
    { label: tTracks("adaptation.title"), value: stats.byTrack.ADAPTATION ?? 0, color: CHART_COLORS[1] },
  ];
  const statusSegments = STATUS_LIST.map((s, i) => ({
    label: tStatus(s),
    value: stats.byStatus[s] ?? 0,
    color: CHART_COLORS[i % CHART_COLORS.length],
  })).filter((s) => s.value > 0);

  const funnel = [
    { label: t("funnelVisitors"), value: visits.engagement.visitors, rate: 1 },
    { label: t("funnelRegistrations"), value: visits.engagement.registrations, rate: visits.engagement.regRate },
    { label: t("funnelSubmissions"), value: visits.engagement.submissions, rate: visits.engagement.subRate },
  ];
  const funnelMax = Math.max(1, ...funnel.map((f) => f.value));

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <Reveal>
        <p className="eyebrow text-accent-600">{t("eyebrow")}</p>
        <h1 className="font-display text-3xl font-bold text-forest">{t("navStats")}</h1>
        <p className="mt-2 text-muted">{t("statsSubtitle")}</p>
      </Reveal>

      {/* KPIs candidatures */}
      <Reveal delay={60} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi icon={<IconSpark className="h-5 w-5" />} label={t("kpiTotal")} value={stats.total} />
        <Kpi icon={<IconCheck className="h-5 w-5" />} label={t("kpiSubmitted")} value={stats.submitted} accent />
        <Kpi icon={<IconUsers className="h-5 w-5" />} label={t("kpiMembers")} value={stats.totalMembers} />
        <Kpi icon={<IconShield className="h-5 w-5" />} label={t("kpiNeedsDev")} value={stats.needsDev} />
      </Reveal>

      {/* KPIs trafic */}
      <Reveal delay={90} className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi icon={<IconMap className="h-5 w-5" />} label={t("kpiVisits")} value={visits.totalViews} />
        <Kpi icon={<IconUsers className="h-5 w-5" />} label={t("kpiVisitors")} value={visits.uniqueVisitors} accent />
        <div className="rounded-2xl border border-sand bg-cream-50 p-5">
          <p className="font-display text-2xl font-bold text-forest">{pct(visits.engagement.regRate)}</p>
          <p className="text-xs uppercase tracking-wide text-muted">{t("kpiRegRate")}</p>
        </div>
        <div className="rounded-2xl border border-sand bg-cream-50 p-5">
          <p className="font-display text-2xl font-bold text-forest">{pct(visits.engagement.subRate)}</p>
          <p className="text-xs uppercase tracking-wide text-muted">{t("kpiSubRate")}</p>
        </div>
      </Reveal>

      {/* Trafic : aire + heures */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Reveal delay={120}>
          <Card title={t("visitsPerDay")} icon={<IconMap className="h-4 w-4" />}>
            <AreaChart data={visits.viewsByDay} />
          </Card>
        </Reveal>
        <Reveal delay={140}>
          <Card title={t("visitsPerHour")} icon={<IconClock className="h-4 w-4" />}>
            <VBars data={visits.byHour} labelEvery={3} color="var(--color-olive)" />
          </Card>
        </Reveal>
      </div>

      {/* Pays + entonnoir */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Reveal delay={160}>
          {visits.topCountries.length > 0 ? (
            <Breakdown
              title={t("topCountries")}
              entries={visits.topCountries.map((c) => [countryLabel(c.code), c.value])}
            />
          ) : (
            <Card title={t("topCountries")}>
              <p className="text-sm text-muted">{t("noData")}</p>
            </Card>
          )}
        </Reveal>
        <Reveal delay={180}>
          <Card title={t("engagementTitle")}>
            <ul className="space-y-3">
              {funnel.map((f, i) => (
                <li key={i}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink/85">{f.label}</span>
                    <span className="font-semibold text-forest-700">
                      {f.value}
                      {i > 0 && <span className="ml-2 text-xs text-accent-600">{pct(f.rate)}</span>}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-sand">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green to-forest-700"
                      style={{ width: `${(f.value / funnelMax) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">{t("engagementHint")}</p>
          </Card>
        </Reveal>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title={tp("beneficiaries")}>
          <p className="mb-3 text-xs text-muted">{t("beneficiaryHint")}</p>
          <Breakdown title={tp("beneficiaries")} entries={[...BENEFICIARY_KEYS.map((key): [string, number] => [tb(key), stats.byBeneficiary[key] ?? 0]), [t("unanswered"), stats.missingBeneficiaries]]} />
        </Card>
        <Breakdown title={tp("heardAbout")} entries={[...HEARD_ABOUT_KEYS.map((key): [string, number] => [th(key), stats.byHeardAbout[key] ?? 0]), [t("unanswered"), stats.missingHeardAbout]]} />
      </div>
      {/* Donuts + répartitions */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Reveal delay={200}>
          <Card title={t("byTrack")}>
            <Donut segments={trackSegments} centerLabel={t("kpiSubmitted")} />
          </Card>
        </Reveal>
        <Reveal delay={220}>
          <Card title={t("byStatus")}>
            {statusSegments.length > 0 ? (
              <Donut segments={statusSegments} />
            ) : (
              <p className="text-sm text-muted">{t("noData")}</p>
            )}
          </Card>
        </Reveal>
        <Reveal delay={240}>
          <Breakdown
            title={t("byChallenge")}
            entries={CHALLENGE_CODES.map((c) => [tCh(`items.${CHALLENGE_CODE_TO_KEY[c]}.title`), stats.byChallenge[c] ?? 0])}
          />
        </Reveal>
        <Reveal delay={260}>
          <Breakdown
            title={t("byRegion")}
            entries={REGIONS.map((r) => [tRegions(r), stats.byRegion[r] ?? 0])}
          />
        </Reveal>
        <Reveal delay={280} className="lg:col-span-2">
          <Breakdown
            title={t("byGender")}
            entries={[
              [tGenders("FEMALE"), stats.gender.FEMALE ?? 0],
              [tGenders("MALE"), stats.gender.MALE ?? 0],
              [tGenders("UNDISCLOSED"), (stats.gender.UNDISCLOSED ?? 0) + (stats.gender.NA ?? 0)],
            ]}
          />
        </Reveal>
      </div>
    </div>
  );
}
