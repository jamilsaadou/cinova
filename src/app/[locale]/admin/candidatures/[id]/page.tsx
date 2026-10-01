import { AttachmentCard } from "@/components/AttachmentCard";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireBackoffice, getTeamForAdmin } from "@/lib/admin";
import { getTeamScores } from "@/lib/jury";
import { CHALLENGE_CODE_TO_KEY } from "@/lib/candidature";
import {
  setTeamStatusAction,
  deleteCandidatureAction,
  deleteCandidateAction,
} from "@/lib/admin-actions";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { IconArrowRight, IconUsers, IconCheck } from "@/components/icons";

export const metadata: Metadata = { title: "Candidature" };
export const dynamic = "force-dynamic";

const STATUSES = [
  "SUBMITTED", "UNDER_REVIEW", "PRESELECTED", "REJECTED", "FINALIST", "WINNER",
] as const;

export default async function CandidatureDetail({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const viewer = await requireBackoffice();

  const team = await getTeamForAdmin(id);
  if (!team) notFound();
  const scores = await getTeamScores(id);

  const t = await getTranslations("admin");
  const tp = await getTranslations("espace.projet");
  const tStatus = await getTranslations("status");
  const tRegions = await getTranslations("regions");
  const tTracks = await getTranslations("tracks");
  const tCh = await getTranslations("challenges");
  const tGenders = await getTranslations("genders");
  const tRoles = await getTranslations("memberRoles");
  const tBen = await getTranslations("beneficiaries");
  const tHeard = await getTranslations("heardAbout");
  const tm = await getTranslations("espace.membres");

  const challengeName = team.challenge?.code
    ? tCh(`items.${CHALLENGE_CODE_TO_KEY[team.challenge.code] ?? "alert"}.title`)
    : "—";
  const beneficiaries = team.beneficiaries ? team.beneficiaries.split(",") : [];
  const dash = "—";

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
          <Reveal>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 transition hover:text-green"
            >
              <IconArrowRight className="h-4 w-4 rotate-180" />
              {t("back")}
            </Link>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-bold text-forest">
                {team.name || t("untitled")}
              </h1>
              <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest-700">
                {tStatus(team.status)}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {tTracks(`${team.track.toLowerCase()}.title`)} · {challengeName}
              {team.submittedAt && ` · ${t("submittedOn")} ${team.submittedAt.toLocaleDateString(locale)}`}
            </p>
          </Reveal>

          {/* Chef d'équipe */}
          <Reveal delay={60} className="mt-8">
            <Card title={t("leaderTitle")}>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Info label={t("name")} value={team.leader.name ?? dash} />
                <Info label={t("email")} value={team.leader.email} />
                <Info label={t("phone")} value={team.leader.phone ?? dash} />
                <Info label={t("organization")} value={team.leader.organization ?? dash} />
                <Info label={t("gender")} value={team.leader.gender ? tGenders(team.leader.gender) : dash} />
                <Info label={t("region")} value={team.leader.region ? tRegions(team.leader.region) : dash} />
              </dl>
            </Card>
          </Reveal>

          {/* Membres */}
          <Reveal delay={100} className="mt-6">
            <Card title={`${tm("title")} (${team.members.length})`} icon={<IconUsers className="h-5 w-5" />}>
              <div className="mb-3 text-sm text-muted">
                {tm("developerQuestion")}{" "}
                <span className="font-semibold text-forest-700">
                  {team.needsDeveloper ? tm("yes") : tm("no")}
                </span>
              </div>
              <ul className="divide-y divide-sand">
                {team.members.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <span className="font-medium text-forest-700">
                      {m.fullName}
                      {m.isLeader && (
                        <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent-600">
                          {tRoles("LEAD")}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted">
                      {tRoles(m.role)}
                      {m.gender ? ` · ${tGenders(m.gender)}` : ""}
                      {m.region ? ` · ${tRegions(m.region)}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>

          {/* Projet */}
          <Reveal delay={140} className="mt-6">
            <Card title={tp("title")}>
              <div className="space-y-4">
                <Block label={tp("problem")} value={team.problem} dash={dash} />
                <Block label={tp("solution")} value={team.solution} dash={dash} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">{tp("beneficiaries")}</p>
                  {beneficiaries.length ? (
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {beneficiaries.map((b) => (
                        <span key={b} className="rounded-full bg-green/10 px-3 py-1 text-xs font-medium text-green">
                          {tBen(b)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink/85">{dash}</p>
                  )}
                </div>
                <Block label={tp("description")} value={team.description} dash={dash} />
                <Block label={tp("heardAbout")} value={team.heardAbout ? tHeard(team.heardAbout) : null} dash={dash} />
                <Block label={tp("motivation")} value={team.motivation} dash={dash} />
                <Block label={tp("otherInfo")} value={team.otherInfo} dash={dash} />
              </div>
            </Card>
          </Reveal>

          {/* Images */}
          {team.attachments.length > 0 && (
            <Reveal delay={160} className="mt-6">
              <Card title={tp("attachmentsTitle")}>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {team.attachments.map((a) => (
                    <li key={a.id}><AttachmentCard attachment={a} /></li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          )}

          {/* Notes du jury */}
          <Reveal delay={180} className="mt-6">
            <div className="rounded-2xl border border-sand bg-cream-50 p-6">
              <h2 className="font-display mb-4 text-lg font-semibold text-forest-700">
                {t("juryScoresTitle")}
              </h2>
              {scores.count === 0 ? (
                <p className="text-sm text-muted">{t("juryNoScores")}</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className={`rounded-xl border p-4 ${scores.vetoed ? "border-red-300 bg-red-50" : "border-sand bg-cream"}`}>
                      <p className="text-xs uppercase tracking-wide text-muted">{t("juryScore")}</p>
                      <p className="font-display text-3xl font-bold text-forest">
                        {scores.avg != null ? `${scores.avg}/100` : "—"}
                      </p>
                      <p className="text-xs text-muted">{scores.count} éval.</p>
                    </div>
                    {scores.vetoed && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                        {t("juryVeto")}
                      </span>
                    )}
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {scores.evaluations.map((e) => (
                      <li key={e.id} className="rounded-lg border border-sand bg-cream p-3 text-sm">
                        <span className="font-medium text-forest-700">{e.jury}</span>
                        {e.usable === false && (
                          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                            {t("juryVeto")}
                          </span>
                        )}
                        {e.comment && <p className="mt-1 text-ink/80">{e.comment}</p>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Reveal>

          {viewer.role === "ADMIN" && <>
          {/* Décision du comité */}
          <Reveal delay={200} className="mt-8">
            <div className="rounded-2xl border border-forest-700/20 bg-forest p-6 text-cream-100 sm:p-8">
              <h2 className="font-display text-lg font-semibold text-cream-50">{t("decisionTitle")}</h2>
              <p className="mt-1 text-sm text-cream-100/75">{t("decisionSubtitle")}</p>
              {team.reviewedAt && (
                <p className="mt-3 text-xs text-cream-100/60">
                  {t("lastReview")} {team.reviewedAt.toLocaleDateString(locale)}
                </p>
              )}
              <form action={setTeamStatusAction} className="mt-5 space-y-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="teamId" value={team.id} />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-cream-100/90">{t("newStatus")}</label>
                  <select
                    name="status"
                    defaultValue={team.status}
                    className="w-full rounded-xl border border-cream-100/25 bg-forest-700/60 px-4 py-2.5 text-sm text-cream-50 outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="text-ink">{tStatus(s)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-cream-100/90">{t("reviewNote")}</label>
                  <textarea
                    name="reviewNote"
                    defaultValue={team.reviewNote ?? ""}
                    rows={3}
                    placeholder={t("reviewNotePlaceholder")}
                    className="w-full rounded-xl border border-cream-100/25 bg-forest-700/60 px-4 py-2.5 text-sm text-cream-50 outline-none placeholder:text-cream-100/40"
                  />
                </div>
                <label className="flex items-center gap-2.5 text-sm text-cream-100/90">
                  <input type="checkbox" name="notify" defaultChecked className="h-4 w-4 accent-accent" />
                  {t("notifyCandidate")}
                </label>
                <button className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-600">
                  <IconCheck className="h-4 w-4" />
                  {t("saveDecision")}
                </button>
              </form>
            </div>
          </Reveal>

          {/* Zone de danger */}
          <Reveal delay={220} className="mt-6">
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
              <h2 className="font-display text-lg font-semibold text-red-700">{t("dangerTitle")}</h2>
              <p className="mt-1 text-sm text-muted">{t("dangerHint")}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <form action={deleteCandidatureAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="teamId" value={team.id} />
                  <ConfirmSubmit
                    label={t("deleteCandidature")}
                    confirmLabel={t("deleteConfirm")}
                    cancelLabel={t("cancel")}
                  />
                </form>
                <form action={deleteCandidateAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="userId" value={team.leaderId} />
                  <ConfirmSubmit
                    label={t("deleteCandidate")}
                    confirmLabel={t("deleteConfirm")}
                    cancelLabel={t("cancel")}
                  />
                </form>
              </div>
            </div>
          </Reveal>
          </>}
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-sand bg-cream-50 p-6">
      <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold text-forest-700">
        {icon && <span className="text-green">{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm text-ink/85">{value}</dd>
    </div>
  );
}

function Block({ label, value, dash }: { label: string; value?: string | null; dash: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink/85">{value || dash}</p>
    </div>
  );
}
