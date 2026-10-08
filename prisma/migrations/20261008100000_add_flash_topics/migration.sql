-- CreateTable
CREATE TABLE "FlashTopic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlashTopic_userId_createdAt_idx" ON "FlashTopic"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "FlashTopic" ADD CONSTRAINT "FlashTopic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill a General topic for anyone who already has cards
INSERT INTO "FlashTopic" ("id", "name", "userId", "createdAt", "updatedAt")
SELECT 'default_' || "userId", 'General', "userId", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "FlashCard"
GROUP BY "userId";

-- AlterTable
ALTER TABLE "FlashCard" ADD COLUMN "topicId" TEXT;

UPDATE "FlashCard" SET "topicId" = 'default_' || "userId";

ALTER TABLE "FlashCard" ALTER COLUMN "topicId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "FlashCard_topicId_createdAt_idx" ON "FlashCard"("topicId", "createdAt");

-- AddForeignKey
ALTER TABLE "FlashCard" ADD CONSTRAINT "FlashCard_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "FlashTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
