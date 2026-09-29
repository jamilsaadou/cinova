// Widgets partagés du panel admin (présentation).

export function Kpi({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-sand bg-cream-50 p-5">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          accent ? "bg-green/15 text-green" : "bg-forest/5 text-forest-700"
        }`}
      >
        {icon}
      </span>
      <p className="font-display mt-3 text-2xl font-bold text-forest">{value}</p>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

export function Breakdown({ title, entries }: { title: string; entries: [string, number][] }) {
  const max = Math.max(1, ...entries.map(([, n]) => n));
  return (
    <div className="rounded-2xl border border-sand bg-cream-50 p-5">
      {title && <h2 className="font-display text-sm font-semibold text-forest-700">{title}</h2>}
      <ul className={title ? "mt-3 space-y-2" : "space-y-2"}>
        {entries.map(([label, n]) => (
          <li key={label} className="flex items-center gap-3 text-sm">
            <span className="w-28 flex-none truncate text-muted">{label}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
              <span
                className="block h-full rounded-full bg-green"
                style={{ width: `${(n / max) * 100}%` }}
              />
            </span>
            <span className="w-6 flex-none text-right font-medium text-forest-700">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-sand/60 text-muted",
  SUBMITTED: "bg-forest/10 text-forest-700",
  UNDER_REVIEW: "bg-accent/15 text-accent-600",
  PRESELECTED: "bg-green/15 text-green",
  REJECTED: "bg-red-100 text-red-700",
  FINALIST: "bg-olive/20 text-olive",
  WINNER: "bg-green text-cream-50",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] ?? "bg-sand/60 text-muted"
      }`}
    >
      {label}
    </span>
  );
}
