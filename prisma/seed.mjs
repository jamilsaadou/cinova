// Amorce la base : administrateur optionnel, édition active et défis.
// Lancer : npm run db:seed   (Node charge .env via --env-file)
import { PrismaClient } from "@prisma/client";
import { seedAdmin } from "./seed-admin.mjs";

const prisma = new PrismaClient();

const CHALLENGES = [
  { code: "ALERT", title: "Alerte précoce", order: 1 },
  { code: "MARKET", title: "Information de marché", order: 2 },
  { code: "INPUTS", title: "Traçabilité des intrants", order: 3 },
  { code: "WARRANTAGE", title: "Warrantage", order: 4 },
  { code: "COOP", title: "Gestion des coopératives", order: 5 },
  { code: "ADVISORY", title: "Valorisation du conseil agricole", order: 6 },
  { code: "SOIL", title: "Fertilité des sols", order: 7 },
];

async function main() {
  if (process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD) {
    await seedAdmin(prisma);
  } else {
    console.log("Administrateur ignoré : définissez ADMIN_EMAIL et ADMIN_PASSWORD pour le créer.");
  }

  // Édition active (une seule à la fois)
  let edition = await prisma.edition.findFirst({ where: { year: 2026 } });
  if (!edition) {
    edition = await prisma.edition.create({
      data: {
        name: "CINOVA 2026",
        year: 2026,
        isActive: true,
        applicationsOpenAt: new Date(),
        applicationsCloseAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });
    console.log("Édition créée :", edition.name);
  } else {
    console.log("Édition déjà présente :", edition.name);
  }

  for (const c of CHALLENGES) {
    await prisma.challenge.upsert({
      where: { editionId_code: { editionId: edition.id, code: c.code } },
      update: { title: c.title, order: c.order, isActive: true },
      create: { editionId: edition.id, code: c.code, title: c.title, order: c.order },
    });
  }
  console.log(`${CHALLENGES.length} défis en place.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
