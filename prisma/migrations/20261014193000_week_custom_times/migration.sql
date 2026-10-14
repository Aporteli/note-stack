-- AlterTable
ALTER TABLE "WeekSlot" ADD COLUMN "startMin" INTEGER;
ALTER TABLE "WeekSlot" ADD COLUMN "endMin" INTEGER;

UPDATE "WeekSlot"
SET "startMin" = "hour" * 60,
    "endMin" = "hour" * 60 + 60;

ALTER TABLE "WeekSlot" ALTER COLUMN "startMin" SET NOT NULL;
ALTER TABLE "WeekSlot" ALTER COLUMN "endMin" SET NOT NULL;

DROP INDEX "WeekSlot_userId_day_hour_key";
ALTER TABLE "WeekSlot" DROP COLUMN "hour";

DROP INDEX "WeekSlot_userId_idx";
CREATE INDEX "WeekSlot_userId_day_idx" ON "WeekSlot"("userId", "day");
