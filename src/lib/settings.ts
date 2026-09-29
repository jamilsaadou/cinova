import { prisma } from "@/lib/prisma";

const SMTP_KEYS = ["smtp_host", "smtp_port", "smtp_user", "smtp_from"] as const;

export async function getSmtpSettings() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: [...SMTP_KEYS, "smtp_password"] } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    host: map.smtp_host ?? "",
    port: map.smtp_port ?? "587",
    user: map.smtp_user ?? "",
    from: map.smtp_from ?? "",
    hasPassword: Boolean(map.smtp_password),
  };
}

export function getEditionForSettings() {
  return prisma.edition.findFirst({ orderBy: [{ isActive: "desc" }, { year: "desc" }] });
}

export function getAllCriteria() {
  return prisma.criterion.findMany({ orderBy: { order: "asc" } });
}

// Objectif de candidatures par région (quota). 0 = pas d'objectif défini.
export async function getQuotaTarget(): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key: "quota_region_target" } });
  return Math.max(0, Number(row?.value ?? 0) || 0);
}
