"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { registerAction, type RegisterState } from "@/lib/auth-actions";
import { IconCheck } from "@/components/icons";

const REGIONS = [
  "AGADEZ", "DIFFA", "DOSSO", "MARADI", "NIAMEY", "TAHOUA", "TILLABERI", "ZINDER",
] as const;

const initial: RegisterState = { status: "idle" };

export function RegisterForm() {
  const t = useTranslations("auth");
  const tr = useTranslations("regions");
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(registerAction, initial);

  if (state.status === "success") {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green/15 text-green">
          <IconCheck className="h-7 w-7" />
        </span>
        <h2 className="font-display mt-4 text-lg font-semibold text-forest">
          {t("register.successTitle")}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {t("register.successText", { email: state.email ?? "" })}
        </p>
        {state.devLink && (
          <div className="mt-5 rounded-xl border border-accent/30 bg-accent/10 p-4 text-left">
            <p className="text-xs font-medium text-accent-600">{t("register.devLinkLabel")}</p>
            <a
              href={state.devLink}
              className="mt-1 block break-all text-xs text-forest-700 underline"
            >
              {t("register.openLink")}
            </a>
          </div>
        )}
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-green px-6 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-700"
        >
          {t("register.loginLink")}
        </Link>
      </div>
    );
  }

  const err = (k: string) =>
    state.fieldErrors?.[k] ? t(`errors.${state.fieldErrors[k]}`) : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />

      <Field label={t("register.name")} error={err("name")}>
        <input name="name" type="text" autoComplete="name" required className={inputCls} />
      </Field>

      <Field label={t("register.email")} error={err("email")}>
        <input name="email" type="email" autoComplete="email" required className={inputCls} />
      </Field>

      <Field label={t("register.password")} error={err("password")} hint={t("register.passwordHint")}>
        <input name="password" type="password" autoComplete="new-password" required className={inputCls} />
      </Field>

      <Field label={t("register.confirm")} error={err("confirm")}>
        <input name="confirm" type="password" autoComplete="new-password" required className={inputCls} />
      </Field>

      <Field label={t("register.region")}>
        <select name="region" defaultValue="" className={inputCls}>
          <option value="">{t("register.regionPlaceholder")}</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{tr(r)}</option>
          ))}
        </select>
      </Field>

      <label className="flex items-start gap-2.5 text-sm text-ink/85">
        <input name="acceptRules" type="checkbox" className="mt-0.5 h-4 w-4 accent-green" />
        <span>
          {t("register.acceptPre")}{" "}
          <Link href="/reglement" target="_blank" className="font-medium text-green underline">
            {t("register.acceptLink")}
          </Link>
        </span>
      </label>
      {err("acceptRules") && <p className="text-xs text-red-600">{err("acceptRules")}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-green px-6 py-3 text-sm font-semibold text-cream-50 shadow-sm transition hover:bg-forest-700 disabled:opacity-60"
      >
        {isPending ? t("register.submitting") : t("register.submit")}
      </button>

      <p className="text-center text-sm text-muted">
        {t("register.haveAccount")}{" "}
        <Link href="/login" className="font-medium text-green hover:underline">
          {t("register.loginLink")}
        </Link>
      </p>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-sand bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green/20";

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-forest-700">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
