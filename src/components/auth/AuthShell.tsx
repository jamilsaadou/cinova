import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { IconArrowRight } from "@/components/icons";

// Coquille visuelle commune aux pages d'authentification (centrée, décor circulaire).
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const t = useTranslations("auth");
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-cream px-5 py-12">
      <div
        aria-hidden
        className="float-slow pointer-events-none absolute -left-40 -top-40 h-[440px] w-[440px] rounded-full bg-sage/20"
      />
      <div
        aria-hidden
        className="float-slower pointer-events-none absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full border border-sage/40"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo priority className="h-11 w-auto" />
        </div>

        <div className="rounded-3xl border border-sand bg-cream-50 p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold text-forest">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-5 text-center text-sm text-muted">{footer}</div>}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-forest-700 transition hover:text-green"
          >
            <IconArrowRight className="h-4 w-4 rotate-180" />
            {t("backHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
