import type { SVGProps } from "react";

// Jeu d'icônes CINOVA — traits fins, héritent de la couleur du texte (currentColor).
type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={24}
      height={24}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ---- Défis ---- */
export const IconAlert = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Base>
);
export const IconMarket = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20V10M9 20V4M14 20v-7M19 20V8" />
    <path d="M3 20h18" />
  </Base>
);
export const IconInputs = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3c3 2 4 5 4 8a4 4 0 0 1-8 0c0-3 1-6 4-8Z" />
    <path d="M12 21v-6" />
  </Base>
);
export const IconWarehouse = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 21V9l9-5 9 5v12" />
    <path d="M7 21v-6h10v6" />
    <path d="M7 13h10" />
  </Base>
);
export const IconCooperative = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 6a3 3 0 0 1 0 6" />
    <path d="M17 14a6 6 0 0 1 4 6" />
  </Base>
);
export const IconAdvisory = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 11l14-6v14L3 13z" />
    <path d="M3 11v2a2 2 0 0 0 2 2h2" />
    <path d="M8 16v3" />
  </Base>
);
export const IconSoil = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4c2 2 3 4 3 6a3 3 0 0 1-6 0c0-2 1-4 3-6Z" />
    <path d="M3 16h18M3 20h18" />
  </Base>
);

/* ---- Contraintes du terrain ---- */
export const IconPhone = (p: IconProps) => (
  <Base {...p}>
    <rect x="7" y="3" width="10" height="18" rx="2" />
    <path d="M11 18h2" />
  </Base>
);
export const IconSignal = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12a7 7 0 0 1 14 0" />
    <path d="M8 14a4 4 0 0 1 8 0" />
    <circle cx="12" cy="17" r="1" />
  </Base>
);
export const IconLanguage = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
  </Base>
);
export const IconClock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

/* ---- Pistes / stats ---- */
export const IconSpark = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
  </Base>
);
export const IconRefresh = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12a8 8 0 0 1 14-5l2 2" />
    <path d="M20 12a8 8 0 0 1-14 5l-2-2" />
    <path d="M18 3v4h-4M6 21v-4h4" />
  </Base>
);
export const IconMap = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </Base>
);
export const IconRoute = (p: IconProps) => (
  <Base {...p}>
    <circle cx="6" cy="19" r="2" />
    <circle cx="18" cy="5" r="2" />
    <path d="M8 19h6a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6" />
  </Base>
);
export const IconTimer = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 2h4" />
    <circle cx="12" cy="13" r="8" />
    <path d="M12 13V9" />
  </Base>
);

/* ---- Parcours ---- */
export const IconTarget = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" />
  </Base>
);
export const IconVideo = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="6" width="12" height="12" rx="2" />
    <path d="M15 10l6-3v10l-6-3z" />
  </Base>
);
export const IconDocument = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4" />
    <path d="M9 13h6M9 17h6" />
  </Base>
);
export const IconUsers = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="9" r="3" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M2 20a6 6 0 0 1 12 0" />
    <path d="M14 20a5 5 0 0 1 8 0" />
  </Base>
);
export const IconRocket = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3c3 1 5 4 5 8l-3 3H10L7 11c0-4 2-7 5-8Z" />
    <circle cx="12" cy="9" r="1.5" />
    <path d="M9 17c-2 1-2 4-2 4s3 0 4-2M15 17c2 1 2 4 2 4s-3 0-4-2" />
  </Base>
);

/* ---- Jury / divers ---- */
export const IconGears = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
  </Base>
);
export const IconSprout = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21v-8" />
    <path d="M12 13C9 13 6 11 6 7c4 0 6 2 6 6Z" />
    <path d="M12 11c0-3 2-5 6-5 0 4-3 5-6 5Z" />
  </Base>
);
export const IconLeaf = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20C4 10 12 4 20 4c0 8-6 16-16 16Z" />
    <path d="M4 20c4-6 8-9 12-11" />
  </Base>
);
export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12l5 5L20 6" />
  </Base>
);
export const IconArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);
export const IconDownload = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v12" />
    <path d="M7 11l5 5 5-5" />
    <path d="M5 21h14" />
  </Base>
);
export const IconBook = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2z" />
    <path d="M20 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2z" />
  </Base>
);
export const IconShield = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l7 3v6c0 5-7 9-7 9s-7-4-7-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </Base>
);
export const IconScale = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v18M7 21h10" />
    <path d="M12 6l-7 2 3 5a3 3 0 0 1-6 0l3-5M12 6l7 2-3 5a3 3 0 0 0 6 0l-3-5" />
  </Base>
);
export const IconGrid = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Base>
);
export const IconLogout = (p: IconProps) => (
  <Base {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 17l-5-5 5-5" />
    <path d="M5 12h12" />
  </Base>
);
export const IconMenu = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Base>
);
export const IconClose = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
);
export const IconTrophy = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
    <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" />
    <path d="M12 13v4M9 21h6M10 17h4l1 4H9z" />
  </Base>
);
export const IconFilter = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 5h18l-7 8v6l-4-2v-4z" />
  </Base>
);
