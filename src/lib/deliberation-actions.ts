"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logEvent } from "@/lib/audit";
import { sendStatusEmail } from "@/lib/mailer";

const LOCALES = ["fr", "en", "ha"] as const;
function safeLocale(v: FormDataEntryValue | null): string {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v) ? v : "fr";
}

// Publie les résultats (délibération finale, un seul tour) :
// - équipes cochées → WINNER, autres finalistes/présélectionnées → FINALIST ;
// - horodate la publication sur l'édition active ;
// - notifie les chefs d'équipe concernés (best-effort) ; audit PUBLISH.
export async function publishResultsAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = safeLocale(formData.get("locale"));
  const notify = formData.get("notify") === "on";
  const winnerIds = formData.getAll("winnerIds").map(String).filter(Boolean);

  // Périmètre : toutes les équipes actuellement en lice.
  const teams = await prisma.team.findMany({
    where: { status: { in: ["FINALIST", "PRESELECTED", "WINNER"] } },
    select: {
      id: true,
      status: true,
      name: true,
      leader: { select: { email: true, name: true, locale: true } },
    },
  });

  const winnerSet = new Set(winnerIds);
  let winners = 0;
  let emailed = 0;

  for (const tm of teams) {
    const newStatus = winnerSet.has(tm.id) ? "WINNER" : "FINALIST";
    if (newStatus === "WINNER") winners += 1;
    if (tm.status !== newStatus) {
      await prisma.team.update({ where: { id: tm.id }, data: { status: newStatus } });
    }
    if (notify && tm.leader?.email) {
      const res = await sendStatusEmail(tm.leader.email, tm.leader.name, newStatus, null, tm.leader.locale);
      if (res.ok) emailed += 1;
    }
  }

  // Horodatage de la publication sur l'édition active.
  const edition = await prisma.edition.findFirst({
    orderBy: [{ isActive: "desc" }, { year: "desc" }],
    select: { id: true },
  });
  if (edition) {
    await prisma.edition.update({
      where: { id: edition.id },
      data: { resultsPublishedAt: new Date() },
    });
  }

  await logEvent({
    action: "PUBLISH",
    actorEmail: admin.email,
    actorRole: "ADMIN",
    message: `Publication des résultats — ${winners} lauréat(s)`,
    meta: { winners, emailed, notify },
  });

  revalidatePath(`/${locale}/admin/deliberation`);
  revalidatePath(`/${locale}/admin`);
  redirect(`/${locale}/admin/deliberation?published=1`);
}
