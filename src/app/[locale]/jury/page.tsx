import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireJury, getTeamsToEvaluate } from "@/lib/jury";
import { getActiveEdition, CHALLENGE_CODE_TO_KEY } from "@/lib/candidature";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { IconCheck, IconArrowRight } from "@/components/icons";

export const metadata: Metadata = { title: "Espace jury" };
export const dynamic = "force-dynamic";

const REGIONS = [
  "AGADEZ", "DIFFA", "DOSSO", "MARADI", "NIAMEY", "TAHOUA", "TILLABERI", "ZINDER",
] as const;
const filterCls =
  "rounded-xl border border-sand bg-cream px-3 py-2.5 text-sm text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green/20";

export default async function JuryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ challengeId?: string; region?: string; q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const jury = await requireJury();
  const sp = await searchParams;

  const [teams, edition] = await Promise.all([
    getTeamsToEvaluate(jury.id, sp),
    getActiveEdition(),
  ]);

  const t = await getTranslations("juryspace");
  const tRegions = await getTranslations("regions");
  const tCh = await getTranslations("challenges");
  const challengeName = (code?: string | null) =>
    code ? tCh(`items.${CHALLENGE_CODE_TO_KEY[code] ?? "alert"}.title`) : "—";

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <Reveal>
        <p className="eyebrow text-accent-600">{t("collegeLabel")}</p>
        <h1 className="font-display text-3xl font-bold text-forest">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("subtitle")}</p>
      </Reveal>

      {/* Filtres */}
      <Reveal delay={60} className="mt-8">
        <form method="get" className="flex flex-wrap gap-3 rounded-2xl border border-sand bg-cream-50 p-4">
          <input name="q" defaultValue={sp.q ?? ""} placeholder={t("search")} className={filterCls} />
          <select name="challengeId" defaultValue={sp.challengeId ?? ""} className={filterCls}>
            <option value="">{t("allChallenges")}</option>
            {(edition?.challenges ?? []).map((c) => (
              <option key={c.id} value={c.id}>{challengeName(c.code)}</option>
            ))}
          </select>
          <select name="region" defaultValue={sp.region ?? ""} className={filterCls}>
            <option value="">{t("allRegions")}</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{tRegions(r)}</option>
            ))}
          </select>
          <button className="rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-700">
            {t("filter")}
          </button>
          <Link href="/jury" className="rounded-xl border border-sand px-4 py-2.5 text-sm font-semibold text-forest-700 transition hover:border-green">
            {t("reset")}
          </Link>
        </form>
      </Reveal>

      <Reveal delay={100} className="mt-5 space-y-3">
        {teams.map((team) => {
          const evaluated = team.evaluations.some((e) => e.submitted);
          const isDraft = !evaluated && team.evaluations.length > 0;
          return (
            <div key={team.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sand bg-cream-50 p-5">
              <div>
                <p className="font-display font-semibold text-forest-700">{team.name}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {challengeName(team.challenge?.code)}
                  {team.region ? ` · ${tRegions(team.region)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {evaluated ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green/15 px-3 py-1 text-xs font-semibold text-green">
                    <IconCheck className="h-4 w-4" /> {t("evaluated")}
                  </span>
                ) : isDraft ? (
                  <span className="rounded-full bg-olive/20 px-3 py-1 text-xs font-semibold text-olive">
                    {t("draftBadge")}
                  </span>
                ) : (
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-600">
                    {t("toEvaluate")}
                  </span>
                )}
                <Link
                  href={`/jury/evaluer/${team.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-green px-5 py-2 text-sm font-semibold text-cream-50 transition hover:bg-forest-700"
                >
                  {evaluated ? t("edit") : t("evaluate")}
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
        {teams.length === 0 && (
          <div className="rounded-2xl border border-sand bg-cream-50 p-10 text-center text-muted">
            {t("empty")}
          </div>
        )}
      </Reveal>
    </div>
  );
}
