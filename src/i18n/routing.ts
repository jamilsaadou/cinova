import { defineRouting } from "next-intl/routing";

// Locales de la plateforme CINOVA : français (défaut), anglais, haoussa.
export const routing = defineRouting({
  locales: ["fr", "en", "ha"],
  defaultLocale: "fr",
  // Le préfixe de locale n'apparaît pas pour le français ; /en et /ha pour les autres.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ha: "Hausa",
};
