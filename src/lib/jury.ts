import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NigerRegion } from "@prisma/client";

// Jury unique : tout membre du jury évalue avec la même grille commune.
export async function requireJury() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "JURY") redirect("/espace");
  return { id: session.user.id, name: session.user.name, email: session.user.email };
}

export function getCriteria() {
  return prisma.criterion.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

// Équipes à évaluer (finalistes / présélectionnées) + état d'évaluation du juré.
// Affectation autonome : si une équipe a ≥1 affectation, seuls les jurés affectés
// l'évaluent ; sinon (aucune affectation), elle reste visible pour tous (rétrocompatible).
export function getTeamsToEvaluate(
  juryId: string,
  filters: { challengeId?: string; region?: string; q?: string } = {},
) {
  const where: Record<string, unknown> = {
    status: { in: ["FINALIST", "PRESELECTED"] },
    OR: [
      { assignments: { none: {} } },
      { assignments: { some: { juryId } } },
    ],
  };
  if (filters.challengeId) where.challengeId = filters.challengeId;
  if (filters.region && filters.region in NigerRegion) where.region = filters.region;
  if (filters.q) where.name = { contains: filters.q, mode: "insensitive" };
  return prisma.team.findMany({
    where,
    include: {
      challenge: { select: { code: true } },
      evaluations: { where: { juryId }, select: { submitted: true } },
    },
    orderBy: { name: "asc" },
  });
}

export function getTeamForJury(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: {
      challenge: true,
      members: { orderBy: { createdAt: "asc" } },
      attachments: { select: { id: true, filename: true } },
    },
  });
}

export async function getMyEvaluation(juryId: string, teamId: string) {
  const evalRow = await prisma.evaluation.findUnique({
    where: { teamId_juryId: { teamId, juryId } },
    include: { scores: true },
  });
  if (!evalRow) return null;
  const scoreMap: Record<string, number> = {};
  for (const s of evalRow.scores) scoreMap[s.criterionId] = s.value;
  return { ...evalRow, scoreMap };
}

// Vue d'ensemble pour l'admin jury : avancement des jurés + quorum par équipe.
export async function getJuryOverview() {
  const [jurors, teams] = await Promise.all([
    prisma.user.findMany({
      where: { role: "JURY" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.team.findMany({
      where: { status: { in: ["FINALIST", "PRESELECTED"] } },
      select: {
        id: true,
        name: true,
        status: true,
        region: true,
        challenge: { select: { code: true } },
        assignments: { select: { juryId: true } },
        evaluations: { select: { juryId: true, submitted: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const juryCount = jurors.length;

  const teamRows = teams.map((tm) => {
    const assignedIds = tm.assignments.map((a) => a.juryId);
    const expected = assignedIds.length > 0 ? assignedIds.length : juryCount;
    const submittedCount = tm.evaluations.filter((e) => e.submitted).length;
    return {
      id: tm.id,
      name: tm.name,
      status: tm.status,
      region: tm.region,
      challengeCode: tm.challenge?.code ?? null,
      assignedIds,
      expected,
      submittedCount,
      quorumReached: expected > 0 && submittedCount >= expected,
    };
  });

  // Avancement par juré : nombre d'équipes affectées (ou toutes si non affecté) vs soumises.
  const jurorRows = jurors.map((j) => {
    let assigned = 0;
    let submitted = 0;
    for (const tm of teams) {
      const isAssigned =
        tm.assignments.length === 0 || tm.assignments.some((a) => a.juryId === j.id);
      if (isAssigned) {
        assigned += 1;
        if (tm.evaluations.some((e) => e.juryId === j.id && e.submitted)) submitted += 1;
      }
    }
    return { id: j.id, name: j.name, email: j.email, assigned, submitted };
  });

  return { jurors: jurorRows, teams: teamRows, juryCount, eligibleCount: teams.length };
}

// Agrégation des notes d'une équipe (pour l'admin) — une seule moyenne /100 + veto.
export async function getTeamScores(teamId: string) {
  const [criteria, evaluations] = await Promise.all([
    prisma.criterion.findMany({ where: { isActive: true } }),
    prisma.evaluation.findMany({
      where: { teamId, submitted: true },
      include: { scores: true, jury: { select: { name: true, email: true } } },
    }),
  ]);
  const critById = new Map(criteria.map((c) => [c.id, c]));

  let avg: number | null = null;
  if (evaluations.length > 0) {
    let sum = 0;
    for (const ev of evaluations) {
      let s = 0;
      for (const sc of ev.scores) {
        const crit = critById.get(sc.criterionId);
        if (crit && crit.maxScore > 0) s += (sc.value / crit.maxScore) * crit.weight;
      }
      sum += s;
    }
    avg = Math.round(sum / evaluations.length);
  }
  const vetoed = evaluations.some((e) => e.usable === false);

  return {
    avg,
    count: evaluations.length,
    vetoed,
    evaluations: evaluations.map((e) => ({
      id: e.id,
      jury: e.jury.name ?? e.jury.email,
      comment: e.comment,
      usable: e.usable,
    })),
  };
}
