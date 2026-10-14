-- CreateTable
CREATE TABLE "WeekSlot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "hour" INTEGER NOT NULL,
    "task" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeekSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeekSlot_userId_idx" ON "WeekSlot"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WeekSlot_userId_day_hour_key" ON "WeekSlot"("userId", "day", "hour");

-- AddForeignKey
ALTER TABLE "WeekSlot" ADD CONSTRAINT "WeekSlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
