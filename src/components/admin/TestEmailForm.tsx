"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { sendTestEmailAction, type TestEmailState } from "@/lib/settings-actions";

const initial: TestEmailState = { status: "idle" };

export function TestEmailForm() {
  const t = useTranslations("settings");
  const [state, action, pending] = useActionState(sendTestEmailAction, initial);

  return (
    <div className="mt-4 border-t border-sand pt-4">
      <form action={action} className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-forest-700 transition hover:border-green hover:text-green disabled:opacity-60"
        >
          {pending ? t("testSending") : t("testSend")}
        </button>
        {state.status === "ok" && (
          <p className="text-sm font-medium text-green">{t("testOk", { email: state.message ?? "" })}</p>
        )}
      </form>
      {state.status === "error" && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {t("testError")} : {state.message}
        </p>
      )}
    </div>
  );
}
