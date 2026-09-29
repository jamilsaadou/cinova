import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconCheck, IconArrowRight } from "@/components/icons";
import type { StepDef } from "@/lib/candidature";

// Progression de la candidature : barre + étapes cliquables (on peut sauter à chaque étape).
export function Progress({ steps }: { steps: StepDef[] }) {
  const t = useTranslations("espace.dashboard");
  const done = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percent = Math.round((done / total) * 100);

  return (
    <div className="rounded-2xl border border-sand bg-cream-50 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display font-semibold text-forest-700">{t("progressTitle")}</h2>
        <span className="text-sm font-medium text-muted">
          {t("progressLabel", { done, total })}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-sand">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green to-forest-700 transition-[width] duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Étapes cliquables */}
      <ol className="mt-6 space-y-2">
        {steps.map((s, i) => (
          <li key={s.key}>
            <Link
              href={s.href}
              className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-sand hover:bg-cream"
            >
              <span
                className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold ${
                  s.done
                    ? "bg-green text-cream-50"
                    : "border border-sand bg-cream text-muted group-hover:border-green group-hover:text-green"
                }`}
              >
                {s.done ? <IconCheck className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={`flex-1 text-sm ${s.done ? "font-medium text-ink" : "text-muted"}`}
              >
                {t(s.key)}
              </span>
              <IconArrowRight className="h-4 w-4 text-sand transition group-hover:translate-x-0.5 group-hover:text-green" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
