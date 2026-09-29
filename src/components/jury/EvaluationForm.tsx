"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { saveEvaluationAction } from "@/lib/jury-actions";
import { IconCheck } from "@/components/icons";

type Criterion = { id: string; label: string; weight: number; maxScore: number };

export function EvaluationForm({
  teamId,
  criteria,
  initialScores,
  initialComment,
  initialUsable,
  initialSubmitted = false,
}: {
  teamId: string;
  criteria: Criterion[];
  initialScores: Record<string, number>;
  initialComment: string | null;
  initialUsable: boolean | null;
  initialSubmitted?: boolean;
}) {
  const t = useTranslations("juryspace");
  const locale = useLocale();
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const s: Record<string, number> = {};
    for (const c of criteria) s[c.id] = initialScores[c.id] ?? Math.ceil(c.maxScore / 2);
    return s;
  });
  const [usable, setUsable] = useState<string>(
    initialUsable === true ? "yes" : initialUsable === false ? "no" : "",
  );

  return (
    <form action={saveEvaluationAction} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="teamId" value={teamId} />

      <div className="space-y-5">
        {criteria.map((c) => (
          <div key={c.id}>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-forest-700">
                {c.label}
                <span className="ml-2 text-xs text-muted">({c.weight}%)</span>
              </label>
              <span className="font-display text-sm font-bold text-green">
                {scores[c.id]} / {c.maxScore}
              </span>
            </div>
            <input
              type="range"
              name={`score_${c.id}`}
              min={0}
              max={c.maxScore}
              step={1}
              value={scores[c.id]}
              onChange={(e) => setScores((s) => ({ ...s, [c.id]: Number(e.target.value) }))}
              className="w-full accent-green"
            />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-accent/30 bg-accent/10 p-5">
        <p className="text-sm font-semibold text-forest-700">{t("usableQuestion")}</p>
          <p className="mt-1 text-xs text-muted">{t("usableHint")}</p>
          <div className="mt-3 flex gap-3">
            {(["yes", "no"] as const).map((v) => (
              <label
                key={v}
                className={`cursor-pointer rounded-full border px-5 py-2 text-sm font-semibold transition ${
                  usable === v
                    ? v === "yes"
                      ? "border-green bg-green text-cream-50"
                      : "border-red-400 bg-red-500 text-white"
                    : "border-sand text-forest-700 hover:border-green"
                }`}
              >
                <input
                  type="radio"
                  name="usable"
                  value={v}
                  checked={usable === v}
                  onChange={() => setUsable(v)}
                  className="sr-only"
                />
                {v === "yes" ? t("yes") : t("no")}
              </label>
            ))}
          </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-700">{t("comment")}</label>
        <textarea
          name="comment"
          defaultValue={initialComment ?? ""}
          rows={3}
          className="w-full rounded-xl border border-sand bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green/20"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          name="intent"
          value="submit"
          className="inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-cream-50 shadow-sm transition hover:bg-forest-700"
        >
          <IconCheck className="h-4 w-4" />
          {t("submit")}
        </button>
        <button
          type="submit"
          name="intent"
          value="draft"
          className="inline-flex items-center gap-2 rounded-full border border-sand px-6 py-3 text-sm font-semibold text-forest-700 transition hover:border-green"
        >
          {t("saveDraft")}
        </button>
        {initialSubmitted && (
          <span className="text-xs font-medium text-green">{t("alreadySubmitted")}</span>
        )}
      </div>
    </form>
  );
}
