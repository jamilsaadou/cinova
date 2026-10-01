"use server";

import { validAttachment } from "@/lib/attachment-types";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  Gender,
  NigerRegion,
  ParticipationTrack,
  TeamMemberRole,
  ApplicationStatus,
} from "@prisma/client";
import { BENEFICIARY_KEYS, HEARD_ABOUT_KEYS } from "@/lib/candidature-options";
import { logEvent } from "@/lib/audit";
import { sendSubmissionReceiptEmail } from "@/lib/mailer";

const LOCALES = ["fr", "en", "ha"] as const;
function safeLocale(v: FormDataEntryValue | null): string {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v) ? v : "fr";
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

function optionalEnum<T extends Record<string, string>>(
  e: T,
  v: FormDataEntryValue | null,
): T[keyof T] | null {
  return typeof v === "string" && v in e ? (v as T[keyof T]) : null;
}

// Crée l'équipe (candidature) si elle n'existe pas encore, avec le chef comme membre.
async function ensureTeam(userId: string) {
  const existing = await prisma.team.findFirst({ where: { leaderId: userId } });
  if (existing) return existing;

  const [edition, user] = await Promise.all([
    prisma.edition.findFirst({ where: { isActive: true } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);
  const team = await prisma.team.create({
    data: {
      name: "",
      leaderId: userId,
      editionId: edition?.id ?? null,
      region: user?.region ?? null,
      status: ApplicationStatus.DRAFT,
    },
  });
  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      fullName: user?.name ?? "Chef d'équipe",
      email: user?.email ?? null,
      gender: user?.gender ?? null,
      region: user?.region ?? null,
      role: TeamMemberRole.LEAD,
      isLeader: true,
    },
  });
  return team;
}

async function myTeamId(userId: string): Promise<string | null> {
  const t = await prisma.team.findFirst({ where: { leaderId: userId }, select: { id: true } });
  return t?.id ?? null;
}

export type FormState = {
  status: "idle" | "success" | "error";
  error?: string;
  fieldErrors?: Record<string, string>;
};

// ───────────────────────── Étape 1 · Profil ─────────────────────────

const profileSchema = z.object({
  name: z.string().trim().min(2, "name_short"),
  phone: z.string().trim().max(40).optional(),
  organization: z.string().trim().max(160).optional(),
});

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const userId = await requireUserId();
  const locale = safeLocale(formData.get("locale"));

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    organization: formData.get("organization") || undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] = i.message;
    return { status: "error", fieldErrors };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      organization: parsed.data.organization ?? null,
      gender: optionalEnum(Gender, formData.get("gender")),
      region: optionalEnum(NigerRegion, formData.get("region")),
    },
  });

  revalidatePath(`/${locale}/espace`, "layout");
  return { status: "success" };
}

// ───────────────────────── Étape 2 · Membres ─────────────────────────

// Démarre la candidature (crée l'équipe brouillon).
export async function startCandidatureAction(formData: FormData) {
  const userId = await requireUserId();
  const locale = safeLocale(formData.get("locale"));
  await ensureTeam(userId);
  revalidatePath(`/${locale}/espace`, "layout");
  redirect(`/${locale}/espace/membres`);
}

// Besoin d'un développeur : oui / non.
export async function setNeedsDeveloperAction(formData: FormData) {
  const userId = await requireUserId();
  const locale = safeLocale(formData.get("locale"));
  const value = formData.get("value") === "yes";
  const team = await ensureTeam(userId);
  await prisma.team.update({ where: { id: team.id }, data: { needsDeveloper: value } });
  revalidatePath(`/${locale}/espace/membres`);
}

const memberSchema = z.object({
  fullName: z.string().trim().min(2, "member_name_short"),
  email: z.string().trim().email("email_invalid").optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
});

export async function addMemberAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const userId = await requireUserId();
  const locale = safeLocale(formData.get("locale"));
  const team = await ensureTeam(userId);

  const parsed = memberSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] = i.message;
    return { status: "error", fieldErrors };
  }

  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      fullName: parsed.data.fullName,
      email: parsed.data.email || null,
      phone: parsed.data.phone ?? null,
      gender: optionalEnum(Gender, formData.get("gender")),
      region: optionalEnum(NigerRegion, formData.get("region")),
      role: optionalEnum(TeamMemberRole, formData.get("role")) ?? TeamMemberRole.OTHER,
    },
  });

  revalidatePath(`/${locale}/espace/membres`);
  return { status: "success" };
}

export async function deleteMemberAction(formData: FormData) {
  const userId = await requireUserId();
  const locale = safeLocale(formData.get("locale"));
  const memberId = String(formData.get("memberId") || "");
  const member = await prisma.teamMember.findUnique({
    where: { id: memberId },
    include: { team: true },
  });
  if (member && member.team.leaderId === userId && !member.isLeader) {
    await prisma.teamMember.delete({ where: { id: memberId } });
  }
  revalidatePath(`/${locale}/espace/membres`);
}

// ───────────────────────── Étape 3 · Projet ─────────────────────────

const projectSchema = z.object({
  name: z.string().trim().min(2, "project_name_short"),
  problem: z.string().trim().max(4000).optional(),
  solution: z.string().trim().max(4000).optional(),
  description: z.string().trim().max(6000).optional(),
  motivation: z.string().trim().max(3000).optional(),
  otherInfo: z.string().trim().max(3000).optional(),
});

