import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  ApplicationStatus,
  NigerRegion,
  ParticipationTrack,
} from "@prisma/client";

// Vérifie que l'utilisateur courant est administrateur.
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/espace");
  return session.user;
}

export type TeamFilters = {
  status?: string;
  region?: string;
  challengeId?: string;
  track?: string;
  q?: string;
};

function buildWhere(f: TeamFilters) {
  const where: Record<string, unknown> = {};
  if (f.status && f.status in ApplicationStatus) where.status = f.status;
  if (f.region && f.region in NigerRegion) where.region = f.region;
  if (f.challengeId) where.challengeId = f.challengeId;
  if (f.track && f.track in ParticipationTrack) where.track = f.track;
  if (f.q) {
    where.OR = [
      { name: { contains: f.q, mode: "insensitive" } },
      { leader: { name: { contains: f.q, mode: "insensitive" } } },
      { leader: { email: { contains: f.q, mode: "insensitive" } } },
    ];
  }
  return where;
}

export function listTeams(filters: TeamFilters) {
  return prisma.team.findMany({
    where: buildWhere(filters),
    include: {
      leader: { select: { name: true, email: true } },
      challenge: { select: { code: true } },
      _count: { select: { members: true, attachments: true } },
    },
    orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
  });
}

export const TEAMS_PAGE_SIZE = 20;

// Liste paginée des candidatures (+ total pour la pagination).
export async function listTeamsPaged(filters: TeamFilters, page: number) {
  const where = buildWhere(filters);
  const current = Math.max(1, page || 1);
  const [rows, total] = await Promise.all([
    prisma.team.findMany({
      where,
      include: {
        leader: { select: { name: true, email: true } },
        challenge: { select: { code: true } },
        _count: { select: { members: true, attachments: true } },
      },
      orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
      skip: (current - 1) * TEAMS_PAGE_SIZE,
      take: TEAMS_PAGE_SIZE,
    }),
    prisma.team.count({ where }),
  ]);
  return { rows, total, page: current, pages: Math.max(1, Math.ceil(total / TEAMS_PAGE_SIZE)) };
}

export function getTeamForAdmin(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: {
      leader: {
        select: {
          name: true,
          email: true,
          phone: true,
          organization: true,
          gender: true,
          region: true,
        },
      },
      challenge: true,
      edition: true,
      members: { orderBy: { createdAt: "asc" } },
      attachments: { select: { id: true, filename: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getAdminStats() {
  const [teams, membersByGender] = await Promise.all([
    prisma.team.findMany({
      select: { status: true, region: true, track: true, needsDeveloper: true },
    }),
    prisma.teamMember.groupBy({ by: ["gender"], _count: { _all: true } }),
  ]);

  const byStatus: Record<string, number> = {};
  const byRegion: Record<string, number> = {};
  const byTrack: Record<string, number> = {};
  let needsDev = 0;
  for (const t of teams) {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
    if (t.region) byRegion[t.region] = (byRegion[t.region] ?? 0) + 1;
    byTrack[t.track] = (byTrack[t.track] ?? 0) + 1;
    if (t.needsDeveloper) needsDev += 1;
  }
  const gender: Record<string, number> = {};
  for (const g of membersByGender) {
    gender[g.gender ?? "NA"] = g._count._all;
  }

  const submitted = teams.filter((t) => t.status !== "DRAFT").length;
  return {
    total: teams.length,
    submitted,
    byStatus,
    byRegion,
    byTrack,
    gender,
    needsDev,
  };
}

// Quota régional : nombre de candidatures déposées (non-DRAFT) par région vs objectif.
export async function getRegionQuota() {
  const [rows, targetRow] = await Promise.all([
    prisma.team.groupBy({
      by: ["region"],
      where: { status: { not: "DRAFT" }, region: { not: null } },
      _count: { _all: true },
    }),
    prisma.setting.findUnique({ where: { key: "quota_region_target" } }),
  ]);
  const target = Math.max(0, Number(targetRow?.value ?? 0) || 0);
  const byRegion: Record<string, number> = {};
  for (const r of rows) if (r.region) byRegion[r.region] = r._count._all;
  return { target, byRegion };
}

// Statistiques détaillées (page dédiée) : + par défi, + chronologie des dépôts.
export async function getStatsDetail() {
  const [base, teams, totalMembers] = await Promise.all([
    getAdminStats(),
    prisma.team.findMany({
      select: { submittedAt: true, challenge: { select: { code: true } } },
    }),
    prisma.teamMember.count(),
  ]);

  const byChallenge: Record<string, number> = {};
  for (const t of teams) {
    if (t.challenge?.code) {
      byChallenge[t.challenge.code] = (byChallenge[t.challenge.code] ?? 0) + 1;
    }
  }

  // Chronologie des dépôts sur les 14 derniers jours
  const days = 14;
  const timeline: { date: string; count: number }[] = [];
  const counts = new Map<string, number>();
  for (const t of teams) {
    if (t.submittedAt) {
      const key = t.submittedAt.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    timeline.push({ date: key, count: counts.get(key) ?? 0 });
  }

  return { ...base, byChallenge, totalMembers, timeline };
}
