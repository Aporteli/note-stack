-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "trashedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Drawing" ADD COLUMN     "trashedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "List" ADD COLUMN     "trashedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Card_listId_trashedAt_idx" ON "Card"("listId", "trashedAt");

-- CreateIndex
CREATE INDEX "Drawing_boardId_trashedAt_idx" ON "Drawing"("boardId", "trashedAt");

-- CreateIndex
CREATE INDEX "List_boardId_trashedAt_idx" ON "List"("boardId", "trashedAt");
