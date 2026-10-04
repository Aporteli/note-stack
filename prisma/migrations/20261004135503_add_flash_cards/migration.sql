-- CreateTable
CREATE TABLE "FlashCard" (
    "id" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlashCard_userId_createdAt_idx" ON "FlashCard"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "FlashCard" ADD CONSTRAINT "FlashCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
