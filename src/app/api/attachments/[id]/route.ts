import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  // Vérifier les droits avant de charger le contenu binaire.
  const attachment = await prisma.attachment.findUnique({
    where: { id },
    select: { team: { select: { id: true, leaderId: true, status: true } } },
  });
  if (!attachment) return new Response("Not found", { status: 404 });
  const { team } = attachment;
  let allowed = team.leaderId === session.user.id || ["ADMIN", "AUDITOR"].includes(session.user.role);
  if (!allowed && session.user.role === "JURY" && ["PRESELECTED", "FINALIST"].includes(team.status)) {
    const [total, mine] = await Promise.all([
      prisma.assignment.count({ where: { teamId: team.id } }),
      prisma.assignment.count({ where: { teamId: team.id, juryId: session.user.id } }),
    ]);
    allowed = total === 0 || mine > 0;
  }
  if (!allowed) return new Response("Forbidden", { status: 403 });
  const att = await prisma.attachment.findUnique({ where: { id } });
  if (!att) return new Response("Not found", { status: 404 });
  const disposition = new URL(req.url).searchParams.get("download") === "1" ? "attachment" : "inline";
  const filename = encodeURIComponent(att.filename).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16)}`);
  return new Response(new Uint8Array(att.data), {
    headers: {
      "Content-Type": att.mimeType,
      "Content-Length": String(att.size),
      "Content-Disposition": `${disposition}; filename*=UTF-8''${filename}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'; frame-ancestors 'self'",
    },
  });
}
