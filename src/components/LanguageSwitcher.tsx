"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale, localeNames } from "@/i18n/routing";

// Sélecteur de langue (fr / en / ha) conservant la route courante.
export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("language");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function switchTo(next: Locale) {
    setOpen(false);
    if (next !== locale) router.replace(pathname, { locale: next });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("label")}
        className="flex items-center gap-1.5 rounded-full border border-sand bg-cream-50 px-3 py-1.5 text-sm font-medium text-forest-700 transition hover:border-green hover:text-green"
      >
        <span aria-hidden>🌐</span>
        <span className="uppercase">{locale}</span>
        <span aria-hidden className="text-xs">▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-sand bg-cream-50 shadow-lg"
        >
          {routing.locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => switchTo(l)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-cream-200 ${
                  l === locale ? "font-semibold text-green" : "text-ink"
                }`}
              >
                {localeNames[l]}
                {l === locale && <span aria-hidden>✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
