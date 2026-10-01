"use server";

import { revalidatePath } from "next/cache";
import { Prisma, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logEvent } from "@/lib/audit";

export type UserManagementState = { status: "idle" | "success" | "error"; error?: string };
const schema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
});

export async function saveUserAction(_previous: UserManagementState, form: FormData): Promise<UserManagementState> {
  const actor = await requireAdmin();
  const locale = ["fr", "en", "ha"].includes(String(form.get("locale"))) ? String(form.get("locale")) : "fr";
  const parsed = schema.safeParse({
    id: form.get("id") || undefined, name: form.get("name"), email: form.get("email"),
    role: form.get("role"), isActive: form.get("isActive") === "on",
  });
  if (!parsed.success) return { status: "error", error: "invalid" };
  const input = parsed.data;
  const password = String(form.get("password") ?? "");
  if (!input.id && (password.length < 12 || Buffer.byteLength(password, "utf8") > 72)) {
    return { status: "error", error: "password" };
  }
  // Un administrateur ne peut pas retirer son propre accès.
  if (input.id === actor.id && (input.role !== "ADMIN" || !input.isActive)) {
    return { status: "error", error: "self" };
  }
  const passwordHash = input.id ? undefined : await bcrypt.hash(password, 12);
  try {
    const saved = await prisma.$transaction(async (tx) => {
      if (input.id) {
        const current = await tx.user.findUnique({ where: { id: input.id } });
        if (!current) throw new Error("missing");
        if (current.role === "ADMIN" && current.isActive && (input.role !== "ADMIN" || !input.isActive)) {
          const count = await tx.user.count({ where: { role: "ADMIN", isActive: true } });
          if (count <= 1) throw new Error("lastAdmin");
        }
        // L'adresse et le mot de passe d'un compte existant restent inchangés.
        return tx.user.update({ where: { id: input.id }, data: {
          name: input.name, role: input.role, isActive: input.isActive,
        }, select: { id: true } });
      }
      return tx.user.create({ data: {
        name: input.name, email: input.email, role: input.role, isActive: input.isActive,
        passwordHash, emailVerified: new Date(), locale,
      }, select: { id: true } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await logEvent({ action: "USER_MANAGEMENT", actorEmail: actor.email, actorRole: actor.role,
      targetType: "USER", targetId: saved.id,
      message: input.id ? "Modification du profil utilisateur" : "Création d’un utilisateur",
      meta: { role: input.role, isActive: input.isActive },
    });
  } catch (error) {
    const known = error instanceof Error && ["missing", "lastAdmin"].includes(error.message) ? error.message : null;
    const code = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : null;
    return { status: "error", error: known ?? (code === "P2002" ? "duplicate" : "failed") };
  }
  revalidatePath(`/${locale}/admin/utilisateurs`);
  revalidatePath(`/${locale}/admin/jury`);
  return { status: "success" };
}
