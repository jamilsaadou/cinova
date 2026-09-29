import { useLocale, useTranslations } from "next-intl";
import { setNeedsDeveloperAction } from "@/lib/candidature-actions";

// Question « Avez-vous besoin d'un développeur ? » — Oui / Non.
export function DeveloperToggle({ value, locked }: { value: boolean; locked?: boolean }) {
  const t = useTranslations("espace.membres");
  const locale = useLocale();

  const base =
    "rounded-full px-6 py-2 text-sm font-semibold transition disabled:cursor-not-allowed";
  const on = "bg-green text-cream-50";
  const off = "border border-sand text-forest-700 hover:border-green hover:text-green";

  return (
    <div className="rounded-2xl border border-sand bg-cream-50 p-6">
      <h3 className="font-display font-semibold text-forest-700">{t("developerQuestion")}</h3>
      <p className="mt-1 text-sm text-muted">{t("developerHint")}</p>
      <form action={setNeedsDeveloperAction} className="mt-4 flex gap-3">
        <input type="hidden" name="locale" value={locale} />
        <button
          name="value"
          value="yes"
          disabled={locked}
          className={`${base} ${value ? on : off}`}
        >
          {t("yes")}
        </button>
        <button
          name="value"
          value="no"
          disabled={locked}
          className={`${base} ${!value ? on : off}`}
        >
          {t("no")}
        </button>
      </form>
    </div>
  );
}
