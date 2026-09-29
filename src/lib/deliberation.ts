import { prisma } from "@/lib/prisma";

export type DeliberationTeam = {
  id: string;
  name: string;
  status: string;
  region: string | null;
  challengeCode: string | null;
  avg: number | null;
  count: number; // évaluations soumises
  expected: number; // évaluations attendues (affectées ou tous les jurés)
  quorumReached: boolean;
  vetoed: boolean;
  proposedWinner: boolean;
};

export type DeliberationGroup = {
  challengeId: string | null;
  challengeCode: string | null;
  teams: DeliberationTeam[];
};

// Classement final par défi (un seul tour) : lauréat proposé = meilleur score non-veto
// ayant reçu au moins une évaluation. Sert de base à la publication des résultats.
export async function getDeliberation() {
  const [edition, criteria, teams, juryCount] = await Promise.all([
    prisma.edition.findFirst({
      orderBy: [{ isActive: "desc" }, { year: "desc" }],
      select: { id: true, name: true, resultsPublishedAt: true },
    }),
    prisma.criterion.findMany({ where: { isActive: true }, select: { id: true, weight: true, maxScore: true } }),
    prisma.team.findMany({
      where: { status: { in: ["FINALIST", "PRESELECTED", "WINNER"] } },
      select: {
        id: true,
        name: true,
        status: true,
        region: true,
        challengeId: true,
        challenge: { select: { code: true } },
        assignments: { select: { juryId: true } },
        evaluations: {
          where: { submitted: true },
          select: { usable: true, scores: { select: { criterionId: true, value: true } } },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.count({ where: { role: "JURY" } }),
  ]);

  const critById = new Map(criteria.map((c) => [c.id, c]));

  const computed: DeliberationTeam[] = teams.map((tm) => {
    const evals = tm.evaluations;
    let avg: number | null = null;
    if (evals.length > 0) {
      let sum = 0;
      for (const ev of evals) {
        let s = 0;
        for (const sc of ev.scores) {
          const crit = critById.get(sc.criterionId);
          if (crit && crit.maxScore > 0) s += (sc.value / crit.maxScore) * crit.weight;
        }
        sum += s;
      }
      avg = Math.round(sum / evals.length);
    }
    const expected = tm.assignments.length > 0 ? tm.assignments.length : juryCount;
    return {
      id: tm.id,
      name: tm.name,
      status: tm.status,
      region: tm.region,
      challengeCode: tm.challenge?.code ?? null,
      challengeId: tm.challengeId,
      avg,
      count: evals.length,
      expected,
      quorumReached: expected > 0 && evals.length >= expected,
      vetoed: evals.some((e) => e.usable === false),
      proposedWinner: false,
    } as DeliberationTeam & { challengeId: string | null };
  });

  // Regroupement par défi.
  const groups = new Map<string, DeliberationGroup>();
  for (const tm of computed as (DeliberationTeam & { challengeId: string | null })[]) {
    const key = tm.challengeId ?? "none";
    if (!groups.has(key)) {
      groups.set(key, { challengeId: tm.challengeId, challengeCode: tm.challengeCode, teams: [] });
    }
    groups.get(key)!.teams.push(tm);
  }

  // Tri intra-défi : non-veto d'abord, puis score décroissant ; lauréat proposé = premier éligible.
  for (const g of groups.values()) {
    g.teams.sort((a, b) => {
      if (a.vetoed !== b.vetoed) return a.vetoed ? 1 : -1;
      return (b.avg ?? -1) - (a.avg ?? -1);
    });
    const candidate = g.teams.find((tm) => !tm.vetoed && tm.count > 0 && tm.avg !== null);
    if (candidate) candidate.proposedWinner = true;
  }

  return {
    edition,
    juryCount,
    published: Boolean(edition?.resultsPublishedAt),
    groups: [...groups.values()],
  };
}
