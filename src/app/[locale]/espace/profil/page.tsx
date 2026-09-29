import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import {
  getMyProfile,
  getMyTeam,
  getActiveEdition,
  computeSteps,
} from "@/lib/candidature";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { ProfileForm } from "@/components/espace/ProfileForm";
import { Stepper } from "@/components/espace/Stepper";
import { Indicators } from "@/components/espace/Indicators";
import { IconArrowRight } from "@/components/icons";

export const metadata: Metadata = { title: "Mon profil" };
export const dynamic = "force-dynamic";

export default async function ProfilPage({
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

  const t = await getTranslations("espace.profil");
  const tInd = await getTranslations("espace.indicators");
  const steps = computeSteps(user, team);
  const daysLeft = edition?.applicationsCloseAt
    ? Math.max(0, Math.ceil((edition.applicationsCloseAt.getTime() - Date.now()) / 86_400_000))
    : null;

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
              {t("back")}
            </Link>
          </Reveal>

          <Reveal delay={40} className="mt-4">
            <Stepper steps={steps} current="profil" />
          </Reveal>

          <Reveal delay={80} className="mt-8">
            <h1 className="font-display text-3xl font-bold text-forest">{t("title")}</h1>
            <p className="mt-2 text-muted">{t("subtitle")}</p>
          </Reveal>

          <Reveal delay={120} className="mt-6">
            <div className="rounded-2xl border border-sand bg-cream-50 p-6 sm:p-8">
              <ProfileForm
                user={{
                  name: user.name ?? null,
                  phone: user.phone ?? null,
                  organization: user.organization ?? null,
                  gender: user.gender ?? null,
                  region: user.region ?? null,
                }}
              />
            </div>
          </Reveal>

          <Reveal delay={160} className="mt-8">
            <h2 className="font-display mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              {tInd("title")}
            </h2>
            <Indicators
              profileComplete={Boolean(user.name && user.phone && user.region)}
              memberCount={team?.members.length ?? 0}
              status={team?.status ?? null}
              challengeCode={team?.challenge?.code ?? null}
              region={user.region ?? null}
              daysLeft={daysLeft}
            />
          </Reveal>

          <Reveal delay={200} className="mt-8 flex justify-end">
            <Link
              href="/espace/membres"
              className="group inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-forest-700"
            >
              {t("next")}
              <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
