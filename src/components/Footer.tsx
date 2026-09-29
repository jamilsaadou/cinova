import { useTranslations } from "next-intl";
import { Logo } from "./Logo";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-forest text-cream-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo variant="white" className="h-11 w-auto" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-100/75">
            {t("footer.about")}
          </p>
        </div>

        <div>
          <h3 className="eyebrow text-sage">{t("footer.navTitle")}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-cream-100/80">
            <li><a href="#challenge" className="hover:text-white">{t("nav.challenge")}</a></li>
            <li><a href="#challenges" className="hover:text-white">{t("nav.challenges")}</a></li>
            <li><a href="#journey" className="hover:text-white">{t("nav.journey")}</a></li>
            <li><a href="#about" className="hover:text-white">{t("nav.about")}</a></li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-sage">{t("footer.contactTitle")}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-cream-100/80">
            <li>{t("common.organizer")}</li>
            <li>Niamey, Niger</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-100/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-cream-100/60 sm:flex-row">
          <p>© {year} CINOVA · {t("common.organizer")} — {t("footer.rights")}</p>
          <p className="italic text-sage">{t("common.tagline")}</p>
        </div>
      </div>
    </footer>
  );
}
