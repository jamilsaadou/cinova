import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrateur CINOVA";

  if (!z.email().safeParse(email).success) {
    throw new Error("Définissez ADMIN_EMAIL avec une adresse email valide.");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL doit désigner la base à administrer.");
  }

  const prisma = new PrismaClient();
  try {
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
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  // Ne pas afficher les détails Prisma : ils peuvent contenir des données de connexion.
  console.error(error?.code ? `Échec de création de l'administrateur (${error.code}). Vérifiez la base de données.` : error.message);
  process.exitCode = 1;
});
