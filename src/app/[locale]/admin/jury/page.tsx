import { requireAdmin } from "@/lib/admin";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getJuryOverview } from "@/lib/jury";
import { CHALLENGE_CODE_TO_KEY } from "@/lib/candidature";
import { assignAction, unassignAction, autoAssignAction } from "@/lib/jury-admin-actions";
import { Reveal } from "@/components/Reveal";
import { IconCheck, IconScale } from "@/components/icons";

export const metadata: Metadata = { title: "Jury" };
export const dynamic = "force-dynamic";

export default async function AdminJuryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const { jurors, teams, juryCount, eligibleCount } = await getJuryOverview();

  const t = await getTranslations("juryAdmin");
  const tStatus = await getTranslations("status");
  const tRegions = await getTranslations("regions");
  const tCh = await getTranslations("challenges");
  const challengeName = (code?: string | null) =>
    code ? tCh(`items.${CHALLENGE_CODE_TO_KEY[code] ?? "alert"}.title`) : "—";

  const jurorName = (j: { name: string | null; email: string | null }) => j.name || j.email || "—";

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <Reveal>
        <p className="eyebrow text-accent-600">{t("eyebrow")}</p>
        <h1 className="font-display text-3xl font-bold text-forest">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("subtitle")}</p>
      </Reveal>

      {jurors.length === 0 ? (
        <Reveal delay={60} className="mt-8">
          <div className="rounded-2xl border border-sand bg-cream-50 p-10 text-center text-muted">
            {t("noJurors")}
          </div>
        </Reveal>
      ) : (
        <>
          {/* Auto-affectation */}
          <Reveal delay={60} className="mt-8">
            <div className="rounded-2xl border border-sand bg-cream-50 p-5">
              <h2 className="font-display text-sm font-semibold text-forest-700">{t("autoTitle")}</h2>
              <p className="mt-1 text-xs text-muted">{t("autoHint")}</p>
              <form action={autoAssignAction} className="mt-3 flex flex-wrap items-center gap-3">
                <input type="hidden" name="locale" value={locale} />
                <select
                  name="mode"
                  defaultValue="all"
                  className="rounded-xl border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-green"
                >
                  <option value="all">{t("modeAll")}</option>
                  <option value="roundrobin">{t("modeRoundRobin")}</option>
                  <option value="clear">{t("modeClear")}</option>
                </select>
                <button className="rounded-full bg-green px-5 py-2 text-sm font-semibold text-cream-50 transition hover:bg-forest-700">
                  {t("apply")}
                </button>
              </form>
            </div>
          </Reveal>

          {/* Avancement des jurés */}
          <Reveal delay={100} className="mt-6">
            <h2 className="mb-3 font-display text-lg font-semibold text-forest-700">{t("progressTitle")}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {jurors.map((j) => {
                const pct = j.assigned > 0 ? Math.round((j.submitted / j.assigned) * 100) : 0;
                return (
                  <div key={j.id} className="rounded-2xl border border-sand bg-cream-50 p-4">
                    <p className="truncate font-medium text-forest-700">{jurorName(j)}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">{j.email}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-sand">
                        <span className="block h-full rounded-full bg-green" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="text-xs font-medium text-forest-700">{j.submitted}/{j.assigned}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Affectation par équipe + quorum */}
          <Reveal delay={140} className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold text-forest-700">
              {t("teamsTitle", { count: eligibleCount })}
            </h2>
            {teams.length === 0 ? (
              <div className="rounded-2xl border border-sand bg-cream-50 p-10 text-center text-muted">
                {t("noTeams")}
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map((tm) => {
                  const assignedSet = new Set(tm.assignedIds);
                  const allJury = tm.assignedIds.length === 0;
                  return (
                    <div key={tm.id} className="rounded-2xl border border-sand bg-cream-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <IconScale className="h-4 w-4 text-green" />
                            <p className="font-display font-semibold text-forest-700">{tm.name}</p>
                          </div>
                          <p className="mt-0.5 text-sm text-muted">
                            {challengeName(tm.challengeCode)}
                            {tm.region ? ` · ${tRegions(tm.region)}` : ""} · {tStatus(tm.status)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            tm.quorumReached ? "bg-green/15 text-green" : "bg-accent/15 text-accent-600"
                          }`}
                        >
                          {tm.quorumReached && <IconCheck className="h-4 w-4" />}
                          {t("quorum", { done: tm.submittedCount, total: tm.expected })}
                        </span>
                      </div>

                      {allJury && (
                        <p className="mt-3 text-xs italic text-muted">{t("allJuryNote")}</p>
                      )}

                      {/* Toggles d'affectation par juré */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {jurors.map((j) => {
                          const on = assignedSet.has(j.id);
                          const action = on ? unassignAction : assignAction;
                          return (
                            <form key={j.id} action={action}>
                              <input type="hidden" name="locale" value={locale} />
                              <input type="hidden" name="teamId" value={tm.id} />
                              <input type="hidden" name="juryId" value={j.id} />
                              <button
                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                  on
                                    ? "border-green bg-green text-cream-50"
                                    : "border-sand text-forest-700 hover:border-green"
                                }`}
                                title={on ? t("clickToUnassign") : t("clickToAssign")}
                              >
                                {on ? "✓ " : "+ "}
                                {jurorName(j)}
                              </button>
                            </form>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-4 text-xs text-muted">{t("legend", { n: juryCount })}</p>
          </Reveal>
        </>
      )}
    </div>
  );
}
