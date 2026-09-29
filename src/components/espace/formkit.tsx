// Éléments de formulaire partagés (présentation uniquement).

export const inputCls =
  "w-full rounded-xl border border-sand bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green/20 disabled:opacity-60";

export function Field({
  label,
  error,
  hint,
  icon,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-forest-700">
        {icon && <span className="text-green">{icon}</span>}
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function SavedToast({ show, label }: { show: boolean; label: string }) {
  if (!show) return null;
  return (
    <p className="rounded-xl border border-green/30 bg-green/10 px-4 py-2.5 text-sm font-medium text-green">
      {label}
    </p>
  );
}
