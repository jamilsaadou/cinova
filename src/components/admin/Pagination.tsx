import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Pagination réutilisable — conserve les filtres courants dans l'URL.
export async function Pagination({
  page,
  pages,
  params,
  basePath,
}: {
  page: number;
  pages: number;
  params: Record<string, string | undefined>;
  basePath: string;
}) {
  const t = await getTranslations("admin");
  if (pages <= 1) return null;

  const hrefFor = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== "page") qs.set(k, v);
    }
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return `${basePath}${s ? `?${s}` : ""}`;
  };

  // Fenêtre de pages autour de la page courante.
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(pages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const nums = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition";

  return (
    <nav className="mt-4 flex flex-wrap items-center justify-between gap-3" aria-label="pagination">
      <p className="text-xs text-muted">{t("pageOf", { page, pages })}</p>
      <div className="flex items-center gap-1.5">
        {page > 1 && (
          <Link href={hrefFor(page - 1)} className={`${btn} border-sand text-forest-700 hover:border-green`}>
            {t("prev")}
          </Link>
        )}
        {nums.map((n) => (
          <Link
            key={n}
            href={hrefFor(n)}
            aria-current={n === page ? "page" : undefined}
            className={`${btn} ${n === page ? "border-green bg-green text-cream-50" : "border-sand text-forest-700 hover:border-green"}`}
          >
            {n}
          </Link>
        ))}
        {page < pages && (
          <Link href={hrefFor(page + 1)} className={`${btn} border-sand text-forest-700 hover:border-green`}>
            {t("next")}
          </Link>
        )}
      </div>
    </nav>
  );
}
