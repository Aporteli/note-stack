CREATE TABLE "QuizFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizFolder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QuizFolder_userId_parentId_idx" ON "QuizFolder"("userId", "parentId");

ALTER TABLE "QuizFolder" ADD CONSTRAINT "QuizFolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizFolder" ADD CONSTRAINT "QuizFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "QuizFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Quiz" ADD COLUMN "folderId" TEXT;

CREATE INDEX "Quiz_folderId_idx" ON "Quiz"("folderId");

ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "QuizFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
