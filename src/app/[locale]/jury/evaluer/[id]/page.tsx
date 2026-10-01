import { AttachmentCard } from "@/components/AttachmentCard";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireJury, getTeamForJury, getCriteria, getMyEvaluation } from "@/lib/jury";
import { CHALLENGE_CODE_TO_KEY } from "@/lib/candidature";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { EvaluationForm } from "@/components/jury/EvaluationForm";
import { IconArrowRight, IconScale } from "@/components/icons";

export const metadata: Metadata = { title: "Évaluation" };
export const dynamic = "force-dynamic";

export default async function EvaluerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const jury = await requireJury();

  const [team, criteria, existing] = await Promise.all([
    getTeamForJury(id, jury.id),
    getCriteria(),
    getMyEvaluation(jury.id, id),
  ]);
  if (!team) notFound();

  const t = await getTranslations("juryspace");
  const tp = await getTranslations("espace.projet");
  const tCh = await getTranslations("challenges");
  const tRoles = await getTranslations("memberRoles");
  const tBen = await getTranslations("beneficiaries");
  const tHeard = await getTranslations("heardAbout");

  const challengeName = team.challenge?.code
    ? tCh(`items.${CHALLENGE_CODE_TO_KEY[team.challenge.code] ?? "alert"}.title`)
    : "—";
  const beneficiaries = team.beneficiaries ? team.beneficiaries.split(",") : [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          <Reveal>
            <Link href="/jury" className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 transition hover:text-green">
              <IconArrowRight className="h-4 w-4 rotate-180" />
              {t("back")}
            </Link>
            <h1 className="font-display mt-4 text-3xl font-bold text-forest">{team.name}</h1>
            <p className="mt-1 text-sm text-muted">{challengeName}</p>
          </Reveal>

          {/* Résumé du projet */}
          <Reveal delay={60} className="mt-8">
            <div className="space-y-4 rounded-2xl border border-sand bg-cream-50 p-6">
              <h2 className="font-display text-lg font-semibold text-forest-700">{t("projectTitle")}</h2>
              <Block label={tp("problem")} value={team.problem} />
              <Block label={tp("solution")} value={team.solution} />
              {beneficiaries.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">{tp("beneficiaries")}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {beneficiaries.map((b) => (
                      <span key={b} className="rounded-full bg-green/10 px-3 py-1 text-xs font-medium text-green">
                        {tBen(b)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <Block label={tp("description")} value={team.description} />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">{t("members")}</p>
                <p className="text-sm text-ink/85">
                  {team.members.map((m) => `${m.fullName} (${tRoles(m.role)})`).join(" · ")}
                </p>
              </div>
              <div><p className="text-xs uppercase text-muted">{tp("heardAbout")}</p><p className="text-sm">{team.heardAbout ? tHeard(team.heardAbout) : "—"}</p></div>
              {team.attachments.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {team.attachments.map((a) => (
                    <AttachmentCard key={a.id} attachment={a} />
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          {/* Grille de notation */}
          <Reveal delay={120} className="mt-8">
            <div className="rounded-2xl border border-sand bg-cream-50 p-6 sm:p-8">
              <h2 className="font-display mb-1 flex items-center gap-2 text-lg font-semibold text-forest-700">
                <IconScale className="h-5 w-5 text-green" />
                {t("gridTitle")}
              </h2>
              <p className="mb-5 text-sm text-muted">{t("gridHint")}</p>
              <EvaluationForm
                teamId={team.id}
                criteria={criteria.map((c) => ({ id: c.id, label: c.label, weight: c.weight, maxScore: c.maxScore }))}
                initialScores={existing?.scoreMap ?? {}}
                initialComment={existing?.comment ?? null}
                initialUsable={existing?.usable ?? null}
                initialSubmitted={existing?.submitted ?? false}
              />
            </div>
          </Reveal>
    </div>
  );
}

function Block({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink/85">{value || "—"}</p>
    </div>
  );
}
