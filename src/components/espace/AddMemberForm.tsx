"use client";

import { useActionState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { addMemberAction, type FormState } from "@/lib/candidature-actions";
import { Field, inputCls } from "./formkit";

const GENDERS = ["FEMALE", "MALE", "UNDISCLOSED"] as const;
const ROLES = [
  "DEVELOPER", "DESIGNER", "DATA", "AGRONOMIST", "BUSINESS", "OTHER",
] as const;
const REGIONS = [
  "AGADEZ", "DIFFA", "DOSSO", "MARADI", "NIAMEY", "TAHOUA", "TILLABERI", "ZINDER",
] as const;

const initial: FormState = { status: "idle" };

export function AddMemberForm() {
  const t = useTranslations("espace.equipe");
  const tg = useTranslations("genders");
  const trg = useTranslations("regions");
  const trl = useTranslations("memberRoles");
  const te = useTranslations("espace.errors");
  const locale = useLocale();
  const [state, action, pending] = useActionState(addMemberAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  const err = (k: string) =>
    state.fieldErrors?.[k] ? te(state.fieldErrors[k]) : undefined;

  return (
    <form ref={formRef} action={action} className="space-y-4 rounded-2xl border border-sand bg-cream p-5">
      <h3 className="font-display text-sm font-semibold text-forest-700">{t("addTitle")}</h3>
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("memberName")} error={err("fullName")}>
          <input name="fullName" required className={inputCls} />
        </Field>
        <Field label={t("memberEmail")} error={err("email")}>
          <input name="email" type="email" className={inputCls} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("memberPhone")}>
          <input name="phone" className={inputCls} />
        </Field>
        <Field label={t("memberRole")}>
          <select name="role" defaultValue="OTHER" className={inputCls}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{trl(r)}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("memberGender")}>
          <select name="gender" defaultValue="" className={inputCls}>
            <option value="">—</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{tg(g)}</option>
            ))}
          </select>
        </Field>
        <Field label={t("memberRegion")}>
          <select name="region" defaultValue="" className={inputCls}>
            <option value="">—</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{trg(r)}</option>
            ))}
          </select>
        </Field>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest disabled:opacity-60"
      >
        {pending ? t("adding") : t("add")}
      </button>
    </form>
  );
}
