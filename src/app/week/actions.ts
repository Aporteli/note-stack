"use server";

import { prisma } from "@/lib/prisma";
import { ownerId } from "@/lib/owner";

export type WeekSlotData = {
  id: string;
  day: number;
  startMin: number;
  endMin: number;
  task: string;
};

function validDay(day: number) {
  return Number.isInteger(day) && day >= 0 && day <= 6;
}

function validRange(startMin: number, endMin: number) {
  return (
    Number.isInteger(startMin) &&
    Number.isInteger(endMin) &&
    startMin >= 0 &&
    endMin <= 24 * 60 &&
    endMin > startMin
  );
}

export async function getWeekSlots(): Promise<WeekSlotData[]> {
  const userId = await ownerId();
  return prisma.weekSlot.findMany({
    where: { userId },
    select: { id: true, day: true, startMin: true, endMin: true, task: true },
    orderBy: [{ day: "asc" }, { startMin: "asc" }],
  });
}

export async function createSlot(
  day: number,
  startMin: number,
  endMin: number,
  task: string,
): Promise<WeekSlotData | null> {
  if (!validDay(day) || !validRange(startMin, endMin)) return null;
  const text = task.trim();
  if (!text) return null;
  const userId = await ownerId();
  return prisma.weekSlot.create({
    data: { userId, day, startMin, endMin, task: text },
    select: { id: true, day: true, startMin: true, endMin: true, task: true },
  });
}

export async function updateSlot(
  id: string,
  day: number,
  startMin: number,
  endMin: number,
  task: string,
) {
  if (!id || !validDay(day) || !validRange(startMin, endMin)) return;
  const userId = await ownerId();
  const text = task.trim();
  if (!text) {
    await prisma.weekSlot.deleteMany({ where: { id, userId } });
    return;
  }
  await prisma.weekSlot.updateMany({
    where: { id, userId },
    data: { day, startMin, endMin, task: text },
  });
}

export async function replaceDay(
  day: number,
  slots: { startMin: number; endMin: number; task: string }[],
): Promise<WeekSlotData[]> {
  if (!validDay(day)) return [];
  const userId = await ownerId();
  const rows = slots.filter(
    (slot) => validRange(slot.startMin, slot.endMin) && slot.task.trim(),
  );

  await prisma.$transaction([
    prisma.weekSlot.deleteMany({ where: { userId, day } }),
    ...(rows.length
      ? [
          prisma.weekSlot.createMany({
            data: rows.map((slot) => ({
              userId,
              day,
              startMin: slot.startMin,
              endMin: slot.endMin,
              task: slot.task.trim(),
            })),
          }),
        ]
      : []),
  ]);

  return prisma.weekSlot.findMany({
    where: { userId, day },
    select: { id: true, day: true, startMin: true, endMin: true, task: true },
    orderBy: { startMin: "asc" },
  });
}
