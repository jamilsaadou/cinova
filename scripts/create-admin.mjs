import { PrismaClient } from "@prisma/client";
import { seedAdmin } from "../prisma/seed-admin.mjs";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL doit désigner la base à administrer.");
  }
  const prisma = new PrismaClient();
  try {
    await seedAdmin(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error?.code ? `Échec de création de l'administrateur (${error.code}). Vérifiez la base de données.` : error.message);
  process.exitCode = 1;
});
