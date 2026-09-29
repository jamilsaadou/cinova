import { prisma } from "@/lib/prisma";

const DAY_MS = 86_400_000;

export async function getVisitStats() {
  const since = new Date(Date.now() - 30 * DAY_MS);

  const [totalViews, sessions, views30, topCountriesRaw, topPathsRaw, registrations, submissions] =
    await Promise.all([
      prisma.pageView.count(),
      prisma.pageView.groupBy({ by: ["sessionId"] }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.pageView.groupBy({
        by: ["country"],
        _count: { _all: true },
        orderBy: { _count: { country: "desc" } },
      }),
      prisma.pageView.groupBy({
        by: ["path"],
        _count: { _all: true },
        orderBy: { _count: { path: "desc" } },
        take: 8,
      }),
      prisma.user.count(),
      prisma.team.count({ where: { status: { not: "DRAFT" } } }),
    ]);

  const uniqueVisitors = sessions.length;

  // Visites par jour (14 derniers jours)
  const byDayMap = new Map<string, number>();
  for (const v of views30) {
    const key = v.createdAt.toISOString().slice(0, 10);
    byDayMap.set(key, (byDayMap.get(key) ?? 0) + 1);
  }
  const viewsByDay: { label: string; value: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    viewsByDay.push({ label: key.slice(8, 10), value: byDayMap.get(key) ?? 0 });
  }

  // Visites par heure (0-23)
  const byHour = Array.from({ length: 24 }, (_, h) => ({ label: String(h).padStart(2, "0"), value: 0 }));
  for (const v of views30) {
    byHour[v.createdAt.getHours()].value += 1;
  }

  const topCountries = topCountriesRaw
    .map((c) => ({ code: c.country ?? "??", value: c._count._all }))
    .slice(0, 8);

  const topPaths = topPathsRaw.map((p) => ({ path: p.path, value: p._count._all }));

  // Taux d'engagement (entonnoir)
  const engagement = {
    visitors: uniqueVisitors,
    registrations,
    submissions,
    regRate: uniqueVisitors ? registrations / uniqueVisitors : 0,
    subRate: registrations ? submissions / registrations : 0,
  };

  return { totalViews, uniqueVisitors, viewsByDay, byHour, topCountries, topPaths, engagement };
}

// Statistiques publiques (agrégats non nominatifs) pour l'accueil.
export async function getPublicStats() {
  const [submitted, teams, participants] = await Promise.all([
    prisma.team.count({ where: { status: { not: "DRAFT" } } }),
    prisma.team.findMany({
      where: { status: { not: "DRAFT" } },
      select: { region: true, track: true, challenge: { select: { code: true } } },
    }),
    prisma.teamMember.count(),
  ]);

  const regions = new Set(teams.map((t) => t.region).filter(Boolean));
  const byTrack: Record<string, number> = {};
  const byChallenge: Record<string, number> = {};
  for (const t of teams) {
    byTrack[t.track] = (byTrack[t.track] ?? 0) + 1;
    if (t.challenge?.code) byChallenge[t.challenge.code] = (byChallenge[t.challenge.code] ?? 0) + 1;
  }

  return {
    candidatures: submitted,
    regions: regions.size,
    participants,
    byTrack,
    byChallenge,
  };
}
