import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { getMyProfile, getMyTeam, getActiveEdition, computeSteps } from "@/lib/candidature";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { Stepper } from "@/components/espace/Stepper";
import { ProjectForm } from "@/components/espace/ProjectForm";
import { AttachmentUploader } from "@/components/espace/AttachmentUploader";
import { SubmitForm } from "@/components/espace/SubmitForm";
import { IconArrowRight, IconCheck } from "@/components/icons";

export const metadata: Metadata = { title: "Projet" };
export const dynamic = "force-dynamic";

export default async function ProjetPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { error } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const [user, team, edition] = await Promise.all([
    getMyProfile(session.user.id),
    getMyTeam(session.user.id),
    getActiveEdition(),
  ]);
  if (!user) redirect(`/${locale}/login`);

  const t = await getTranslations("espace.projet");
  const teq = await getTranslations("espace.equipe");
  const steps = computeSteps(user, team);
  const locked = Boolean(team && team.status !== "DRAFT");
  const challenges = (edition?.challenges ?? []).map((c) => ({ id: c.id, code: c.code }));
  const canSubmit = Boolean(
    team && team.status === "DRAFT" && team.name.trim().length >= 2 && team.challengeId && team.members.length >= 2,
  );

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-3xl px-5 py-14">
          <Reveal>
            <Link
              href="/espace"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 transition hover:text-green"
            >
              <IconArrowRight className="h-4 w-4 rotate-180" />
              {teq("back")}
            </Link>
          </Reveal>

          <Reveal delay={40} className="mt-4">
            <Stepper steps={steps} current="projet" />
          </Reveal>

          <Reveal delay={80} className="mt-8">
            <h1 className="font-display text-3xl font-bold text-forest">{t("title")}</h1>
            <p className="mt-2 text-muted">{t("subtitle")}</p>
          </Reveal>

          {locked && (
            <Reveal delay={100} className="mt-6">
              <div className="rounded-xl border border-green/30 bg-green/10 px-4 py-3 text-sm font-medium text-green">
                {t("lockedInfo")}
              </div>
            </Reveal>
          )}

          {/* Informations du projet */}
          <Reveal delay={120} className="mt-6">
            <div className="rounded-2xl border border-sand bg-cream-50 p-6 sm:p-8">
              <ProjectForm
                team={
                  team
                    ? {
                        name: team.name,
                        problem: team.problem,
                        solution: team.solution,
                        description: team.description,
                        track: team.track,
                        challengeId: team.challengeId,
                        beneficiaries: team.beneficiaries
                          ? team.beneficiaries.split(",")
                          : [],
                        heardAbout: team.heardAbout,
                        motivation: team.motivation,
                        otherInfo: team.otherInfo,
                      }
                    : null
                }
                challenges={challenges}
                locked={locked}
              />
            </div>
          </Reveal>

          {/* Images du projet */}
          {team && (
            <Reveal delay={160} className="mt-8">
              <h2 className="font-display text-xl font-bold text-forest">{t("attachmentsTitle")}</h2>
              <p className="mt-1 mb-4 text-sm text-muted">{t("attachmentsSubtitle")}</p>
              <AttachmentUploader attachments={team.attachments} locked={locked} />
            </Reveal>
          )}

          {/* Dépôt */}
          {team && !locked && (
            <Reveal delay={200} className="mt-10">
              <div className="rounded-2xl bg-forest p-6 text-cream-100 sm:p-8">
                <h2 className="font-display text-lg font-semibold text-cream-50">
                  {t("submitTitle")}
                </h2>
                <p className="mt-2 text-sm text-cream-100/80">{t("submitText")}</p>
                {!canSubmit && (
                  <p className="mt-3 rounded-lg bg-accent/20 px-3 py-2 text-xs font-medium text-accent">
                    {t("errors.incomplete")}
                  </p>
                )}
                {error && (
                  <p className="mt-3 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-medium text-red-100">
                    {t(`errors.${error}`)}
                  </p>
                )}
                <div className="mt-5">
                  <SubmitForm canSubmit={canSubmit} />
                </div>
              </div>
            </Reveal>
          )}

          {team && locked && (
            <Reveal delay={200} className="mt-10">
              <div className="flex items-center gap-3 rounded-2xl border border-green/30 bg-green/10 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green text-cream-50">
                  <IconCheck className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-forest-700">{teq("submittedInfo")}</p>
              </div>
            </Reveal>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