export async function saveProjectAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const userId = await requireUserId();
  const locale = safeLocale(formData.get("locale"));
  const team = await ensureTeam(userId);
  if (team.status !== "DRAFT") return { status: "error", error: "locked" };

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    problem: formData.get("problem") || undefined,
    solution: formData.get("solution") || undefined,
    description: formData.get("description") || undefined,
    motivation: formData.get("motivation") || undefined,
    otherInfo: formData.get("otherInfo") || undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] = i.message;
    return { status: "error", fieldErrors };
  }

  // Bénéficiaires : cases à cocher -> liste de clés valides (CSV)
  const beneficiaries = formData
    .getAll("beneficiaries")
    .filter((v): v is string => typeof v === "string")
    .filter((v) => (BENEFICIARY_KEYS as readonly string[]).includes(v));

  const heardAboutRaw = formData.get("heardAbout");
  const heardAbout =
    typeof heardAboutRaw === "string" && (HEARD_ABOUT_KEYS as readonly string[]).includes(heardAboutRaw)
      ? heardAboutRaw
      : null;

  await prisma.team.update({
    where: { id: team.id },
    data: {
      name: parsed.data.name,
      problem: parsed.data.problem ?? null,
      solution: parsed.data.solution ?? null,
      description: parsed.data.description ?? null,
      beneficiaries: beneficiaries.length ? beneficiaries.join(",") : null,
      heardAbout,
      motivation: parsed.data.motivation ?? null,
      otherInfo: parsed.data.otherInfo ?? null,
      track:
        optionalEnum(ParticipationTrack, formData.get("track")) ?? ParticipationTrack.CREATION,
      challengeId:
        typeof formData.get("challengeId") === "string" && formData.get("challengeId")
          ? String(formData.get("challengeId"))
          : null,
    },
  });

  revalidatePath(`/${locale}/espace`, "layout");
  return { status: "success" };
}

// ───────────────────────── Pièces jointes (images) ─────────────────────────

const MAX_ATTACH = 6;
const MAX_SIZE = 4 * 1024 * 1024; // 4 Mo
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];

export async function uploadAttachmentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const userId = await requireUserId();
  const locale = safeLocale(formData.get("locale"));
  const team = await ensureTeam(userId);
  if (team.status !== "DRAFT") return { status: "error", error: "locked" };

  const files = formData
    .getAll("file")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { status: "error", error: "no_file" };

  const count = await prisma.attachment.count({ where: { teamId: team.id } });
  let remaining = MAX_ATTACH - count;
  if (remaining <= 0) return { status: "error", error: "too_many" };

  let lastError: string | undefined;
  let stored = 0;
  for (const file of files) {
    if (remaining <= 0) {
      lastError = "too_many";
      break;
    }
    if (!ALLOWED.includes(file.type)) {
      lastError = "bad_type";
      continue;
    }
    if (file.size > MAX_SIZE) {
      lastError = "too_big";
      continue;
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!validAttachment(bytes, file.type)) {
      lastError = "bad_type";
      continue;
    }
    await prisma.attachment.create({
      data: {
        teamId: team.id,
        filename: file.name.slice(0, 200),
        mimeType: file.type,
        size: file.size,
        data: bytes,
      },
    });
    stored += 1;
    remaining -= 1;
  }

  revalidatePath(`/${locale}/espace/projet`);
  if (stored === 0 && lastError) return { status: "error", error: lastError };
  return { status: "success" };
}

export async function deleteAttachmentAction(formData: FormData) {
  const userId = await requireUserId();
  const locale = safeLocale(formData.get("locale"));
  const id = String(formData.get("attachmentId") || "");
  const att = await prisma.attachment.findUnique({
    where: { id },
    include: { team: { select: { leaderId: true, status: true } } },
  });
  if (att && att.team.leaderId === userId && att.team.status === "DRAFT") {
    await prisma.attachment.delete({ where: { id } });
  }
  revalidatePath(`/${locale}/espace/projet`);
}

// ───────────────────────── Dépôt ─────────────────────────

export async function submitCandidatureAction(formData: FormData) {
  const userId = await requireUserId();
  const locale = safeLocale(formData.get("locale"));
  const acceptRules = formData.get("acceptRules") === "on";
  const confirm = formData.get("confirm") === "on";
  if (!acceptRules || !confirm) {
    redirect(`/${locale}/espace/projet?error=confirm`);
  }

  const team = await prisma.team.findFirst({
    where: { leaderId: userId },
    include: { members: true, leader: { select: { email: true, name: true, locale: true } } },
  });
  if (
    team &&
    team.status === ApplicationStatus.DRAFT &&
    team.name.trim().length >= 2 &&
    team.challengeId &&
    team.members.length >= 2
  ) {
    await prisma.team.update({
      where: { id: team.id },
      data: {
        status: ApplicationStatus.SUBMITTED,
        submittedAt: new Date(),
        acceptedRules: true,
      },
    });
    await logEvent({
      action: "SUBMIT",
      actorEmail: team.leader.email,
      actorRole: "CANDIDATE",
      targetType: "TEAM",
      targetId: team.id,
      message: `Candidature déposée : ${team.name}`,
    });
    if (team.leader.email) {
      await sendSubmissionReceiptEmail(
        team.leader.email,
        team.leader.name,
        team.name,
        team.leader.locale,
      );
    }
    revalidatePath(`/${locale}/espace`, "layout");
    redirect(`/${locale}/espace?submitted=1`);
  }
  redirect(`/${locale}/espace/projet?error=incomplete`);
}
