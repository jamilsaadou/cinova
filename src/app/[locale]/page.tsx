import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ActorLogos } from "@/components/ActorLogos";
import { Reveal } from "@/components/Reveal";
import { Counter } from "@/components/Counter";
import { Photo } from "@/components/Photo";
import { photos, galleryPhotos } from "@/lib/images";
import { getPublicStats } from "@/lib/analytics";
import { Donut, CHART_COLORS } from "@/components/charts";
import {
  IconAlert,
  IconMarket,
  IconInputs,
  IconWarehouse,
  IconCooperative,
  IconAdvisory,
  IconSoil,
  IconPhone,
  IconSignal,
  IconLanguage,
  IconClock,
  IconSpark,
  IconRefresh,
  IconGears,
  IconSprout,
  IconTarget,
  IconVideo,
  IconDocument,
  IconUsers,
  IconRocket,
  IconArrowRight,
  IconCheck,
  IconBook,
} from "@/components/icons";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const publicStats = await getPublicStats();

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <LastMile />
        <Immersion />
        <Tracks />
        <Challenges />
        <Journey />
        <LiveStats stats={publicStats} />
        <Gallery />
        <Audience />
        <Jury />
        <CtaBand />
        <ActorLogos />
      </main>
      <Footer />
    </>
  );
}

