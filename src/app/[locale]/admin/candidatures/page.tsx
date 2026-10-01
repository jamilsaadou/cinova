import { requireBackoffice } from "@/lib/admin";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listTeamsPaged, type TeamFilters } from "@/lib/admin";
import { getActiveEdition, CHALLENGE_CODE_TO_KEY } from "@/lib/candidature";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { IconDownload } from "@/components/icons";
import { CandidaturesTable, type Row } from "@/components/admin/CandidaturesTable";
import { Pagination } from "@/components/admin/Pagination";

export const metadata: Metadata = { title: "Candidatures" };
export const dynamic = "force-dynamic";

const STATUSES = [
  "DRAFT", "SUBMITTED", "UNDER_REVIEW", "PRESELECTED", "REJECTED", "FINALIST", "WINNER",
] as const;
const REGIONS = [
  "AGADEZ", "DIFFA", "DOSSO", "MARADI", "NIAMEY", "TAHOUA", "TILLABERI", "ZINDER",
] as const;

const filterCls =
  "w-full rounded-xl border border-sand bg-cream px-3 py-2.5 text-sm text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green/20";

export default async function AdminCandidaturesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const viewer = await requireBackoffice();
  const sp = await searchParams;

  const filters: TeamFilters = {
    status: sp.status,
    region: sp.region,
    challengeId: sp.challengeId,
    track: sp.track,
    q: sp.q,
  };

  const currentPage = Number(sp.page) || 1;
  const [paged, edition] = await Promise.all([
    listTeamsPaged(filters, currentPage),
    getActiveEdition(),
  ]);
  const teams = paged.rows;

  const t = await getTranslations("admin");
  const tStatus = await getTranslations("status");
  const tRegions = await getTranslations("regions");
  const tCh = await getTranslations("challenges");

  const challengeName = (code?: string | null) =>
    code ? tCh(`items.${CHALLENGE_CODE_TO_KEY[code] ?? "alert"}.title`) : "—";

  const rows: Row[] = teams.map((team) => ({
    id: team.id,
    name: team.name || t("untitled"),
    leader: team.leader.name ?? "—",
    email: team.leader.email ?? "",
    region: team.region ? tRegions(team.region) : "—",
    challenge: challengeName(team.challenge?.code),
    members: team._count.members,
    status: team.status,
    statusLabel: tStatus(team.status),
  }));

  // Statuts proposés pour l'action groupée (hors brouillon).
  const bulkStatuses = STATUSES.filter((s) => s !== "DRAFT").map((s) => ({
    value: s,
    label: tStatus(s),
  }));

  const tableLabels = {
    colProject: t("colProject"), colLeader: t("colLeader"), colRegion: t("colRegion"),
    colChallenge: t("colChallenge"), colMembers: t("colMembers"), colStatus: t("colStatus"),
    open: t("open"), empty: t("empty"), selected: t("selected"),
    chooseStatus: t("chooseStatus"), note: t("reviewNotePlaceholder"),
    notify: t("notifyCandidate"), apply: t("applyBulk"), bulkTitle: t("bulkTitle"),
  };

  // Lien d'export CSV conservant les filtres actifs.
  const exportQs = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v) as [string, string][],
  ).toString();
  const exportHref = `/api/admin/candidatures/export${exportQs ? `?${exportQs}` : ""}`;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <Reveal>
        <p className="eyebrow text-accent-600">{t("eyebrow")}</p>
        <h1 className="font-display text-3xl font-bold text-forest">{t("navApplications")}</h1>
        <p className="mt-2 text-muted">{t("subtitle")}</p>
      </Reveal>

      {/* Filtres */}
      <Reveal delay={60} className="mt-8">
        <form method="get" className="grid gap-3 rounded-2xl border border-sand bg-cream-50 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <input name="q" defaultValue={sp.q ?? ""} placeholder={t("searchPlaceholder")} className={filterCls} />
          <select name="status" defaultValue={sp.status ?? ""} className={filterCls}>
            <option value="">{t("allStatuses")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{tStatus(s)}</option>
            ))}
          </select>
          <select name="region" defaultValue={sp.region ?? ""} className={filterCls}>
            <option value="">{t("allRegions")}</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{tRegions(r)}</option>
            ))}
          </select>
          <select name="challengeId" defaultValue={sp.challengeId ?? ""} className={filterCls}>
            <option value="">{t("allChallenges")}</option>
            {(edition?.challenges ?? []).map((c) => (
              <option key={c.id} value={c.id}>{challengeName(c.code)}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button className="flex-1 rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-700">
              {t("filter")}
            </button>
            <Link href="/admin/candidatures" className="rounded-xl border border-sand px-4 py-2.5 text-sm font-semibold text-forest-700 transition hover:border-green">
              {t("reset")}
            </Link>
          </div>
        </form>
      </Reveal>

      {/* Liste */}
      <Reveal delay={100} className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">{t("resultsCount", { count: paged.total })}</p>
          <a
            href={exportHref}
            className="inline-flex items-center gap-2 rounded-full border border-sand px-4 py-2 text-sm font-semibold text-forest-700 transition hover:border-green hover:text-green"
          >
            <IconDownload className="h-4 w-4" />
            {t("exportCsv")}
          </a>
        </div>
        <CandidaturesTable readOnly={viewer.role === "AUDITOR"} rows={rows} statusOptions={bulkStatuses} labels={tableLabels} />
        <Pagination page={paged.page} pages={paged.pages} params={sp} basePath="/admin/candidatures" />
      </Reveal>
    </div>
  );
}
