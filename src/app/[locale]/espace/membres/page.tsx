import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { getMyProfile, getMyTeam, computeSteps } from "@/lib/candidature";
import { startCandidatureAction, deleteMemberAction } from "@/lib/candidature-actions";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { Stepper } from "@/components/espace/Stepper";
import { DeveloperToggle } from "@/components/espace/DeveloperToggle";
import { AddMemberForm } from "@/components/espace/AddMemberForm";
import { IconArrowRight, IconUsers } from "@/components/icons";

export const metadata: Metadata = { title: "Membres" };
export const dynamic = "force-dynamic";

export default async function MembresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const [user, team] = await Promise.all([
    getMyProfile(session.user.id),
    getMyTeam(session.user.id),
  ]);
  if (!user) redirect(`/${locale}/login`);

  const t = await getTranslations("espace.membres");
  const teq = await getTranslations("espace.equipe");
  const trl = await getTranslations("memberRoles");
  const trg = await getTranslations("regions");
  const tg = await getTranslations("genders");
  const steps = computeSteps(user, team);
  const locked = Boolean(team && team.status !== "DRAFT");

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
            <Stepper steps={steps} current="membres" />
          </Reveal>

          <Reveal delay={80} className="mt-8">
            <h1 className="font-display text-3xl font-bold text-forest">{t("title")}</h1>
            <p className="mt-2 text-muted">{t("subtitle")}</p>
          </Reveal>

          {!team ? (
            <Reveal delay={120} className="mt-8">
              <div className="rounded-2xl border border-sand bg-cream-50 p-8 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green/10 text-green">
                  <IconUsers className="h-7 w-7" />
                </span>
                <h2 className="font-display mt-4 text-lg font-semibold text-forest">
                  {t("startTitle")}
                </h2>
                <p className="mt-2 text-sm text-muted">{t("startText")}</p>
                <form action={startCandidatureAction} className="mt-6">
                  <input type="hidden" name="locale" value={locale} />
                  <button className="rounded-full bg-green px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-forest-700">
                    {t("start")}
                  </button>
                </form>
              </div>
            </Reveal>
          ) : (
            <>
              {/* Besoin d'un développeur */}
              <Reveal delay={120} className="mt-8">
                <DeveloperToggle value={team.needsDeveloper} locked={locked} />
              </Reveal>

              {/* Liste des membres */}
              <Reveal delay={160} className="mt-8">
                <h2 className="font-display text-xl font-bold text-forest">{teq("membersTitle")}</h2>
                <p className="mt-1 text-sm text-muted">{teq("membersSubtitle")}</p>

                <ul className="mt-5 space-y-3">
                  {team.members.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-sand bg-cream-50 p-4"
                    >
                      <div>
                        <p className="font-medium text-forest-700">
                          {m.fullName}
                          {m.isLeader && (
                            <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent-600">
                              {teq("leaderBadge")}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {trl(m.role)}
                          {m.region ? ` · ${trg(m.region)}` : ""}
                          {m.gender ? ` · ${tg(m.gender)}` : ""}
                          {m.email ? ` · ${m.email}` : ""}
                        </p>
                      </div>
                      {!m.isLeader && !locked && (
                        <form action={deleteMemberAction}>
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="memberId" value={m.id} />
                          <button className="rounded-full border border-sand px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50">
                            {teq("remove")}
                          </button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>

                {!locked && (
                  <div className="mt-5">
                    <AddMemberForm />
                  </div>
                )}
              </Reveal>

              <Reveal delay={200} className="mt-8 flex justify-end">
                <Link
                  href="/espace/projet"
                  className="group inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-forest-700"
                >
                  {t("next")}
                  <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
