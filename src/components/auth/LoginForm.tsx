"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  loginAction,
  resendVerificationAction,
  type LoginState,
  type ResendState,
} from "@/lib/auth-actions";

const loginInitial: LoginState = { status: "idle" };
const resendInitial: ResendState = { status: "idle" };

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { update, status } = useSession();
  const [email, setEmail] = useState("");
  const [state, formAction, isPending] = useActionState(
    async (previous: LoginState, formData: FormData): Promise<LoginState> => {
      const result = await loginAction(previous, formData);
      if (result.status === "success") {
        // Actualise tous les consommateurs de useSession, notamment le menu.
        await update();
        router.replace("/espace");
        router.refresh();
      }
      return result;
    },
    loginInitial,
  );

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-700">
            {t("login.email")}
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-700">
            {t("login.password")}
          </label>
          <input name="password" type="password" autoComplete="current-password" required className={inputCls} />
        </div>

        {state.status === "error" && state.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {t(`errors.${state.error}`)}
            {state.error === "not_verified" && <ResendBlock email={email} locale={locale} />}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || status === "loading" || state.status === "success"}
          className="w-full rounded-full bg-green px-6 py-3 text-sm font-semibold text-cream-50 shadow-sm transition hover:bg-forest-700 disabled:opacity-60"
        >
          {isPending ? t("login.submitting") : t("login.submit")}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        {t("login.noAccount")}{" "}
        <Link href="/register" className="font-medium text-green hover:underline">
          {t("login.registerLink")}
        </Link>
      </p>
    </div>
  );
}

function ResendBlock({ email, locale }: { email: string; locale: string }) {
  const t = useTranslations("auth");
  const [state, formAction, isPending] = useActionState(
    resendVerificationAction,
    resendInitial,
  );

  if (state.status === "sent") {
    return (
      <p className="mt-2 text-xs text-forest-700">
        {t("login.resent")}
        {state.devLink && (
          <>
            {" "}
            <a href={state.devLink} className="underline">
              {t("register.openLink")}
            </a>
          </>
        )}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-2">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        disabled={isPending}
        className="text-xs font-semibold text-accent-600 underline disabled:opacity-60"
      >
        {t("login.resend")}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-sand bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green/20";
