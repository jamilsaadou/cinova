"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logEvent } from "@/lib/audit";

const LOCALES = ["fr", "en", "ha"] as const;
function safeLocale(v: FormDataEntryValue | null): string {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v) ? v : "fr";
}
function str(v: FormDataEntryValue | null) {
  return typeof v === "string" ? v.trim() : "";
}

// Statuts éligibles à l'évaluation par le jury.
const EVAL_STATUSES = ["FINALIST", "PRESELECTED"] as const;

// Affecte une équipe à un juré (idempotent).
export async function assignAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = safeLocale(formData.get("locale"));
  const teamId = str(formData.get("teamId"));
  const juryId = str(formData.get("juryId"));

  if (teamId && juryId) {
    await prisma.assignment
      .create({ data: { teamId, juryId } })
      .catch(() => {}); // ignore le doublon (contrainte @@unique)
    await logEvent({
      action: "ASSIGN",
      actorEmail: admin.email,
      actorRole: "ADMIN",
      targetType: "TEAM",
      targetId: teamId,
      message: "Affectation d'un juré",
      meta: { juryId },
    });
  }
  revalidatePath(`/${locale}/admin/jury`);
  redirect(`/${locale}/admin/jury`);
}

// Retire l'affectation d'une équipe à un juré.
export async function unassignAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = safeLocale(formData.get("locale"));
  const teamId = str(formData.get("teamId"));
  const juryId = str(formData.get("juryId"));

  if (teamId && juryId) {
    await prisma.assignment
      .delete({ where: { teamId_juryId: { teamId, juryId } } })
      .catch(() => {});
    await logEvent({
      action: "ASSIGN",
      actorEmail: admin.email,
      actorRole: "ADMIN",
      targetType: "TEAM",
      targetId: teamId,
      message: "Retrait d'une affectation",
      meta: { juryId, removed: true },
    });
  }
  revalidatePath(`/${locale}/admin/jury`);
  redirect(`/${locale}/admin/jury`);
}

// Auto-affectation : « all » (chaque juré évalue chaque équipe),
// « roundrobin » (répartition tournante, 1 juré par équipe), « clear » (tout retirer).
export async function autoAssignAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = safeLocale(formData.get("locale"));
  const mode = str(formData.get("mode")) || "all";

  const [teams, jurors] = await Promise.all([
    prisma.team.findMany({ where: { status: { in: [...EVAL_STATUSES] } }, select: { id: true } }),
    prisma.user.findMany({ where: { role: "JURY" }, select: { id: true }, orderBy: { createdAt: "asc" } }),
  ]);

  if (mode === "clear") {
    await prisma.assignment.deleteMany({});
  } else if (jurors.length > 0) {
    // On repart d'une table propre pour refléter exactement le mode choisi.
    await prisma.assignment.deleteMany({});
    const data: { teamId: string; juryId: string }[] = [];
    if (mode === "roundrobin") {
      teams.forEach((team, i) => {
        data.push({ teamId: team.id, juryId: jurors[i % jurors.length].id });
      });
    } else {
      // « all » : produit cartésien équipes × jurés.
      for (const team of teams) for (const j of jurors) data.push({ teamId: team.id, juryId: j.id });
    }
    if (data.length > 0) await prisma.assignment.createMany({ data, skipDuplicates: true });
  }

  await logEvent({
    action: "ASSIGN",
    actorEmail: admin.email,
    actorRole: "ADMIN",
    message: `Auto-affectation (${mode})`,
    meta: { mode, teams: teams.length, jurors: jurors.length },
  });
  revalidatePath(`/${locale}/admin/jury`);
  redirect(`/${locale}/admin/jury`);
}
