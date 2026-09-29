import { getTranslations } from "next-intl/server";
import { CHALLENGE_CODE_TO_KEY } from "@/lib/candidature";
import { Link } from "@/i18n/navigation";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import type { RankRow } from "@/lib/ranking";

const REGIONS = [
  "AGADEZ", "DIFFA", "DOSSO", "MARADI", "NIAMEY", "TAHOUA", "TILLABERI", "ZINDER",
] as const;
const filterCls =
  "rounded-xl border border-sand bg-cream px-3 py-2.5 text-sm text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green/20";

export async function RankingView({
  rows,
  challenges,
  filters,
  basePath,
}: {
  rows: RankRow[];
  challenges: { id: string; code: string }[];
  filters: { challengeId?: string; region?: string; q?: string };
  basePath: string;
}) {
  const t = await getTranslations("ranking");
  const tRegions = await getTranslations("regions");
  const tCh = await getTranslations("challenges");
  const challengeName = (code?: string | null) =>
    code ? tCh(`items.${CHALLENGE_CODE_TO_KEY[code] ?? "alert"}.title`) : "—";

  return (
    <div>
      {/* En-tête d'impression (visible uniquement à l'impression) */}
      <div className="print-only mb-6 hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/cinova-logo.png" alt="CINOVA" style={{ height: 44 }} />
        <h2 style={{ marginTop: 8, fontWeight: 700, fontSize: 18 }}>{t("printTitle")}</h2>
        <p style={{ fontSize: 12, color: "#5b6650" }}>
          {new Date().toLocaleDateString("fr")}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-accent-600">{t("eyebrow")}</p>
          <h1 className="font-display text-3xl font-bold text-forest">{t("title")}</h1>
          <p className="mt-2 text-muted">{t("subtitle")}</p>
        </div>
        <ExportPdfButton label={t("export")} />
      </div>

      {/* Filtres */}
      <form method="get" className="no-print mb-5 flex flex-wrap gap-3 rounded-2xl border border-sand bg-cream-50 p-4">
        <input name="q" defaultValue={filters.q ?? ""} placeholder={t("search")} className={filterCls} />
        <select name="challengeId" defaultValue={filters.challengeId ?? ""} className={filterCls}>
          <option value="">{t("allChallenges")}</option>
          {challenges.map((c) => (
            <option key={c.id} value={c.id}>{challengeName(c.code)}</option>
          ))}
        </select>
        <select name="region" defaultValue={filters.region ?? ""} className={filterCls}>
          <option value="">{t("allRegions")}</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{tRegions(r)}</option>
          ))}
        </select>
        <button className="rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-700">
          {t("filter")}
        </button>
        <Link href={basePath} className="rounded-xl border border-sand px-4 py-2.5 text-sm font-semibold text-forest-700 transition hover:border-green">
          {t("reset")}
        </Link>
      </form>

      {/* Tableau */}
      <div className="overflow-hidden rounded-2xl border border-sand print:border-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-cream-200/60 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("rank")}</th>
                <th className="px-4 py-3 font-semibold">{t("project")}</th>
                <th className="px-4 py-3 font-semibold">{t("challenge")}</th>
                <th className="px-4 py-3 font-semibold">{t("region")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("points")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("evals")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand bg-cream-50">
              {rows.map((r, i) => (
                <tr key={r.id} className="transition hover:bg-cream-200/40">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        i === 0
                          ? "bg-accent text-white"
                          : i < 3
                            ? "bg-green/15 text-green"
                            : "bg-sand/60 text-muted"
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-forest-700">
                    {r.name || "—"}
                    {r.vetoed && (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        {t("veto")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink/80">{challengeName(r.code)}</td>
                  <td className="px-4 py-3 text-ink/80">{r.region ? tRegions(r.region) : "—"}</td>
                  <td className="px-4 py-3 text-right font-display font-bold text-forest">
                    {r.avg != null ? `${r.avg}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-muted">{r.count}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">{t("empty")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
