ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_topicId_fkey";

DROP INDEX "Quiz_topicId_createdAt_idx";

ALTER TABLE "Quiz" DROP COLUMN "topicId";
