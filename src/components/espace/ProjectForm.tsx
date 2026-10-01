"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { saveProjectAction, type FormState } from "@/lib/candidature-actions";
import { BENEFICIARY_KEYS, HEARD_ABOUT_KEYS } from "@/lib/candidature-options";
import { Field, inputCls, SavedToast } from "./formkit";
import {
  IconSpark,
  IconRefresh,
  IconTarget,
  IconAlert,
  IconLeaf,
  IconUsers,
  IconDocument,
  IconAdvisory,
  IconRocket,
  IconBook,
} from "@/components/icons";

const TRACKS = ["CREATION", "ADAPTATION"] as const;
const CODE_TO_KEY: Record<string, string> = {
  ALERT: "alert", MARKET: "market", INPUTS: "inputs", WARRANTAGE: "warrantage",
  COOP: "cooperatives", ADVISORY: "advisory", SOIL: "soil", AGROECOLOGY: "agroecology", RELIABILITY: "reliability",
};

type Props = {
  team: {
    name: string;
    problem: string | null;
    solution: string | null;
    description: string | null;
    track: string;
    challengeId: string | null;
    beneficiaries: string[];
    heardAbout: string | null;
    motivation: string | null;
    otherInfo: string | null;
  } | null;
  challenges: { id: string; code: string }[];
  locked?: boolean;
};

const initial: FormState = { status: "idle" };
const ic = "h-4 w-4";

export function ProjectForm({ team, challenges, locked }: Props) {
  const t = useTranslations("espace.projet");
  const tc = useTranslations("challenges");
  const tt = useTranslations("tracks");
  const tb = useTranslations("beneficiaries");
  const th = useTranslations("heardAbout");
  const te = useTranslations("espace.projet.errors");
  const locale = useLocale();
  const [state, action, pending] = useActionState(saveProjectAction, initial);

  const err = (k: string) =>
    state.fieldErrors?.[k] ? te(state.fieldErrors[k]) : undefined;
  const selected = new Set(team?.beneficiaries ?? []);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />

      <Field label={t("projectName")} error={err("name")} icon={<IconSpark className={ic} />}>
        <input name="name" defaultValue={team?.name ?? ""} required disabled={locked} className={inputCls} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("track")} icon={<IconRefresh className={ic} />}>
          <select name="track" defaultValue={team?.track ?? "CREATION"} disabled={locked} className={inputCls}>
            {TRACKS.map((tk) => (
              <option key={tk} value={tk}>{tt(`${tk.toLowerCase()}.title`)}</option>
            ))}
          </select>
        </Field>
        <Field label={t("challenge")} icon={<IconTarget className={ic} />}>
          <select name="challengeId" defaultValue={team?.challengeId ?? ""} disabled={locked} className={inputCls}>
            <option value="">{t("challengePlaceholder")}</option>
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>
                {tc(`items.${CODE_TO_KEY[c.code] ?? "alert"}.title`)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t("problem")} hint={t("problemHint")} icon={<IconAlert className={ic} />}>
        <textarea name="problem" defaultValue={team?.problem ?? ""} rows={3} disabled={locked} className={inputCls} />
      </Field>

      <Field label={t("solution")} hint={t("solutionHint")} icon={<IconLeaf className={ic} />}>
        <textarea name="solution" defaultValue={team?.solution ?? ""} rows={3} disabled={locked} className={inputCls} />
      </Field>

      {/* Bénéficiaires : checklist */}
      <Field label={t("beneficiaries")} hint={t("beneficiariesHint")} icon={<IconUsers className={ic} />}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {BENEFICIARY_KEYS.map((k) => (
            <label
              key={k}
              className="flex items-center gap-2.5 rounded-xl border border-sand bg-cream px-3 py-2 text-sm text-ink/85 transition hover:border-green/40"
            >
              <input
                type="checkbox"
                name="beneficiaries"
                value={k}
                defaultChecked={selected.has(k)}
                disabled={locked}
                className="h-4 w-4 accent-green"
              />
              {tb(k)}
            </label>
          ))}
        </div>
      </Field>

      <Field label={t("description")} hint={t("descriptionHint")} icon={<IconDocument className={ic} />}>
        <textarea name="description" defaultValue={team?.description ?? ""} rows={4} disabled={locked} className={inputCls} />
      </Field>

      {/* Section complémentaire */}
      <div className="border-t border-sand pt-5">
        <h3 className="font-display text-lg font-semibold text-forest-700">
          {t("complementaryTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted">{t("complementarySubtitle")}</p>

        <div className="mt-4 space-y-4">
          <Field label={t("heardAbout")} icon={<IconAdvisory className={ic} />}>
            <select name="heardAbout" defaultValue={team?.heardAbout ?? ""} disabled={locked} className={inputCls}>
              <option value="">{t("heardAboutPlaceholder")}</option>
              {HEARD_ABOUT_KEYS.map((k) => (
                <option key={k} value={k}>{th(k)}</option>
              ))}
            </select>
          </Field>

          <Field label={t("motivation")} hint={t("motivationHint")} icon={<IconRocket className={ic} />}>
            <textarea name="motivation" defaultValue={team?.motivation ?? ""} rows={3} disabled={locked} className={inputCls} />
          </Field>

          <Field label={t("otherInfo")} hint={t("otherInfoHint")} icon={<IconBook className={ic} />}>
            <textarea name="otherInfo" defaultValue={team?.otherInfo ?? ""} rows={3} disabled={locked} className={inputCls} />
          </Field>
        </div>
      </div>

      <SavedToast show={state.status === "success"} label={t("saved")} />

      {!locked && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-green px-6 py-3 text-sm font-semibold text-cream-50 shadow-sm transition hover:bg-forest-700 disabled:opacity-60"
          >
            {pending ? t("saving") : t("save")}
          </button>
          <span className="text-xs text-muted">{t("saveHint")}</span>
        </div>
      )}
    </form>
  );
}
