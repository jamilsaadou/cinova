"use client";

import { useState } from "react";

// Bouton de confirmation en deux temps, à placer dans un <form action={...}>.
export function ConfirmSubmit({
  label,
  confirmLabel,
  cancelLabel,
}: {
  label: string;
  confirmLabel: string;
  cancelLabel: string;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        {label}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <button
        type="submit"
        className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-forest-700"
      >
        {cancelLabel}
      </button>
    </div>
  );
}
