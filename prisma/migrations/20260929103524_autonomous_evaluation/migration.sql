-- AlterTable
ALTER TABLE "Edition" ADD COLUMN     "resultsPublishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "juryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assignment_juryId_idx" ON "Assignment"("juryId");

-- CreateIndex
CREATE INDEX "Assignment_teamId_idx" ON "Assignment"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_teamId_juryId_key" ON "Assignment"("teamId", "juryId");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_juryId_fkey" FOREIGN KEY ("juryId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
