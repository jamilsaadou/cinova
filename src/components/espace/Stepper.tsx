import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconCheck } from "@/components/icons";
import type { StepDef, StepId } from "@/lib/candidature";

// Fil des 3 étapes — cliquable pour sauter directement à n'importe quelle étape.
export function Stepper({ steps, current }: { steps: StepDef[]; current: StepId }) {
  const t = useTranslations("espace.steps");

  return (
    <nav aria-label="Étapes" className="rounded-2xl border border-sand bg-cream-50 p-3">
      <ol className="flex items-center">
        {steps.map((s, i) => {
          const active = s.id === current;
          return (
            <li key={s.id} className="flex flex-1 items-center">
              <Link
                href={s.href}
                aria-current={active ? "step" : undefined}
                className={`group flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2 transition ${
                  active ? "bg-green/10" : "hover:bg-cream-200/60"
                }`}
              >
                <span
                  className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm font-bold transition ${
                    s.done
                      ? "bg-green text-cream-50"
                      : active
                        ? "border-2 border-green text-green"
                        : "border border-sand text-muted group-hover:border-green group-hover:text-green"
                  }`}
                >
                  {s.done ? <IconCheck className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={`truncate text-sm font-medium ${
                    active ? "text-green" : s.done ? "text-ink" : "text-muted"
                  }`}
                >
                  {t(s.id)}
                </span>
              </Link>
              {i < steps.length - 1 && (
                <span className="mx-1 h-px w-4 flex-none bg-sand sm:w-8" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
