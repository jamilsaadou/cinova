import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Enregistre une visite de page (analytics léger). Best-effort.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { path?: string };
    const path = typeof body.path === "string" ? body.path.split("?")[0].slice(0, 300) : null;
    if (!path) return NextResponse.json({ ok: false });

    const h = req.headers;
    const country =
      h.get("cf-ipcountry") || h.get("x-vercel-ip-country") || h.get("x-country") || null;
    const referrer = h.get("referer")?.slice(0, 300) || null;

    let sid = req.cookies.get("cinova_sid")?.value;
    const isNew = !sid;
    if (!sid) sid = randomUUID();

    const session = await auth();

    await prisma.pageView.create({
      data: {
        path,
        referrer,
        country: country && country !== "XX" ? country.toUpperCase() : null,
        sessionId: sid,
        userId: session?.user?.id ?? null,
      },
    });

    const res = NextResponse.json({ ok: true });
    if (isNew) {
      res.cookies.set("cinova_sid", sid, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  } catch {
    return NextResponse.json({ ok: false });
  }
}
