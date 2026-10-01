import { requireBackoffice } from "@/lib/admin";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAuditLogsPaged, AUDIT_ACTIONS } from "@/lib/audit";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { Pagination } from "@/components/admin/Pagination";

export const metadata: Metadata = { title: "Logs" };
export const dynamic = "force-dynamic";

const filterCls =
  "rounded-xl border border-sand bg-cream px-3 py-2.5 text-sm text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green/20";

const ACTION_STYLES: Record<string, string> = {
  REGISTER: "bg-green/15 text-green",
  LOGIN: "bg-forest/10 text-forest-700",
  SUBMIT: "bg-accent/15 text-accent-600",
  STATUS_CHANGE: "bg-olive/20 text-olive",
};

export default async function LogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ action?: string; page?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireBackoffice();
  const sp = await searchParams;

  const paged = await getAuditLogsPaged({ action: sp.action, page: Number(sp.page) || 1 });
  const logs = paged.rows;
  const t = await getTranslations("admin");
  const tActions = await getTranslations("admin.auditActions");

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <Reveal>
        <p className="eyebrow text-accent-600">{t("eyebrow")}</p>
        <h1 className="font-display text-3xl font-bold text-forest">{t("navLogs")}</h1>
        <p className="mt-2 text-muted">{t("logsSubtitle")}</p>
      </Reveal>

      {/* Filtre par action */}
      <Reveal delay={60} className="mt-8">
        <form method="get" className="flex flex-wrap items-center gap-3 rounded-2xl border border-sand bg-cream-50 p-4">
          <select name="action" defaultValue={sp.action ?? ""} className={filterCls}>
            <option value="">{t("allActions")}</option>
            {AUDIT_ACTIONS.map((a) => (
              <option key={a} value={a}>{tActions(a)}</option>
            ))}
          </select>
          <button className="rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-700">
            {t("filter")}
          </button>
          <Link href="/admin/logs" className="rounded-xl border border-sand px-4 py-2.5 text-sm font-semibold text-forest-700 transition hover:border-green">
            {t("reset")}
          </Link>
        </form>
      </Reveal>

      <Reveal delay={100} className="mt-6">
        <p className="mb-3 text-sm text-muted">{t("logsCount", { count: paged.total })}</p>
        <div className="overflow-hidden rounded-2xl border border-sand">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-cream-200/60 text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("colDate")}</th>
                  <th className="px-4 py-3 font-semibold">{t("colAction")}</th>
                  <th className="px-4 py-3 font-semibold">{t("colActor")}</th>
                  <th className="px-4 py-3 font-semibold">{t("colMessage")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand bg-cream-50">
                {logs.map((log) => (
                  <tr key={log.id} className="align-top transition hover:bg-cream-200/40">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                      {log.createdAt.toLocaleString(locale)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ACTION_STYLES[log.action] ?? "bg-sand/60 text-muted"}`}>
                        {tActions(log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink/80">
                      {log.actorEmail ?? "—"}
                      {log.actorRole && (
                        <span className="block text-xs text-muted">{log.actorRole}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink/80">{log.message ?? "—"}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-muted">{t("logsEmpty")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination page={paged.page} pages={paged.pages} params={sp} basePath="/admin/logs" />
      </Reveal>
    </div>
  );
}
