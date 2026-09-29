"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logEvent } from "@/lib/audit";
import { sendStatusEmail } from "@/lib/mailer";
import { ApplicationStatus } from "@prisma/client";

// Statuts pour lesquels une notification au candidat a du sens.
const NOTIFY_STATUSES = new Set([
  "UNDER_REVIEW",
  "PRESELECTED",
  "REJECTED",
  "FINALIST",
  "WINNER",
]);

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

// Change le statut d'une candidature et enregistre un retour motivé (comité technique).
export async function setTeamStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = safeLocale(formData.get("locale"));
  const teamId = String(formData.get("teamId") || "");
  const statusRaw = String(formData.get("status") || "");
  const reviewNote = String(formData.get("reviewNote") || "").trim() || null;
  const notify = formData.get("notify") === "on";

  if (teamId && statusRaw in ApplicationStatus) {
    const before = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        status: true,
        name: true,
        leader: { select: { email: true, name: true, locale: true } },
      },
    });
    await prisma.team.update({
      where: { id: teamId },
      data: {
        status: statusRaw as ApplicationStatus,
        reviewNote,
        reviewedAt: new Date(),
      },
    });
    if (before && before.status !== statusRaw) {
      let emailed = false;
      if (notify && before.leader?.email && NOTIFY_STATUSES.has(statusRaw)) {
        const res = await sendStatusEmail(
          before.leader.email,
          before.leader.name,
          statusRaw,
          reviewNote,
          before.leader.locale,
        );
        emailed = res.ok;
      }
      await logEvent({
        action: "STATUS_CHANGE",
        actorEmail: admin.email,
        actorRole: "ADMIN",
        targetType: "TEAM",
        targetId: teamId,
        message: `${before.name || "(sans titre)"} : ${before.status} → ${statusRaw}`,
        meta: { from: before.status, to: statusRaw, note: reviewNote, emailed },
      });
    }
    revalidatePath(`/${locale}/admin/candidatures/${teamId}`);
    revalidatePath(`/${locale}/admin`);
  }
  redirect(`/${locale}/admin/candidatures/${teamId}`);
}

// Changement de statut en masse (plusieurs candidatures à la fois).
export async function bulkSetStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = safeLocale(formData.get("locale"));
  const statusRaw = String(formData.get("status") || "");
  const reviewNote = String(formData.get("reviewNote") || "").trim() || null;
  const notify = formData.get("notify") === "on";
  const teamIds = formData
    .getAll("teamIds")
    .filter((v): v is string => typeof v === "string" && v.length > 0);

  if (statusRaw in ApplicationStatus && teamIds.length > 0) {
    const teams = await prisma.team.findMany({
      where: { id: { in: teamIds } },
      select: {
        id: true,
        status: true,
        name: true,
        leader: { select: { email: true, name: true, locale: true } },
      },
    });
    await prisma.team.updateMany({
      where: { id: { in: teamIds } },
      data: { status: statusRaw as ApplicationStatus, reviewNote, reviewedAt: new Date() },
    });
    for (const t of teams) {
      if (t.status === statusRaw) continue;
      let emailed = false;
      if (notify && t.leader?.email && NOTIFY_STATUSES.has(statusRaw)) {
        const res = await sendStatusEmail(
          t.leader.email,
          t.leader.name,
          statusRaw,
          reviewNote,
          t.leader.locale,
        );
        emailed = res.ok;
      }
      await logEvent({
        action: "STATUS_CHANGE",
        actorEmail: admin.email,
        actorRole: "ADMIN",
        targetType: "TEAM",
        targetId: t.id,
        message: `${t.name || "(sans titre)"} : ${t.status} → ${statusRaw} (masse)`,
        meta: { from: t.status, to: statusRaw, note: reviewNote, emailed, bulk: true },
      });
    }
    revalidatePath(`/${locale}/admin/candidatures`);
    revalidatePath(`/${locale}/admin`);
  }
  redirect(`/${locale}/admin/candidatures`);
}

// Supprime une candidature (équipe + membres + pièces jointes + évaluations).
export async function deleteCandidatureAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = safeLocale(formData.get("locale"));
  const teamId = String(formData.get("teamId") || "");
  if (teamId) {
    const team = await prisma.team.findUnique({ where: { id: teamId }, select: { name: true } });
    await prisma.team.delete({ where: { id: teamId } }).catch(() => {});
    await logEvent({
      action: "DELETE",
      actorEmail: admin.email,
      actorRole: "ADMIN",
      targetType: "TEAM",
      targetId: teamId,
      message: `Suppression de la candidature : ${team?.name || "(sans titre)"}`,
    });
  }
  revalidatePath(`/${locale}/admin/candidatures`);
  redirect(`/${locale}/admin/candidatures`);
}

// Supprime un compte candidat (et ses candidatures).
export async function deleteCandidateAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = safeLocale(formData.get("locale"));
  const userId = String(formData.get("userId") || "");
  if (userId && userId !== admin.id) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true },
    });
    // On ne supprime que des comptes candidats via cette action.
    if (user && user.role === "CANDIDATE") {
      await prisma.$transaction([
        prisma.team.deleteMany({ where: { leaderId: userId } }),
        prisma.user.delete({ where: { id: userId } }),
      ]).catch(() => {});
      await logEvent({
        action: "DELETE",
        actorEmail: admin.email,
        actorRole: "ADMIN",
        targetType: "USER",
        targetId: userId,
        message: `Suppression du compte candidat : ${user.email}`,
      });
    }
  }
  revalidatePath(`/${locale}/admin/candidatures`);
  redirect(`/${locale}/admin/candidatures`);
}
