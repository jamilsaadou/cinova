"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { bulkSetStatusAction } from "@/lib/admin-actions";
import { IconArrowRight } from "@/components/icons";
import { StatusBadge } from "@/components/admin/widgets";

export type Row = {
  id: string;
  name: string;
  leader: string;
  email: string;
  region: string;
  challenge: string;
  members: number;
  status: string;
  statusLabel: string;
};

type Labels = {
  colProject: string;
  colLeader: string;
  colRegion: string;
  colChallenge: string;
  colMembers: string;
  colStatus: string;
  open: string;
  empty: string;
  selected: string;
  chooseStatus: string;
  note: string;
  notify: string;
  apply: string;
  bulkTitle: string;
};

export function CandidaturesTable({
  readOnly = false,
  rows,
  statusOptions,
  labels,
}: {
  readOnly?: boolean;
  rows: Row[];
  statusOptions: { value: string; label: string }[];
  labels: Labels;
}) {
  const locale = useLocale();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allChecked = rows.length > 0 && selected.size === rows.length;
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(rows.map((r) => r.id)));

  return (
    <form action={bulkSetStatusAction}>
      <input type="hidden" name="locale" value={locale} />
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="teamIds" value={id} />
      ))}

      {/* Barre d'action groupée */}
      {!readOnly && selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-green/40 bg-green/5 p-3">
          <span className="text-sm font-semibold text-forest-700">
            {selected.size} {labels.selected}
          </span>
          <select
            name="status"
            defaultValue=""
            required
            className="rounded-xl border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-green"
          >
            <option value="" disabled>{labels.chooseStatus}</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <input
            name="reviewNote"
            placeholder={labels.note}
            className="min-w-[180px] flex-1 rounded-xl border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-green"
          />
          <label className="flex items-center gap-2 text-sm text-ink/85">
            <input type="checkbox" name="notify" defaultChecked className="h-4 w-4 accent-green" />
            {labels.notify}
          </label>
          <button className="rounded-full bg-green px-5 py-2 text-sm font-semibold text-cream-50 transition hover:bg-forest-700">
            {labels.apply}
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-sand">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-cream-200/60 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={allChecked}
                    onChange={toggleAll}
                    aria-label="tout"
                    className="h-4 w-4 accent-green"
                  />
                </th>
                <th className="px-4 py-3 font-semibold">{labels.colProject}</th>
                <th className="px-4 py-3 font-semibold">{labels.colLeader}</th>
                <th className="px-4 py-3 font-semibold">{labels.colRegion}</th>
                <th className="px-4 py-3 font-semibold">{labels.colChallenge}</th>
                <th className="px-4 py-3 font-semibold">{labels.colMembers}</th>
                <th className="px-4 py-3 font-semibold">{labels.colStatus}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-sand bg-cream-50">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={`transition hover:bg-cream-200/40 ${selected.has(r.id) ? "bg-green/5" : ""}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      disabled={readOnly}
                      checked={selected.has(r.id)}
                      onChange={() => toggle(r.id)}
                      className="h-4 w-4 accent-green"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-forest-700">{r.name}</td>
                  <td className="px-4 py-3 text-ink/80">
                    {r.leader}
                    <span className="block text-xs text-muted">{r.email}</span>
                  </td>
                  <td className="px-4 py-3 text-ink/80">{r.region}</td>
                  <td className="px-4 py-3 text-ink/80">{r.challenge}</td>
                  <td className="px-4 py-3 text-ink/80">{r.members}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} label={r.statusLabel} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/candidatures/${r.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-green hover:underline"
                    >
                      {labels.open} <IconArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted">{labels.empty}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
}
