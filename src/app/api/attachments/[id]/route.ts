import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Sert une pièce jointe (image) — réservé au chef d'équipe propriétaire.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const att = await prisma.attachment.findUnique({
    where: { id },
    include: { team: { select: { leaderId: true } } },
  });
  if (!att) return new Response("Not found", { status: 404 });
  const isOwner = att.team.leaderId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return new Response("Forbidden", { status: 403 });
  }

  return new Response(new Uint8Array(att.data), {
    headers: {
      "Content-Type": att.mimeType,
      "Content-Length": String(att.size),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
