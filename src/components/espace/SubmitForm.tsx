"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { submitCandidatureAction } from "@/lib/candidature-actions";
import { IconCheck } from "@/components/icons";

// Dépôt de la candidature : acceptation du règlement + confirmation en deux temps.
export function SubmitForm({ canSubmit }: { canSubmit: boolean }) {
  const t = useTranslations("espace.projet");
  const locale = useLocale();
  const [accepted, setAccepted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [armed, setArmed] = useState(false);

  return (
    <form action={submitCandidatureAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />

      {/* Case obligatoire : lecture du règlement */}
      <label className="flex items-start gap-2.5 text-sm text-cream-100/90">
        <input
          name="acceptRules"
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-accent"
        />
        <span>
          {t("acceptPre")}{" "}
          <Link href="/reglement" target="_blank" className="font-semibold text-accent underline">
            {t("acceptLink")}
          </Link>
        </span>
      </label>

      {!armed ? (
        <button
          type="button"
          disabled={!accepted || !canSubmit}
          onClick={() => setArmed(true)}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconCheck className="h-4 w-4" />
          {t("submitBtn")}
        </button>
      ) : (
        <div className="rounded-xl border border-cream-100/25 bg-forest-700/60 p-4">
          <label className="flex items-start gap-2.5 text-sm text-cream-100/90">
            <input
              name="confirm"
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-accent"
            />
            <span>{t("confirmLabel")}</span>
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!confirmed}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconCheck className="h-4 w-4" />
              {t("confirmBtn")}
            </button>
            <button
              type="button"
              onClick={() => setArmed(false)}
              className="rounded-full border border-cream-100/30 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-cream-100/10"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
