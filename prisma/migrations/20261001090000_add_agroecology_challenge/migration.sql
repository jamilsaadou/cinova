-- Ajouter le huitième défi aux éditions actives sans modifier les défis existants.
INSERT INTO "Challenge" ("id", "editionId", "code", "title", "isActive", "order")
SELECT 'agroecology_' || "id", "id", 'AGROECOLOGY', 'Agroécologie', true, 8
FROM "Edition"
WHERE "isActive" = true
ON CONFLICT ("editionId", "code") DO NOTHING;
