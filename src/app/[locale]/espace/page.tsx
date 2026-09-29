import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/auth-actions";
import { getMyProfile, getMyTeam, getActiveEdition, computeSteps } from "@/lib/candidature";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Progress } from "@/components/espace/Progress";
import { Indicators } from "@/components/espace/Indicators";
import { Link } from "@/i18n/navigation";
import { IconUsers, IconArrowRight } from "@/components/icons";

export const metadata: Metadata = { title: "Ma candidature" };
export const dynamic = "force-dynamic";

export default async function EspacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const [user, team, edition] = await Promise.all([
    getMyProfile(session.user.id),
    getMyTeam(session.user.id),
    getActiveEdition(),
  ]);
  if (!user) redirect(`/${locale}/login`);

  const t = await getTranslations("espace.dashboard");
  const tRoles = await getTranslations("roles");
  const tStatus = await getTranslations("status");
  const tAuth = await getTranslations("auth.space");

  const steps = computeSteps(user, team);
  const profileComplete = Boolean(user.name && user.phone && user.region);
  const memberCount = team?.members.length ?? 0;
  const daysLeft = edition?.applicationsCloseAt
    ? Math.max(
        0,
        Math.ceil((edition.applicationsCloseAt.getTime() - Date.now()) / 86_400_000),
      )
    : null;
  const initial = (user.name ?? user.email ?? "?").charAt(0).toUpperCase();

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-5xl px-5 py-14">
          {/* En-tête */}
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green text-xl font-bold text-cream-50">
                  {initial}
                </span>
                <div>
                  <p className="eyebrow text-accent-600">{t("title")}</p>
                  <h1 className="font-display text-3xl font-bold text-forest">
                    {tAuth("welcome", { name: user.name ?? "" })}
                  </h1>
                </div>
              </div>
              <form action={logoutAction}>
                <input type="hidden" name="locale" value={locale} />
                <button className="rounded-full border border-sand px-5 py-2 text-sm font-semibold text-forest-700 transition hover:border-green hover:text-green">
                  {tAuth("logout")}
                </button>
              </form>
            </div>
            <p className="mt-4 max-w-2xl text-muted">{t("subtitle")}</p>
          </Reveal>

          {/* Indicateurs */}
          <Reveal delay={60} className="mt-8">
            <Indicators
              profileComplete={profileComplete}
              memberCount={memberCount}
              status={team?.status ?? null}
              challengeCode={team?.challenge?.code ?? null}
              region={user.region ?? null}
              daysLeft={daysLeft}
            />
          </Reveal>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Profil */}
            <Reveal className="lg:col-span-1">
              <div className="flex h-full flex-col rounded-2xl border border-sand bg-cream-50 p-6">
                <h2 className="font-display font-semibold text-forest-700">{t("profileTitle")}</h2>
                <span
                  className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    profileComplete ? "bg-green/15 text-green" : "bg-accent/15 text-accent-600"
                  }`}
                >
                  {profileComplete ? t("profileComplete") : t("profileIncomplete")}
                </span>
                <p className="mt-3 text-sm text-muted">{tRoles(session.user.role)}</p>
                <p className="text-sm text-ink/85">{user.email}</p>
                <Link
                  href="/espace/profil"
                  className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-green hover:underline"
                >
                  {t("editProfile")} <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            {/* Équipe */}
            <Reveal delay={80} className="lg:col-span-2">
              <div className="flex h-full flex-col rounded-2xl border border-sand bg-cream-50 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-semibold text-forest-700">{t("teamTitle")}</h2>
                  {team && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest-700">
                      {t("statusLabel")} : {tStatus(team.status)}
                    </span>
                  )}
                </div>

                {team ? (
                  <div className="mt-4">
                    <p className="font-display text-lg font-semibold text-forest">{team.name}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                      <IconUsers className="h-4 w-4" />
                      {t("membersCount", { count: memberCount })}
                    </p>
                    <Link
                      href="/espace/membres"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-green px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-700"
                    >
                      {t("teamManage")} <IconArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-muted">{t("teamNone")}</p>
                    <Link
                      href="/espace/membres"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-green px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-700"
                    >
                      {t("teamCreate")} <IconArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </Reveal>
          </div>

          {/* Progression cliquable */}
          <Reveal delay={120} className="mt-6">
            <Progress steps={steps} />
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
