import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { IconDownload, IconShield } from "@/components/icons";
import { reglement } from "@/content/reglement";

export const metadata: Metadata = {
  title: "Règlement",
  description: "Règlement du challenge CINOVA — version de travail.",
};

const PDF_URL = "/reglement/reglement-cinova.pdf";

export default async function ReglementPage({
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
        <ReglementHero />
        <ReglementBody />
      </main>
      <Footer />
    </>
  );
}

function ReglementHero() {
  const t = useTranslations("reglement");
  return (
    <section className="relative overflow-hidden bg-forest text-cream-100">
      <div
        aria-hidden
        className="float-slow pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-sage/20"
      />
      <div className="relative mx-auto max-w-4xl px-5 py-16 md:py-20">
        <Reveal>
          <p className="eyebrow text-sage">{t("eyebrow")}</p>
          <h1 className="font-display mt-3 text-4xl font-bold text-cream-50 sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-cream-100/80">{t("intro")}</p>
          <a
            href={PDF_URL}
            download
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600"
          >
            <IconDownload className="h-4 w-4" />
            {t("download")}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function ReglementBody() {
  const t = useTranslations("reglement");
  return (
    <section className="bg-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[260px_1fr]">
        {/* Sommaire */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="eyebrow text-accent-600">{t("tocTitle")}</h2>
          <nav className="mt-4 border-l border-sand">
            {reglement.articles.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-muted transition hover:border-green hover:text-green"
              >
                {a.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Corps */}
        <div>
          <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-5">
            <IconShield className="mt-0.5 h-5 w-5 flex-none text-accent-600" />
            <div>
              <p className="text-sm leading-relaxed text-ink/85">{t("draftNotice")}</p>
              <p className="mt-2 text-xs text-muted">
                {reglement.version} · {t("updated")} : {reglement.updated}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-10">
            {reglement.articles.map((a) => (
              <Reveal as="article" key={a.id} id={a.id} className="scroll-mt-24">
                <h2 className="font-display text-xl font-semibold text-forest">{a.title}</h2>
                <div className="mt-3 space-y-3">
                  {a.paragraphs.map((p, i) => (
                    <p key={i} className="leading-relaxed text-ink/85">
                      {p}
                    </p>
                  ))}
                </div>
                {a.list && (
                  <ul className="mt-4 space-y-2">
                    {a.list.map((li, i) => (
                      <li key={i} className="flex gap-3 text-ink/85">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-green" />
                        <span className="leading-relaxed">{li}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
