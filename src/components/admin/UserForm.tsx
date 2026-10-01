"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { saveUserAction, type UserManagementState } from "@/lib/user-management-actions";

const roles = ["CANDIDATE", "JURY", "ADMIN", "AUDITOR", "REGIONAL_RELAY"];
const inputClass = "w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm";
const initial: UserManagementState = { status: "idle" };

export function UserForm({ user, self = false }: {
  user?: { id: string; name: string | null; email: string; role: string; isActive: boolean };
  self?: boolean;
}) {
  const t = useTranslations("users");
  const tr = useTranslations("roles");
  const locale = useLocale();
  const [state, action, pending] = useActionState(saveUserAction, initial);
  return (
    <form action={action} className="grid gap-3 rounded-xl border border-sand bg-cream-50 p-4 sm:grid-cols-2">
      <input type="hidden" name="locale" value={locale} />
      {user && <input type="hidden" name="id" value={user.id} />}
      <label className="text-sm">{t("name")}<input name="name" required minLength={2} maxLength={120} defaultValue={user?.name ?? ""} className={inputClass} /></label>
      <label className="text-sm">{t("email")}<input name="email" type="email" required readOnly={!!user} defaultValue={user?.email ?? ""} className={inputClass} /></label>
      <label className="text-sm">{t("role")}<select name="role" defaultValue={user?.role ?? "JURY"} className={inputClass} disabled={self}>{roles.map(role => <option key={role} value={role}>{tr(role)}</option>)}</select></label>
      {self && <input type="hidden" name="role" value="ADMIN" />}
      {!user && <label className="text-sm">{t("password")}<input name="password" type="password" required minLength={12} autoComplete="new-password" className={inputClass} /></label>}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={user?.isActive ?? true} disabled={self} />{t("active")}</label>
      {self && <input type="hidden" name="isActive" value="on" />}
      {!user && <p className="text-xs text-muted sm:col-span-2">{t("createHint")}</p>}
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="rounded-full bg-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{pending ? t("saving") : user ? t("save") : t("create")}</button>
        {state.status === "success" && <p role="status" className="text-sm text-green">{t("saved")}</p>}
        {state.status === "error" && <p role="alert" className="text-sm text-red-700">{t(`errors.${state.error}`)}</p>}
      </div>
    </form>
  );
}
