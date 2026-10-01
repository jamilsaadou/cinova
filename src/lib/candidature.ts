import { prisma } from "@/lib/prisma";

// Fonctions de lecture (utilisables dans les Server Components).

export function getActiveEdition() {
  return prisma.edition.findFirst({
    where: { isActive: true },
    orderBy: { year: "desc" },
    include: {
      challenges: { where: { isActive: true }, orderBy: { order: "asc" } },
    },
  });
}

export function getMyTeam(userId: string) {
  return prisma.team.findFirst({
    where: { leaderId: userId },
    include: {
      members: { orderBy: { createdAt: "asc" } },
      challenge: true,
      edition: true,
      attachments: {
        select: { id: true, filename: true, mimeType: true, size: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export function getMyProfile(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export type StepId = "profil" | "membres" | "projet";
export type StepDef = { id: StepId; key: string; done: boolean; href: string };

// Les 3 étapes de la candidature (profil -> membres -> projet).
export function computeSteps(
  user: Awaited<ReturnType<typeof getMyProfile>>,
  team: Awaited<ReturnType<typeof getMyTeam>>,
): StepDef[] {
  const profileComplete = Boolean(user?.name && user?.phone && user?.region);
  const memberCount = team?.members?.length ?? 0;
  return [
    { id: "profil", key: "stepProfile", done: profileComplete, href: "/espace/profil" },
    {
      id: "membres",
      key: "stepMembers",
      done: Boolean(team) && memberCount >= 2,
      href: "/espace/membres",
    },
    {
      id: "projet",
      key: "stepProject",
      done: Boolean(team?.name && team?.challengeId),
      href: "/espace/projet",
    },
  ];
}

// Code de défi -> clé de traduction (messages challenges.items.*)
export const CHALLENGE_CODE_TO_KEY: Record<string, string> = {
  AGROECOLOGY: "agroecology",
  ADVISORY: "advisory",
  ALERT: "alert",
  MARKET: "market",
  INPUTS: "inputs",
  WARRANTAGE: "warrantage",
  COOP: "cooperatives",
  SOIL: "soil",
  RELIABILITY: "reliability",
};
