CREATE TABLE "WeekPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeekPlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WeekPlan_userId_idx" ON "WeekPlan"("userId");

ALTER TABLE "WeekPlan" ADD CONSTRAINT "WeekPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WeekSlot" ADD COLUMN "planId" TEXT;

INSERT INTO "WeekPlan" ("id", "userId", "name", "order")
SELECT md5("userId"), "userId", 'Schedule', 0
FROM "WeekSlot"
GROUP BY "userId";

UPDATE "WeekSlot" AS slot
SET "planId" = md5(slot."userId");

ALTER TABLE "WeekSlot" ALTER COLUMN "planId" SET NOT NULL;

ALTER TABLE "WeekSlot" ADD CONSTRAINT "WeekSlot_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WeekPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "WeekSlot_planId_idx" ON "WeekSlot"("planId");
