import { prisma } from "@/lib/prisma";
import { NigerRegion } from "@prisma/client";

export type RankFilters = { challengeId?: string; region?: string; q?: string };

export type RankRow = {
  id: string;
  name: string;
  code: string | null;
  region: string | null;
  avg: number | null;
  count: number;
  vetoed: boolean;
};

// Classement des équipes finalistes par points (moyenne pondérée /100 du jury).
export async function getRanking(filters: RankFilters = {}): Promise<RankRow[]> {
  const where: Record<string, unknown> = {
    status: { in: ["FINALIST", "PRESELECTED", "WINNER"] },
  };
  if (filters.challengeId) where.challengeId = filters.challengeId;
  if (filters.region && filters.region in NigerRegion) where.region = filters.region;
  if (filters.q) where.name = { contains: filters.q, mode: "insensitive" };

  const [criteria, teams] = await Promise.all([
    prisma.criterion.findMany({ where: { isActive: true } }),
    prisma.team.findMany({
      where,
      include: {
        challenge: { select: { code: true } },
        evaluations: { where: { submitted: true }, include: { scores: true } },
      },
    }),
  ]);
  const critById = new Map(criteria.map((c) => [c.id, c]));

  const rows: RankRow[] = teams.map((t) => {
    const evals = t.evaluations;
    let avg: number | null = null;
    if (evals.length > 0) {
      let sum = 0;
      for (const ev of evals) {
        let s = 0;
        for (const sc of ev.scores) {
          const cr = critById.get(sc.criterionId);
          if (cr && cr.maxScore > 0) s += (sc.value / cr.maxScore) * cr.weight;
        }
        sum += s;
      }
      avg = Math.round(sum / evals.length);
    }
    return {
      id: t.id,
      name: t.name,
      code: t.challenge?.code ?? null,
      region: t.region,
      avg,
      count: evals.length,
      vetoed: evals.some((e) => e.usable === false),
    };
  });

  rows.sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
  return rows;
}
