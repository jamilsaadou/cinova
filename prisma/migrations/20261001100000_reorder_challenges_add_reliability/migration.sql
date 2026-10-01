-- Ajouter le thème transversal aux éditions actives sans remplacer les données existantes.
INSERT INTO "Challenge" ("id", "editionId", "code", "title", "isActive", "order")
SELECT 'reliability_' || "id", "id", 'RELIABILITY', 'Fiabilité de l’information', true, 9
FROM "Edition"
WHERE "isActive" = true
ON CONFLICT ("editionId", "code") DO NOTHING;

-- Conserver les identifiants, les candidatures associées et les choix d’activation.
UPDATE "Challenge" AS c
SET "order" = v.position
FROM (VALUES
  ('AGROECOLOGY', 1),
  ('ADVISORY', 2),
  ('ALERT', 3),
  ('MARKET', 4),
  ('INPUTS', 5),
  ('WARRANTAGE', 6),
  ('COOP', 7),
  ('SOIL', 8),
  ('RELIABILITY', 9)
) AS v(code, position), "Edition" AS e
WHERE c."code" = v.code AND c."editionId" = e."id" AND e."isActive" = true;
