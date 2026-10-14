"use server";

import { prisma } from "@/lib/prisma";
import { ownerId } from "@/lib/owner";

export type WeekSlotData = {
  day: number;
  hour: number;
  task: string;
};

function validPlace(day: number, hour: number) {
  return Number.isInteger(day) && day >= 0 && day <= 6 && Number.isInteger(hour) && hour >= 0 && hour <= 23;
}

export async function getWeekSlots(): Promise<WeekSlotData[]> {
  const userId = await ownerId();
  return prisma.weekSlot.findMany({
    where: { userId },
    select: { day: true, hour: true, task: true },
    orderBy: [{ day: "asc" }, { hour: "asc" }],
  });
}

export async function saveSlot(day: number, hour: number, task: string) {
  if (!validPlace(day, hour)) return;
  const userId = await ownerId();
  const text = task.trim();
  if (!text) {
    await prisma.weekSlot.deleteMany({ where: { userId, day, hour } });
    return;
  }
  await prisma.weekSlot.upsert({
    where: { userId_day_hour: { userId, day, hour } },
    create: { userId, day, hour, task: text },
    update: { task: text },
  });
}

export async function replaceDay(day: number, slots: { hour: number; task: string }[]) {
  if (!Number.isInteger(day) || day < 0 || day > 6) return;
  const userId = await ownerId();
  const rows = slots
    .filter((slot) => Number.isInteger(slot.hour) && slot.hour >= 0 && slot.hour <= 23)
    .map((slot) => ({ hour: slot.hour, task: slot.task.trim() }))
    .filter((slot) => slot.task);

  await prisma.$transaction([
    prisma.weekSlot.deleteMany({ where: { userId, day } }),
    ...(rows.length
      ? [
          prisma.weekSlot.createMany({
            data: rows.map((slot) => ({
              userId,
              day,
              hour: slot.hour,
              task: slot.task,
            })),
          }),
        ]
      : []),
  ]);
}
