import bcrypt from "bcryptjs";
import { z } from "zod";

export async function seedAdmin(prisma, env = process.env) {
  const email = env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD;
  const name = env.ADMIN_NAME?.trim() || "Administrateur CINOVA";

  if (!z.email().safeParse(email).success) {
    throw new Error("Définissez ADMIN_EMAIL avec une adresse email valide.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (!existing.passwordHash) {
      throw new Error("Ce compte existe sans mot de passe. Configurez son accès avant de le promouvoir.");
    }
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN", emailVerified: existing.emailVerified ?? new Date() },
    });
    console.log(`Compte administrateur activé : ${email}. Mot de passe existant conservé.`);
  } else {
    if (!password || password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
      throw new Error("Pour créer un compte, ADMIN_PASSWORD doit contenir au moins 12 caractères et au plus 72 octets.");
    }
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: await bcrypt.hash(password, 12),
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });
    console.log(`Compte administrateur créé : ${email}.`);
  }
  console.log("Connectez-vous sur /login, puis ouvrez /admin. Reconnectez-vous si une session est déjà ouverte.");
}
