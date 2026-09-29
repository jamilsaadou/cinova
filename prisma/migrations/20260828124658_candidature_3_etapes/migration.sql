-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "acceptedRules" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "beneficiaries" TEXT,
ADD COLUMN     "needsDeveloper" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "problem" TEXT,
ADD COLUMN     "solution" TEXT;

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attachment_teamId_idx" ON "Attachment"("teamId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
