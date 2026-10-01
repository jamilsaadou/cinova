"use server";

import { randomBytes } from "crypto";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { sendVerificationEmail } from "@/lib/mailer";
import { logEvent } from "@/lib/audit";
import { NigerRegion } from "@prisma/client";

const LOCALES = ["fr", "en", "ha"] as const;
function safeLocale(v: FormDataEntryValue | null): string {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v) ? v : "fr";
}

async function baseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// ───────────────────────── Inscription ─────────────────────────

export type RegisterState = {
  status: "idle" | "error" | "success";
  error?: string;
  fieldErrors?: Record<string, string>;
  devLink?: string;
  email?: string;
};

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "name_short"),
    email: z.string().trim().email("email_invalid"),
    password: z.string().min(8, "password_short"),
    confirm: z.string(),
    region: z.string().optional(),
    acceptRules: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "password_mismatch",
  })
  .refine((d) => d.acceptRules === "on", {
    path: ["acceptRules"],
    message: "rules_required",
  });

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const locale = safeLocale(formData.get("locale"));
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
    region: formData.get("region") || undefined,
    acceptRules: formData.get("acceptRules") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { status: "error", fieldErrors: { email: "email_taken" } };
  }

  const region =
    parsed.data.region && parsed.data.region in NigerRegion
      ? (parsed.data.region as NigerRegion)
      : null;

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const created = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      region,
      locale,
    },
  });
  await logEvent({
    action: "REGISTER",
    actorEmail: email,
    actorRole: "CANDIDATE",
    targetType: "USER",
    targetId: created.id,
    message: `Nouveau compte : ${parsed.data.name}`,
  });

  // Jeton de vérification (24 h)
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const url = `${await baseUrl()}/${locale}/verify?token=${token}`;
  const result = await sendVerificationEmail(email, url, parsed.data.name);

  return { status: "success", email, devLink: result.devLink };
}

// ───────────────────────── Connexion ─────────────────────────

export type LoginState = { status: "idle" | "error" | "success"; error?: string };

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { status: "error", error: "invalid_credentials" };

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.isActive || !user.passwordHash) return { status: "error", error: "invalid_credentials" };

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return { status: "error", error: "invalid_credentials" };
  if (!user.emailVerified) return { status: "error", error: "not_verified" };

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    return { status: "error", error: "invalid_credentials" };
  }

  // Le formulaire synchronise la session cliente avant de naviguer.
  return { status: "success" };
}

// ───────────────────────── Renvoi de vérification ─────────────────────────

export type ResendState = { status: "idle" | "sent"; devLink?: string };

export async function resendVerificationAction(
  _prev: ResendState,
  formData: FormData,
): Promise<ResendState> {
  const locale = safeLocale(formData.get("locale"));
  const email = String(formData.get("email") || "").toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.emailVerified) {
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    const token = randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    const url = `${await baseUrl()}/${locale}/verify?token=${token}`;
    const result = await sendVerificationEmail(email, url, user.name);
    return { status: "sent", devLink: result.devLink };
  }
  // Réponse générique (ne divulgue pas l'existence du compte)
  return { status: "sent" };
}

// ───────────────────────── Déconnexion ─────────────────────────

export async function logoutAction(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const { signOut } = await import("@/auth");
  await signOut({ redirectTo: `/${locale}` });
}