/* ─────────────────────── Chiffres du challenge ─────────────────────── */
function LiveStats({
  stats,
}: {
  stats: {
    candidatures: number;
    regions: number;
    participants: number;
    byTrack: Record<string, number>;
    byChallenge: Record<string, number>;
  };
}) {
  const t = useTranslations("liveStats");
  const tc = useTranslations("challenges");
  const tt = useTranslations("tracks");

  const codeToKey: Record<string, string> = {
    ALERT: "alert", MARKET: "market", INPUTS: "inputs", WARRANTAGE: "warrantage",
    COOP: "cooperatives", ADVISORY: "advisory", SOIL: "soil",
  };
  const topChallenges = Object.entries(stats.byChallenge)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, value]) => ({ label: tc(`items.${codeToKey[code] ?? "alert"}.title`), value }));
  const maxCh = Math.max(1, ...topChallenges.map((c) => c.value));

  const trackSegments = [
    { label: tt("creation.title"), value: stats.byTrack.CREATION ?? 0, color: CHART_COLORS[0] },
    { label: tt("adaptation.title"), value: stats.byTrack.ADAPTATION ?? 0, color: CHART_COLORS[1] },
  ];

  const kpis = [
    { value: stats.candidatures, label: t("candidatures") },
    { value: stats.regions, label: t("regions") },
    { value: stats.participants, label: t("participants") },
  ];

  return (
    <section className="bg-cream-50">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="max-w-2xl">
          <SectionEyebrow>{t("eyebrow")}</SectionEyebrow>
          <h2 className="font-display mt-3 text-3xl font-bold text-forest sm:text-4xl">{t("title")}</h2>
          <p className="mt-4 leading-relaxed text-muted">{t("subtitle")}</p>
        </Reveal>

        <Reveal delay={80} className="mt-10 grid gap-4 sm:grid-cols-3">
          {kpis.map((k, i) => (
            <div key={i} className="rounded-2xl border border-sand bg-cream p-7 text-center">
              <p className="font-display text-4xl font-bold text-green">
                <Counter to={k.value} />
              </p>
              <p className="mt-1 text-sm text-muted">{k.label}</p>
            </div>
          ))}
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Reveal variant="scale">
            <div className="h-full rounded-2xl border border-sand bg-cream p-7">
              <h3 className="font-display text-sm font-semibold text-forest-700">{t("tracksTitle")}</h3>
              <div className="mt-4">
                <Donut segments={trackSegments} centerLabel={t("candidatures")} />
              </div>
            </div>
          </Reveal>

          <Reveal variant="scale" delay={80}>
            <div className="h-full rounded-2xl border border-sand bg-cream p-7">
              <h3 className="font-display text-sm font-semibold text-forest-700">{t("challengesTitle")}</h3>
              {topChallenges.length > 0 ? (
                <ul className="mt-4 space-y-2.5">
                  {topChallenges.map((c, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-40 flex-none truncate text-ink/85">{c.label}</span>
                      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-sand">
                        <span className="block h-full rounded-full bg-green" style={{ width: `${(c.value / maxCh) * 100}%` }} />
                      </span>
                      <span className="w-6 flex-none text-right font-semibold text-forest-700">{c.value}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted">—</p>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Hero ───────────────────────── */
function Hero() {
  const t = useTranslations("hero");
  const a = useTranslations("actions");

  return (
    <section className="relative overflow-hidden bg-cream">
      <div
        aria-hidden
        className="float-slow pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-sage/20"
      />
      <div
        aria-hidden
        className="float-slower pointer-events-none absolute right-10 top-40 h-[320px] w-[320px] rounded-full border border-sage/40"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:py-28 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-sand bg-cream-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-forest-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              {t("eyebrow")}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="font-display mt-6 text-4xl font-bold leading-[1.08] text-forest sm:text-5xl">
              {t("title")}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {t("subtitle")}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-cream-50 shadow-sm transition hover:bg-forest-700 hover:shadow-md"
              >
                {a("apply")}
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#challenge"
                className="rounded-full border border-forest-700/25 px-6 py-3 text-sm font-semibold text-forest-700 transition hover:border-green hover:text-green"
              >
                {a("discover")}
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-5 text-sm font-medium text-accent-600">{t("note")}</p>
          </Reveal>
        </div>

        {/* Médaillon photo circulaire + badge 48h */}
        <Reveal variant="scale" delay={200} className="relative mx-auto w-full max-w-sm">
          <div className="relative aspect-square">
            <div
              aria-hidden
              className="spin-slow absolute -inset-4 rounded-full border border-dashed border-sage/50"
            />
            <Photo
              src={photos.hero}
              alt="Champ de mil au pied de la montagne"
              priority
              overlay="soft"
              position="center"
              className="h-full w-full rounded-full shadow-xl ring-8 ring-cream-50"
            />
            <div className="float-slow absolute -bottom-3 -left-3 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-forest text-center text-cream-50 shadow-lg ring-4 ring-cream">
              <span className="font-display text-2xl font-bold leading-none">48h</span>
              <span className="mt-1 text-[10px] uppercase tracking-widest text-cream-100/80">
                hackathon
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Bandeau statistiques animées */}
      <div className="relative border-y border-sand bg-cream-50">
        <dl className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-sand sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <StatItem to={8} label={t("stats.regionsLabel")} />
          <StatItem to={2} label={t("stats.tracksLabel")} />
          <StatItem to={48} suffix="h" label={t("stats.hackathonLabel")} />
        </dl>
      </div>
    </section>
  );
}

function StatItem({ to, suffix, label }: { to: number; suffix?: string; label: string }) {
  return (
    <div className="px-5 py-7 text-center sm:text-left">
      <dt className="font-display text-3xl font-bold text-green">
        <Counter to={to} suffix={suffix} />
      </dt>
      <dd className="mt-1 text-sm text-muted">{label}</dd>
    </div>
  );
}

/* ─────────────────────── Le dernier kilomètre ─────────────────────── */
function LastMile() {
  const t = useTranslations("lastMile");
  const constraints = [
    { key: "equipment", Icon: IconPhone },
    { key: "network", Icon: IconSignal },
    { key: "language", Icon: IconLanguage },
    { key: "timing", Icon: IconClock },
  ] as const;

  return (
    <section id="challenge" className="scroll-mt-20 bg-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2">
        <div>
          <Reveal>
            <SectionEyebrow>{t("eyebrow")}</SectionEyebrow>
            <h2 className="font-display mt-3 text-3xl font-bold text-forest sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-6 text-xl font-medium leading-snug text-green">{t("lead")}</p>
            <p className="mt-5 leading-relaxed text-muted">{t("body")}</p>
          </Reveal>

          <Reveal delay={120} className="mt-8">
            <Photo
              src={photos.phone}
              alt="Main tenant un téléphone"
              className="aspect-[16/9] w-full rounded-2xl shadow-sm shine"
              position="center"
            />
          </Reveal>
        </div>

        <Reveal variant="scale" delay={100}>
          <div className="rounded-2xl border border-sand bg-cream-50 p-7">
            <h3 className="font-display text-lg font-semibold text-forest-700">
              {t("constraints.title")}
            </h3>
            <ul className="mt-5 space-y-3">
              {constraints.map(({ key, Icon }, i) => (
                <Reveal as="li" key={key} delay={i * 90}>
                  <div className="flex items-start gap-4 rounded-xl p-2 transition hover:bg-cream-200/60">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent/15 text-accent-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="pt-1.5 text-sm leading-relaxed text-ink/85">
                      {t(`constraints.${key}`)}
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────── Bande immersion (photo pleine largeur) ─────────────────────── */
function Immersion() {
  const t = useTranslations("immersion");
  return (
    <section className="relative">
      <Photo
        src={photos.villageAerial}
        alt="Vue aérienne d'un village et de sa piste"
        overlay="green"
        position="center"
        className="min-h-[380px] w-full md:min-h-[440px]"
      >
        <div className="mx-auto flex h-full max-w-6xl items-end px-5 py-14">
          <Reveal className="max-w-xl">
            <h2 className="font-display text-3xl font-bold text-cream-50 sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 leading-relaxed text-cream-100/85">{t("text")}</p>
            <Link
              href="/presentation"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-cream-50 px-5 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-white"
            >
              {t("cta")}
              <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </Photo>
    </section>
  );
}

/* ─────────────────────── Deux pistes ─────────────────────── */
function Tracks() {
  const t = useTranslations("tracks");
  const tracks = [
    { key: "creation", Icon: IconSpark },
    { key: "adaptation", Icon: IconRefresh },
  ] as const;

  return (
    <section className="bg-cream-50">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <h2 className="font-display text-center text-2xl font-bold text-forest sm:text-3xl">
            {t("title")}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {tracks.map(({ key, Icon }, i) => (
            <Reveal key={key} delay={i * 120} variant="scale">
              <div className="lift group relative overflow-hidden rounded-2xl border border-sand bg-cream p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green/10 text-green transition group-hover:bg-green group-hover:text-cream-50">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="font-display absolute right-6 top-6 text-5xl font-bold text-sage/40">
                  0{i + 1}
                </span>
                <h3 className="font-display mt-5 text-xl font-semibold text-forest-700">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">{t(`${key}.description`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Les défis ─────────────────────── */
function Challenges() {
  const t = useTranslations("challenges");
  const items = [
    { key: "alert", Icon: IconAlert },
    { key: "market", Icon: IconMarket },
    { key: "inputs", Icon: IconInputs },
    { key: "warrantage", Icon: IconWarehouse },
    { key: "cooperatives", Icon: IconCooperative },
    { key: "advisory", Icon: IconAdvisory },
    { key: "soil", Icon: IconSoil },
  ] as const;

  return (
    <section id="challenges" className="scroll-mt-20 bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="max-w-2xl">
          <SectionEyebrow>{t("eyebrow")}</SectionEyebrow>
          <h2 className="font-display mt-3 text-3xl font-bold text-forest sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 leading-relaxed text-muted">{t("subtitle")}</p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ key, Icon }, i) => (
            <Reveal as="article" key={key} delay={(i % 3) * 90} variant="up">
              <div className="lift flex h-full flex-col rounded-2xl border border-sand bg-cream-50 p-6 hover:border-green/40">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green/10 text-green">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="font-display text-sm font-bold text-sage/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-display mt-4 text-lg font-semibold text-forest-700">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Le parcours ─────────────────────── */
function Journey() {
  const t = useTranslations("journey");
  const phases = [
    { key: "framing", Icon: IconTarget },
    { key: "webinars", Icon: IconVideo },
    { key: "call", Icon: IconDocument },
    { key: "bootcamp", Icon: IconUsers },
    { key: "hackathon", Icon: IconRocket },
  ] as const;

  return (
    <section id="journey" className="scroll-mt-20 bg-forest text-cream-100">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-sage">{t("eyebrow")}</p>
          <h2 className="font-display mt-3 text-3xl font-bold text-cream-50 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 leading-relaxed text-cream-100/75">{t("subtitle")}</p>
        </Reveal>

        <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {phases.map(({ key, Icon }, i) => (
            <Reveal as="li" key={key} delay={i * 110} className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-sage/40 bg-forest-700 text-sage">
                  <Icon className="h-6 w-6" />
                </span>
                {i < phases.length - 1 && (
                  <span className="hidden h-px flex-1 bg-gradient-to-r from-sage/40 to-transparent lg:block" />
                )}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="font-display text-sm font-bold text-sage">{i + 1}</span>
                <h3 className="font-display text-base font-semibold text-cream-50">
                  {t(`phases.${key}.title`)}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-cream-100/70">
                {t(`phases.${key}.description`)}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─────────────────────── Galerie « le terrain » ─────────────────────── */
function Gallery() {
  const t = useTranslations("gallery");
  return (
    <section className="bg-cream-50">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="max-w-2xl">
          <SectionEyebrow>{t("eyebrow")}</SectionEyebrow>
          <h2 className="font-display mt-3 text-3xl font-bold text-forest sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 leading-relaxed text-muted">{t("subtitle")}</p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {galleryPhotos.map((p, i) => (
            <Reveal
              key={p.key}
              variant="scale"
              delay={(i % 3) * 100}
              className={i === 0 ? "col-span-2 lg:col-span-2 lg:row-span-2" : ""}
            >
              <figure className="lift group relative h-full overflow-hidden rounded-2xl">
                <Photo
                  src={p.src}
                  alt={t(`captions.${p.key}`)}
                  className={`shine h-full w-full ${i === 0 ? "min-h-[240px] lg:min-h-[380px]" : "aspect-[4/3]"}`}
                />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/85 to-transparent p-4 pt-10 text-xs font-medium text-cream-50 opacity-0 transition group-hover:opacity-100">
                  {t(`captions.${p.key}`)}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Public cible ─────────────────────── */
function Audience() {
  const t = useTranslations("audience");
  const items = ["devs", "students", "startups", "agronomists", "coops"] as const;

  return (
    <section id="about" className="scroll-mt-20 bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="max-w-2xl">
          <SectionEyebrow>{t("eyebrow")}</SectionEyebrow>
          <h2 className="font-display mt-3 text-3xl font-bold text-forest sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 leading-relaxed text-muted">{t("subtitle")}</p>
        </Reveal>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((k, i) => (
            <Reveal as="li" key={k} delay={(i % 3) * 90}>
              <div className="lift flex items-start gap-3 rounded-xl border border-sand bg-cream-50 p-5">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-green/15 text-green">
                  <IconCheck className="h-4 w-4" />
                </span>
                <span className="text-sm leading-relaxed text-ink/85">{t(`items.${k}`)}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────── Jury ─────────────────────── */
function Jury() {
  const t = useTranslations("jury");
  const colleges = [
    { key: "technical", Icon: IconGears },
    { key: "producers", Icon: IconSprout },
  ] as const;

  return (
    <section className="bg-cream-50">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Reveal className="text-center">
          <SectionEyebrow center>{t("eyebrow")}</SectionEyebrow>
          <h2 className="font-display mt-3 text-2xl font-bold text-forest sm:text-3xl">
            {t("title")}
          </h2>
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          {colleges.map(({ key, Icon }, i) => (
            <Reveal key={key} delay={i * 120} variant="scale">
              <div className="lift rounded-2xl border border-sand bg-cream p-7 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green/10 text-green">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="font-display mt-4 text-lg font-semibold text-green">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t(`${key}.description`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Bandeau CTA ─────────────────────── */
function CtaBand() {
  const t = useTranslations("cta");
  const a = useTranslations("actions");

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Reveal variant="scale">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-700 to-green px-8 py-14 text-center shadow-lg">
            <div
              aria-hidden
              className="float-slow pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full border border-cream-100/15"
            />
            <div
              aria-hidden
              className="float-slower pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-cream-100/5"
            />
            <h2 className="font-display relative text-2xl font-bold text-cream-50 sm:text-3xl">
              {t("title")}
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-cream-100/80">{t("subtitle")}</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="rounded-full bg-cream-50 px-6 py-3 text-sm font-semibold text-forest-700 transition hover:bg-white"
              >
                {t("primary")}
              </Link>
              <Link
                href="/reglement"
                className="inline-flex items-center gap-2 rounded-full border border-cream-100/40 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-cream-100/10"
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

/* ─────────────────────── Utilitaires ─────────────────────── */
function SectionEyebrow({
  children,
  center,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return <p className={`eyebrow text-accent-600 ${center ? "text-center" : ""}`}>{children}</p>;
}
