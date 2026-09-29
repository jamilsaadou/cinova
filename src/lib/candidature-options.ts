// Options de listes (sans dépendance serveur) — partagées UI + validation.

export const BENEFICIARY_KEYS = [
  "producteurs",
  "femmes",
  "eleveurs",
  "pecheurs",
  "forestiers",
  "cooperatives",
  "orgPaysannes",
  "conseillers",
  "jeunes",
  "autres",
] as const;

export const HEARD_ABOUT_KEYS = [
  "webinaire",
  "cra",
  "reseaux",
  "medias",
  "boucheAOreille",
  "autre",
] as const;

export type BeneficiaryKey = (typeof BENEFICIARY_KEYS)[number];
export type HeardAboutKey = (typeof HEARD_ABOUT_KEYS)[number];
