// Graphiques légers en SVG/CSS — rendus côté serveur, thème CINOVA.

export const CHART_COLORS = [
  "#2e7d46", // green
  "#e98a2b", // accent
  "#6e7f2c", // olive
  "#1c5231", // forest-700
  "#a9be8e", // sage
  "#4c9a5e", // green-500
  "#d0761c", // accent-600
  "#123a24", // forest
];

/* ---------------- Donut ---------------- */
export function Donut({
  segments,
  centerValue,
  centerLabel,
  size = 160,
}: {
  segments: { label: string; value: number; color?: string }[];
  centerValue?: string | number;
  centerLabel?: string;
  size?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const R = 15.9155; // circonférence = 100
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg viewBox="0 0 42 42" width={size} height={size} className="flex-none">
        <circle cx="21" cy="21" r={R} fill="transparent" stroke="var(--color-sand)" strokeWidth="5" />
        {total > 0 &&
          segments.map((seg, i) => {
            const pct = (seg.value / total) * 100;
            const dash = `${pct} ${100 - pct}`;
            const el = (
              <circle
                key={i}
                cx="21"
                cy="21"
                r={R}
                fill="transparent"
                stroke={seg.color ?? CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth="5"
                strokeDasharray={dash}
                strokeDashoffset={25 - offset}
                strokeLinecap="butt"
              />
            );
            offset += pct;
            return el;
          })}
        <text x="21" y="20" textAnchor="middle" className="fill-forest" style={{ fontSize: 6, fontWeight: 700 }}>
          {centerValue ?? total}
        </text>
        {centerLabel && (
          <text x="21" y="26" textAnchor="middle" className="fill-current text-muted" style={{ fontSize: 2.6 }}>
            {centerLabel}
          </text>
        )}
      </svg>

      <ul className="space-y-1.5 text-sm">
        {segments.map((seg, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="h-3 w-3 flex-none rounded-sm"
              style={{ backgroundColor: seg.color ?? CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span className="text-ink/85">{seg.label}</span>
            <span className="font-semibold text-forest-700">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Barres verticales ---------------- */
export function VBars({
  data,
  height = 128,
  color = "var(--color-green)",
  labelEvery = 1,
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  labelEvery?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] font-medium text-muted opacity-0 transition group-hover:opacity-100">
              {d.value}
            </span>
            <div
              className="w-full rounded-t transition group-hover:opacity-80"
              style={{
                height: `${(d.value / max) * 100}%`,
                minHeight: 2,
                backgroundColor: color,
              }}
              title={`${d.label} : ${d.value}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[9px] text-muted">
            {i % labelEvery === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Aire (série temporelle) ---------------- */
export function AreaChart({
  data,
  height = 120,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 100;
  const H = 40;
  const n = data.length;
  const step = n > 1 ? W / (n - 1) : W;
  const pts = data.map((d, i) => [i * step, H - (d.value / max) * (H - 4) - 2] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-green)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-green)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areaGrad)" />
        <path d={line} fill="none" stroke="var(--color-green)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1 flex justify-between text-[9px] text-muted">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
