"use client";

import { IconDownload } from "@/components/icons";

// Déclenche l'impression du navigateur (→ enregistrer en PDF).
export function ExportPdfButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600"
    >
      <IconDownload className="h-4 w-4" />
      {label}
    </button>
  );
}
