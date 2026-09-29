import { prisma } from "@/lib/prisma";

export const AUDIT_ACTIONS = [
  "REGISTER",
  "LOGIN",
  "SUBMIT",
  "STATUS_CHANGE",
  "JURY_SCORE",
  "ASSIGN",
  "PUBLISH",
  "DELETE",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

type LogEntry = {
  action: AuditAction;
  actorEmail?: string | null;
  actorRole?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  message?: string | null;
  meta?: Record<string, unknown> | null;
};

// Écrit un événement d'audit. Ne casse jamais l'action appelante (best-effort).
export async function logEvent(entry: LogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        actorEmail: entry.actorEmail ?? null,
        actorRole: entry.actorRole ?? null,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        message: entry.message ?? null,
        meta: entry.meta ? JSON.stringify(entry.meta) : null,
      },
    });
  } catch (e) {
    console.error("[audit] échec d'écriture du log:", e);
  }
}

function auditWhere(action?: string) {
  return action && (AUDIT_ACTIONS as readonly string[]).includes(action)
    ? { action }
    : {};
}

export function getAuditLogs(opts: { action?: string; take?: number } = {}) {
  return prisma.auditLog.findMany({
    where: auditWhere(opts.action),
    orderBy: { createdAt: "desc" },
    take: opts.take ?? 100,
  });
}

export const LOGS_PAGE_SIZE = 50;

// Journal d'audit paginé (+ total pour la pagination).
export async function getAuditLogsPaged(opts: { action?: string; page?: number } = {}) {
  const where = auditWhere(opts.action);
  const current = Math.max(1, opts.page || 1);
  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (current - 1) * LOGS_PAGE_SIZE,
      take: LOGS_PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { rows, total, page: current, pages: Math.max(1, Math.ceil(total / LOGS_PAGE_SIZE)) };
}
