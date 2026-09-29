import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { listTeams, type TeamFilters } from "@/lib/admin";

// Export CSV des candidatures (filtres via querystring). Réservé à l'admin.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const filters: TeamFilters = {
    status: sp.get("status") ?? undefined,
    region: sp.get("region") ?? undefined,
    challengeId: sp.get("challengeId") ?? undefined,
    track: sp.get("track") ?? undefined,
    q: sp.get("q") ?? undefined,
  };

  const teams = await listTeams(filters);

  const header = [
    "Projet",
    "Chef d'équipe",
    "Email",
    "Région",
    "Défi",
    "Piste",
    "Statut",
    "Membres",
    "Déposé le",
  ];
  const cell = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [header.map(cell).join(",")];
  for (const t of teams) {
    lines.push(
      [
        t.name,
        t.leader.name ?? "",
        t.leader.email ?? "",
        t.region ?? "",
        t.challenge?.code ?? "",
        t.track,
        t.status,
        t._count.members,
        t.submittedAt ? t.submittedAt.toISOString().slice(0, 10) : "",
      ]
        .map(cell)
        .join(","),
    );
  }
  // BOM pour un affichage correct des accents dans Excel.
  const csv = "﻿" + lines.join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cinova-candidatures-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
