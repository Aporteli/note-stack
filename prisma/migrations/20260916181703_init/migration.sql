/*
  Warnings:

  - You are about to drop the column `order` on the `List` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "List_boardId_order_idx";

-- AlterTable
ALTER TABLE "List" DROP COLUMN "order",
ADD COLUMN     "x" DOUBLE PRECISION NOT NULL DEFAULT 24,
ADD COLUMN     "y" DOUBLE PRECISION NOT NULL DEFAULT 24;

-- CreateIndex
CREATE INDEX "List_boardId_idx" ON "List"("boardId");
