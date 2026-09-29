"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { updateProfileAction, type FormState } from "@/lib/candidature-actions";
import { Field, inputCls, SavedToast } from "./formkit";

const GENDERS = ["FEMALE", "MALE", "UNDISCLOSED"] as const;
const REGIONS = [
  "AGADEZ", "DIFFA", "DOSSO", "MARADI", "NIAMEY", "TAHOUA", "TILLABERI", "ZINDER",
] as const;

type Props = {
  user: {
    name: string | null;
    phone: string | null;
    organization: string | null;
    gender: string | null;
    region: string | null;
  };
};

const initial: FormState = { status: "idle" };

export function ProfileForm({ user }: Props) {
  const t = useTranslations("espace.profil");
  const tg = useTranslations("genders");
  const trg = useTranslations("regions");
  const te = useTranslations("espace.errors");
  const locale = useLocale();
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  const err = (k: string) =>
    state.fieldErrors?.[k] ? te(state.fieldErrors[k]) : undefined;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />

      <Field label={t("name")} error={err("name")}>
        <input name="name" defaultValue={user.name ?? ""} required className={inputCls} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("phone")}>
          <input name="phone" defaultValue={user.phone ?? ""} className={inputCls} />
        </Field>
        <Field label={t("organization")}>
          <input name="organization" defaultValue={user.organization ?? ""} className={inputCls} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("gender")}>
          <select name="gender" defaultValue={user.gender ?? ""} className={inputCls}>
            <option value="">{t("placeholder")}</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{tg(g)}</option>
            ))}
          </select>
        </Field>
        <Field label={t("region")}>
          <select name="region" defaultValue={user.region ?? ""} className={inputCls}>
            <option value="">{t("placeholder")}</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{trg(r)}</option>
            ))}
          </select>
        </Field>
      </div>

      <SavedToast show={state.status === "success"} label={t("saved")} />

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-green px-6 py-3 text-sm font-semibold text-cream-50 shadow-sm transition hover:bg-forest-700 disabled:opacity-60"
      >
        {pending ? t("saving") : t("save")}
      </button>
    </form>
  );
}
