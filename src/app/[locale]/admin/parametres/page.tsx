import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSmtpSettings, getEditionForSettings, getAllCriteria, getQuotaTarget } from "@/lib/settings";
import {
  saveEditionAction,
  saveSmtpAction,
  saveQuotaAction,
  saveCriterionAction,
  deleteCriterionAction,
  purgeAction,
} from "@/lib/settings-actions";
import { Reveal } from "@/components/Reveal";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { TestEmailForm } from "@/components/admin/TestEmailForm";

export const metadata: Metadata = { title: "Paramètres" };
export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-xl border border-sand bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green/20";
const btn =
  "rounded-full bg-green px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-700";

function dtLocal(d: Date | null | undefined) {
  return d ? d.toISOString().slice(0, 16) : "";
}

export default async function ParametresPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const [edition, smtp, criteria, quotaTarget, logsCount, visitsCount] = await Promise.all([
    getEditionForSettings(),
    getSmtpSettings(),
    getAllCriteria(),
    getQuotaTarget(),
    prisma.auditLog.count(),
    prisma.pageView.count(),
  ]);

  const t = await getTranslations("settings");
  const ta = await getTranslations("admin");
  const weightSum = criteria.filter((c) => c.isActive).reduce((s, c) => s + c.weight, 0);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <Reveal>
        <p className="eyebrow text-accent-600">{t("eyebrow")}</p>
        <h1 className="font-display text-3xl font-bold text-forest">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("subtitle")}</p>
      </Reveal>

      {sp.saved && (
        <div className="mt-6 rounded-xl border border-green/30 bg-green/10 px-4 py-3 text-sm font-medium text-green">
          {t("saved")}
        </div>
      )}

      {/* Édition */}
      <Reveal delay={60} className="mt-8">
        <Section title={t("editionTitle")} subtitle={t("editionSubtitle")}>
          <form action={saveEditionAction} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("editionName")}>
                <input name="name" defaultValue={edition?.name ?? "CINOVA 2026"} className={inputCls} />
              </Field>
              <Field label={t("editionYear")}>
                <input name="year" type="number" defaultValue={edition?.year ?? 2026} className={inputCls} />
              </Field>
              <Field label={t("openAt")}>
                <input name="openAt" type="datetime-local" defaultValue={dtLocal(edition?.applicationsOpenAt)} className={inputCls} />
              </Field>
              <Field label={t("closeAt")}>
                <input name="closeAt" type="datetime-local" defaultValue={dtLocal(edition?.applicationsCloseAt)} className={inputCls} />
              </Field>
            </div>
            <label className="flex items-center gap-2.5 text-sm text-ink/85">
              <input type="checkbox" name="isActive" defaultChecked={edition?.isActive ?? true} className="h-4 w-4 accent-green" />
              {t("editionActive")}
            </label>
            <button className={btn}>{t("save")}</button>
          </form>
        </Section>
      </Reveal>

      {/* Email SMTP */}
      <Reveal delay={100} className="mt-6">
        <Section title={t("smtpTitle")} subtitle={t("smtpSubtitle")}>
          <form action={saveSmtpAction} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("host")}>
                <input name="host" defaultValue={smtp.host} placeholder="smtp.exemple.com" className={inputCls} />
              </Field>
              <Field label={t("port")}>
                <input name="port" type="number" defaultValue={smtp.port} className={inputCls} />
              </Field>
              <Field label={t("user")}>
                <input name="user" defaultValue={smtp.user} className={inputCls} />
              </Field>
              <Field label={t("password")} hint={smtp.hasPassword ? t("passwordSet") : undefined}>
                <input name="password" type="password" placeholder="••••••••" className={inputCls} />
              </Field>
              <Field label={t("from")} hint={t("fromHint")}>
                <input name="from" defaultValue={smtp.from} placeholder="cinova@mon-domaine.com" className={inputCls} />
              </Field>
            </div>
            <p className="text-xs text-muted">{t("smtpHint")}</p>
            <button className={btn}>{t("save")}</button>
          </form>
          <TestEmailForm />
        </Section>
      </Reveal>

      {/* Quota régional */}
      <Reveal delay={120} className="mt-6">
        <Section title={ta("quotaTitle")} subtitle={ta("quotaSubtitle")}>
          <form action={saveQuotaAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="locale" value={locale} />
            <Field label={ta("quotaTargetField")}>
              <input name="target" type="number" min={0} defaultValue={quotaTarget} className={`${inputCls} w-40`} />
            </Field>
            <button className={btn}>{ta("saveQuota")}</button>
          </form>
        </Section>
      </Reveal>

      {/* Grille de notation */}
      <Reveal delay={140} className="mt-6">
        <Section title={t("gridTitle")} subtitle={t("gridSubtitle")}>
          <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${weightSum === 100 ? "bg-green/15 text-green" : "bg-accent/15 text-accent-600"}`}>
            {t("weightSum", { sum: weightSum })}
          </div>

          <div className="space-y-3">
            {criteria.map((c) => (
              <div key={c.id} className="rounded-xl border border-sand bg-cream p-4">
                <form action={saveCriterionAction} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={c.id} />
                  <div className="min-w-[180px] flex-1">
                    <label className="mb-1 block text-xs text-muted">{t("criterion")}</label>
                    <input name="label" defaultValue={c.label} className={inputCls} />
                  </div>
                  <div className="w-20">
                    <label className="mb-1 block text-xs text-muted">{t("weight")}</label>
                    <input name="weight" type="number" defaultValue={c.weight} className={inputCls} />
                  </div>
                  <div className="w-20">
                    <label className="mb-1 block text-xs text-muted">{t("maxScore")}</label>
                    <input name="maxScore" type="number" defaultValue={c.maxScore} className={inputCls} />
                  </div>
                  <label className="flex items-center gap-2 pb-2.5 text-xs text-ink/85">
                    <input type="checkbox" name="isActive" defaultChecked={c.isActive} className="h-4 w-4 accent-green" />
                    {t("active")}
                  </label>
                  <button className="rounded-full bg-forest-700 px-4 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest">
                    {t("save")}
                  </button>
                </form>
                <form action={deleteCriterionAction} className="mt-2">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-xs font-semibold text-red-600 hover:underline">{t("deleteCriterion")}</button>
                </form>
              </div>
            ))}
          </div>

          {/* Ajouter un critère */}
          <form action={saveCriterionAction} className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-sand p-4">
            <input type="hidden" name="locale" value={locale} />
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 block text-xs text-muted">{t("addLabel")}</label>
              <input name="label" required className={inputCls} />
            </div>
            <div className="w-20">
              <label className="mb-1 block text-xs text-muted">{t("weight")}</label>
              <input name="weight" type="number" defaultValue={0} className={inputCls} />
            </div>
            <div className="w-20">
              <label className="mb-1 block text-xs text-muted">{t("maxScore")}</label>
              <input name="maxScore" type="number" defaultValue={5} className={inputCls} />
            </div>
            <input type="hidden" name="isActive" value="on" />
            <button className={btn}>{t("addCriterion")}</button>
          </form>
        </Section>
      </Reveal>

      {/* Maintenance */}
      <Reveal delay={180} className="mt-6">
        <Section title={t("maintenanceTitle")} subtitle={t("maintenanceSubtitle")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-sand bg-cream p-4">
              <p className="text-sm font-medium text-forest-700">{t("logsLabel")}</p>
              <p className="mb-3 text-xs text-muted">{t("count", { n: logsCount })}</p>
              <form action={purgeAction}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="type" value="logs" />
                <ConfirmSubmit label={t("purge")} confirmLabel={t("confirm")} cancelLabel={t("cancel")} />
              </form>
            </div>
            <div className="rounded-xl border border-sand bg-cream p-4">
              <p className="text-sm font-medium text-forest-700">{t("visitsLabel")}</p>
              <p className="mb-3 text-xs text-muted">{t("count", { n: visitsCount })}</p>
              <form action={purgeAction}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="type" value="visits" />
                <ConfirmSubmit label={t("purge")} confirmLabel={t("confirm")} cancelLabel={t("cancel")} />
              </form>
            </div>
          </div>
        </Section>
      </Reveal>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-sand bg-cream-50 p-6 sm:p-8">
      <h2 className="font-display text-lg font-semibold text-forest-700">{title}</h2>
      {subtitle && <p className="mt-1 mb-5 text-sm text-muted">{subtitle}</p>}
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-forest-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
