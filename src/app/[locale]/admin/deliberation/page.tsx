import { requireAdmin } from "@/lib/admin";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDeliberation } from "@/lib/deliberation";
import { CHALLENGE_CODE_TO_KEY } from "@/lib/candidature";
import { publishResultsAction } from "@/lib/deliberation-actions";
import { Reveal } from "@/components/Reveal";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { IconTrophy, IconShield } from "@/components/icons";

export const metadata: Metadata = { title: "Délibération" };
export const dynamic = "force-dynamic";

export default async function DeliberationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ published?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const sp = await searchParams;

  const { groups, edition, published } = await getDeliberation();

  const t = await getTranslations("deliberation");
  const tStatus = await getTranslations("status");
  const tRegions = await getTranslations("regions");
  const tCh = await getTranslations("challenges");
  const challengeName = (code?: string | null) =>
    code ? tCh(`items.${CHALLENGE_CODE_TO_KEY[code] ?? "alert"}.title`) : t("noChallenge");

  const totalTeams = groups.reduce((n, g) => n + g.teams.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <Reveal>
        <p className="eyebrow text-accent-600">{t("eyebrow")}</p>
        <h1 className="font-display text-3xl font-bold text-forest">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("subtitle")}</p>
      </Reveal>

      {sp.published && (
        <div className="mt-6 rounded-xl border border-green/30 bg-green/10 px-4 py-3 text-sm font-medium text-green">
          {t("publishedOk")}
        </div>
      )}

      {published && edition?.resultsPublishedAt && (
        <div className="mt-6 rounded-xl border border-sand bg-cream-50 px-4 py-3 text-sm text-muted">
          {t("alreadyPublished", { date: edition.resultsPublishedAt.toLocaleString(locale) })}
        </div>
      )}

      {totalTeams === 0 ? (
        <Reveal delay={60} className="mt-8">
          <div className="rounded-2xl border border-sand bg-cream-50 p-10 text-center text-muted">
            {t("empty")}
          </div>
        </Reveal>
      ) : (
        <form action={publishResultsAction} className="mt-8 space-y-8">
          <input type="hidden" name="locale" value={locale} />

          {groups.map((g) => (
            <Reveal key={g.challengeId ?? "none"}>
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-forest-700">
                <IconTrophy className="h-5 w-5 text-green" />
                {challengeName(g.challengeCode)}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-sand">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-cream-200/60 text-left text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="px-4 py-3 font-semibold">{t("colWinner")}</th>
                        <th className="px-4 py-3 font-semibold">{t("colTeam")}</th>
                        <th className="px-4 py-3 font-semibold">{t("colRegion")}</th>
                        <th className="px-4 py-3 font-semibold">{t("colScore")}</th>
                        <th className="px-4 py-3 font-semibold">{t("colQuorum")}</th>
                        <th className="px-4 py-3 font-semibold">{t("colStatus")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand bg-cream-50">
                      {g.teams.map((tm) => (
                        <tr key={tm.id} className={`align-middle ${tm.vetoed ? "opacity-70" : ""}`}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              name="winnerIds"
                              value={tm.id}
                              defaultChecked={tm.proposedWinner}
                              className="h-4 w-4 accent-green"
                            />
                          </td>
                          <td className="px-4 py-3 font-medium text-forest-700">
                            {tm.name}
                            {tm.vetoed && (
                              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                <IconShield className="h-3 w-3" /> {t("veto")}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-ink/80">{tm.region ? tRegions(tm.region) : "—"}</td>
                          <td className="px-4 py-3">
                            <span className="font-display font-bold text-green">
                              {tm.avg !== null ? `${tm.avg}/100` : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={tm.quorumReached ? "text-green" : "text-accent-600"}>
                              {tm.count}/{tm.expected}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-ink/80">{tStatus(tm.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal>
            <div className="rounded-2xl border border-sand bg-cream-50 p-5">
              <label className="flex items-center gap-2.5 text-sm text-ink/85">
                <input type="checkbox" name="notify" defaultChecked className="h-4 w-4 accent-green" />
                {t("notifyWinners")}
              </label>
              <p className="mt-2 mb-4 text-xs text-muted">{t("publishHint")}</p>
              <ConfirmSubmit label={t("publish")} confirmLabel={t("confirmPublish")} cancelLabel={t("cancel")} />
            </div>
          </Reveal>
        </form>
      )}
    </div>
  );
}
