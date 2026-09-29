"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logEvent } from "@/lib/audit";
import { sendTestEmail } from "@/lib/mailer";

const LOCALES = ["fr", "en", "ha"] as const;
function safeLocale(v: FormDataEntryValue | null): string {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v) ? v : "fr";
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/espace");
  return session.user;
}

function str(v: FormDataEntryValue | null) {
  return typeof v === "string" ? v.trim() : "";
}
function parseDate(v: FormDataEntryValue | null): Date | null {
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function upsertSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

// ───────────────────────── Édition ─────────────────────────

export async function saveEditionAction(formData: FormData) {
  await requireAdmin();
  const locale = safeLocale(formData.get("locale"));

  const name = str(formData.get("name")) || "CINOVA";
  const year = Number(formData.get("year")) || new Date().getFullYear();
  const isActive = formData.get("isActive") === "on";
  const applicationsOpenAt = parseDate(formData.get("openAt"));
  const applicationsCloseAt = parseDate(formData.get("closeAt"));

  const existing = await prisma.edition.findFirst({
    orderBy: [{ isActive: "desc" }, { year: "desc" }],
  });
  if (existing) {
    await prisma.edition.update({
      where: { id: existing.id },
      data: { name, year, isActive, applicationsOpenAt, applicationsCloseAt },
    });
  } else {
    await prisma.edition.create({
      data: { name, year, isActive, applicationsOpenAt, applicationsCloseAt },
    });
  }
  revalidatePath(`/${locale}/admin/parametres`);
  redirect(`/${locale}/admin/parametres?saved=edition`);
}

// ───────────────────────── Quota régional ─────────────────────────

export async function saveQuotaAction(formData: FormData) {
  await requireAdmin();
  const locale = safeLocale(formData.get("locale"));
  const target = Math.max(0, Math.min(100000, Number(formData.get("target")) || 0));
  await upsertSetting("quota_region_target", String(target));
  revalidatePath(`/${locale}/admin/parametres`);
  revalidatePath(`/${locale}/admin`);
  redirect(`/${locale}/admin/parametres?saved=quota`);
}

// ───────────────────────── Email (SMTP) ─────────────────────────

export async function saveSmtpAction(formData: FormData) {
  await requireAdmin();
  const locale = safeLocale(formData.get("locale"));

  await upsertSetting("smtp_host", str(formData.get("host")));
  await upsertSetting("smtp_port", str(formData.get("port")) || "587");
  await upsertSetting("smtp_user", str(formData.get("user")));
  await upsertSetting("smtp_from", str(formData.get("from")));
  const password = str(formData.get("password"));
  if (password) await upsertSetting("smtp_password", password);

  revalidatePath(`/${locale}/admin/parametres`);
  redirect(`/${locale}/admin/parametres?saved=smtp`);
}

export type TestEmailState = { status: "idle" | "ok" | "error"; message?: string };

// Envoie un email de test à l'admin et renvoie le résultat (diagnostic SMTP).
export async function sendTestEmailAction(
  _prev: TestEmailState,
  _formData: FormData,
): Promise<TestEmailState> {
  const admin = await requireAdmin();
  if (!admin.email) return { status: "error", message: "Aucune adresse email pour ce compte." };

  const res = await sendTestEmail(admin.email);
  if (res.skipped) return { status: "error", message: "SMTP non configuré. Enregistrez d'abord les paramètres." };
  if (res.ok) return { status: "ok", message: admin.email };
  return { status: "error", message: res.error ?? "Échec inconnu." };
}

// ───────────────────────── Grille de notation ─────────────────────────

export async function saveCriterionAction(formData: FormData) {
  await requireAdmin();
  const locale = safeLocale(formData.get("locale"));

  const id = str(formData.get("id"));
  const label = str(formData.get("label"));
  const code = str(formData.get("code")) || label.toUpperCase().replace(/[^A-Z0-9]+/g, "_").slice(0, 20) || `C_${Date.now()}`;
  const weight = Math.max(0, Math.min(100, Number(formData.get("weight")) || 0));
  const maxScore = Math.max(1, Math.min(20, Number(formData.get("maxScore")) || 5));
  const isActive = formData.get("isActive") === "on";

  if (!label) redirect(`/${locale}/admin/parametres`);

  if (id) {
    await prisma.criterion.update({
      where: { id },
      data: { label, weight, maxScore, isActive },
    });
  } else {
    const count = await prisma.criterion.count();
    await prisma.criterion.create({
      data: { code, label, weight, maxScore, isActive, order: count + 1 },
    });
  }
  revalidatePath(`/${locale}/admin/parametres`);
  redirect(`/${locale}/admin/parametres?saved=grid`);
}

export async function deleteCriterionAction(formData: FormData) {
  await requireAdmin();
  const locale = safeLocale(formData.get("locale"));
  const id = str(formData.get("id"));
  if (id) await prisma.criterion.delete({ where: { id } }).catch(() => {});
  revalidatePath(`/${locale}/admin/parametres`);
  redirect(`/${locale}/admin/parametres?saved=grid`);
}

// ───────────────────────── Maintenance (purge) ─────────────────────────

export async function purgeAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = safeLocale(formData.get("locale"));
  const type = str(formData.get("type"));

  if (type === "logs") {
    const { count } = await prisma.auditLog.deleteMany({});
    await logEvent({
      action: "STATUS_CHANGE",
      actorEmail: admin.email,
      actorRole: "ADMIN",
      message: `Purge des logs (${count})`,
    });
  } else if (type === "visits") {
    await prisma.pageView.deleteMany({});
  }
  revalidatePath(`/${locale}/admin/parametres`);
  redirect(`/${locale}/admin/parametres?saved=purge`);
}
