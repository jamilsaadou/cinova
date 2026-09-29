import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ActorLogos } from "@/components/ActorLogos";
import { Reveal } from "@/components/Reveal";
import { Photo } from "@/components/Photo";
import { photos } from "@/lib/images";
import {
  IconRoute,
  IconSpark,
  IconShield,
  IconUsers,
  IconTarget,
  IconVideo,
  IconDocument,
  IconRocket,
  IconArrowRight,
  IconBook,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Présentation",
  description: "Présentation détaillée du challenge CINOVA.",
};

export default async function PresentationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <main className="flex-1">
        <PresHero />
        <PresContext />
        <PresReca />
        <PresObjectives />
        <PresCalendar />
        <PresCta />
        <ActorLogos />
      </main>
      <Footer />
    </>
  );
}

function PresHero() {
  const t = useTranslations("presentation");
  return (
    <section className="relative">
      <Photo
        src={photos.herders}
        alt="Bergers et troupeau"
        overlay="green"
        position="center"
        className="min-h-[420px] w-full"
      >
        <div className="mx-auto flex h-full max-w-5xl items-end px-5 py-16">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-sage">{t("eyebrow")}</p>
            <h1 className="font-display mt-3 text-4xl font-bold text-cream-50 sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-cream-100/85">{t("intro")}</p>
          </Reveal>
        </div>
      </Photo>
    </section>
  );
}

function PresContext() {
  const t = useTranslations("lastMile");
  const p = useTranslations("presentation");
  return (
    <section className="bg-cream">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow text-accent-600">{p("contextTitle")}</p>
          <h2 className="font-display mt-3 text-3xl font-bold text-forest sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-xl font-medium leading-snug text-green">{t("lead")}</p>
          <p className="mt-5 leading-relaxed text-muted">{t("body")}</p>
        </Reveal>
        <Reveal variant="scale" delay={100}>
          <Photo
            src={photos.crop}
            alt="Champ de blé, Agadez"
            className="aspect-[4/3] w-full rounded-2xl shadow-sm shine"
          />
        </Reveal>
      </div>
    </section>
  );
}

function PresReca() {
  const p = useTranslations("presentation");
  return (
    <section className="bg-cream-50">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2">
        <Reveal variant="scale" className="order-2 lg:order-1">
          <Photo
            src={photos.water}
            alt="Irrigation — accès à l'eau"
            className="aspect-[4/3] w-full rounded-2xl shadow-sm shine"
          />
        </Reveal>
        <Reveal className="order-1 lg:order-2">
          <p className="eyebrow text-accent-600">RECA</p>
          <h2 className="font-display mt-3 text-3xl font-bold text-forest sm:text-4xl">
            {p("recaTitle")}
          </h2>
          <p className="mt-5 leading-relaxed text-muted">{p("recaText")}</p>
        </Reveal>
      </div>
    </section>
  );
}

function PresObjectives() {
  const p = useTranslations("presentation");
  const items = [
    { key: "connect", Icon: IconRoute },
    { key: "build", Icon: IconSpark },
    { key: "sustain", Icon: IconShield },
    { key: "mobilize", Icon: IconUsers },
  ] as const;
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <p className="eyebrow text-accent-600">{p("objectivesTitle")}</p>
          <h2 className="font-display mt-3 text-3xl font-bold text-forest sm:text-4xl">
            {p("objectivesTitle")}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {items.map(({ key, Icon }, i) => (
            <Reveal key={key} delay={(i % 2) * 100} variant="up">
              <div className="lift flex items-start gap-4 rounded-2xl border border-sand bg-cream-50 p-6">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-green/10 text-green">
                  <Icon className="h-6 w-6" />
                </span>
                <p className="pt-1 leading-relaxed text-ink/85">{p(`objectives.${key}`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PresCalendar() {
  const t = useTranslations("journey");
  const p = useTranslations("presentation");
  const phases = [
    { key: "framing", Icon: IconTarget },
    { key: "webinars", Icon: IconVideo },
    { key: "call", Icon: IconDocument },
    { key: "bootcamp", Icon: IconUsers },
    { key: "hackathon", Icon: IconRocket },
  ] as const;
  return (
    <section className="bg-forest text-cream-100">
      <div className="mx-auto max-w-4xl px-5 py-20">
        <Reveal>
          <p className="eyebrow text-sage">{t("eyebrow")}</p>
          <h2 className="font-display mt-3 text-3xl font-bold text-cream-50 sm:text-4xl">
            {p("calendarTitle")}
          </h2>
        </Reveal>
        <ol className="mt-12 space-y-6 border-l border-sage/30 pl-8">
          {phases.map(({ key, Icon }, i) => (
            <Reveal as="li" key={key} delay={i * 90} className="relative">
              <span className="absolute -left-[3.05rem] flex h-9 w-9 items-center justify-center rounded-full border border-sage/40 bg-forest-700 text-sage">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-lg font-semibold text-cream-50">
                {i + 1}. {t(`phases.${key}.title`)}
              </h3>
              <p className="mt-1 leading-relaxed text-cream-100/70">
                {t(`phases.${key}.description`)}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PresCta() {
  const a = useTranslations("actions");
  const c = useTranslations("cta");
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Reveal variant="scale">
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-sand bg-cream-50 px-8 py-12 text-center">
            <h2 className="font-display text-2xl font-bold text-forest sm:text-3xl">
              {c("title")}
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-forest-700"
              >
                {a("apply")}
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/reglement"
                className="inline-flex items-center gap-2 rounded-full border border-forest-700/25 px-6 py-3 text-sm font-semibold text-forest-700 transition hover:border-green hover:text-green"
              >
                <IconBook className="h-4 w-4" />
                {a("readRules")}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
