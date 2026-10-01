"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logEvent } from "@/lib/audit";

const LOCALES = ["fr", "en", "ha"] as const;
function safeLocale(v: FormDataEntryValue | null): string {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v) ? v : "fr";
}

export async function saveEvaluationAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "JURY") redirect("/espace");

  const locale = safeLocale(formData.get("locale"));
  const teamId = String(formData.get("teamId") || "");

  const juryId = session.user.id;
  const team = await prisma.team.findUnique({ where: { id: teamId }, select: { status: true, name: true } });
  if (!team || !["FINALIST", "PRESELECTED"].includes(team.status)) {
    redirect(`/${locale}/jury`);
  }

  const assignments = await prisma.assignment.findMany({ where: { teamId }, select: { juryId: true } });
  if (assignments.length && !assignments.some((a) => a.juryId === juryId)) redirect(`/${locale}/jury`);

  const criteria = await prisma.criterion.findMany({ where: { isActive: true } });

  // Brouillon vs soumission : un brouillon n'est pas compté dans l'agrégation.
  const submitted = formData.get("intent") !== "draft";

  const comment = String(formData.get("comment") || "").trim() || null;
  const usable =
    formData.get("usable") === "no" ? false : formData.get("usable") === "yes" ? true : null;

  const scores = criteria.map((c) => {
    const raw = Number(formData.get(`score_${c.id}`));
    const value = Number.isFinite(raw) ? Math.max(0, Math.min(c.maxScore, Math.round(raw))) : 0;
    return { criterionId: c.id, value };
  });

  const evaluation = await prisma.evaluation.upsert({
    where: { teamId_juryId: { teamId, juryId } },
    update: { comment, usable, submitted },
    create: { teamId, juryId, comment, usable, submitted },
  });

  await prisma.score.deleteMany({ where: { evaluationId: evaluation.id } });
  await prisma.score.createMany({
    data: scores.map((s) => ({ evaluationId: evaluation.id, criterionId: s.criterionId, value: s.value })),
  });

  await logEvent({
    action: "JURY_SCORE",
    actorEmail: session.user.email,
    actorRole: "JURY",
    targetType: "TEAM",
    targetId: teamId,
    message: `${submitted ? "Évaluation" : "Brouillon"} : ${team.name || "(sans titre)"}`,
    meta: { usable, submitted },
  });

  revalidatePath(`/${locale}/jury`);
  redirect(`/${locale}/jury?done=${submitted ? "1" : "draft"}`);
}
