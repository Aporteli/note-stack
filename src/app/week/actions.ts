"use server";

import { prisma } from "@/lib/prisma";
import { ownerId } from "@/lib/owner";

export type WeekPlanData = {
  id: string;
  name: string;
};

export type WeekSlotData = {
  id: string;
  day: number;
  startMin: number;
  endMin: number;
  task: string;
  color: string;
  planId: string;
};

const TASK_COLORS = new Set([
  "surface",
  "orchid",
  "coral",
  "lagoon",
  "mint",
  "plum",
  "dusk",
  "indigo",
  "amber",
  "slate",
]);

function cleanColor(color: string) {
  return TASK_COLORS.has(color) ? color : "surface";
}

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

const slotSelect = {
  id: true,
  day: true,
  startMin: true,
  endMin: true,
  task: true,
  color: true,
  planId: true,
} as const;

async function ensurePlans(userId: string): Promise<WeekPlanData[]> {
  const plans = await prisma.weekPlan.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  if (plans.length) return plans;
  const created = await prisma.weekPlan.create({
    data: { userId, name: "Schedule", order: 0 },
    select: { id: true, name: true },
  });
  return [created];
}

export async function getWeekBoard(): Promise<{ plans: WeekPlanData[]; slots: WeekSlotData[] }> {
  const userId = await ownerId();
  const plans = await ensurePlans(userId);
  const slots = await prisma.weekSlot.findMany({
    where: { userId },
    select: slotSelect,
    orderBy: [{ day: "asc" }, { startMin: "asc" }],
  });
  return { plans, slots };
}

export async function renameWeekPlan(id: string, name: string): Promise<WeekPlanData | null> {
  const text = name.trim().slice(0, 40);
  if (!id || !text) return null;
  const userId = await ownerId();
  const updated = await prisma.weekPlan.updateMany({
    where: { id, userId },
    data: { name: text },
  });
  if (!updated.count) return null;
  return { id, name: text };
}

export async function createWeekPlan(): Promise<WeekPlanData> {
  const userId = await ownerId();
  const count = await prisma.weekPlan.count({ where: { userId } });
  return prisma.weekPlan.create({
    data: { userId, name: `Schedule ${count + 1}`, order: count },
    select: { id: true, name: true },
  });
}

export async function createSlot(
  day: number,
  startMin: number,
  endMin: number,
  task: string,
  color = "surface",
  planId: string,
): Promise<WeekSlotData | null> {
  if (!validDay(day) || !validRange(startMin, endMin) || !planId) return null;
  const text = task.trim();
  if (!text) return null;
  const userId = await ownerId();
  const plan = await prisma.weekPlan.findFirst({
    where: { id: planId, userId },
    select: { id: true },
  });
  if (!plan) return null;
  return prisma.weekSlot.create({
    data: { userId, planId, day, startMin, endMin, task: text, color: cleanColor(color) },
    select: slotSelect,
  });
}

export async function updateSlot(
  id: string,
  day: number,
  startMin: number,
  endMin: number,
  task: string,
  color = "surface",
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
    data: { day, startMin, endMin, task: text, color: cleanColor(color) },
  });
}

export async function replaceDay(
  day: number,
  slots: { startMin: number; endMin: number; task: string; color?: string }[],
  planId: string,
): Promise<WeekSlotData[]> {
  if (!validDay(day) || !planId) return [];
  const userId = await ownerId();
  const plan = await prisma.weekPlan.findFirst({
    where: { id: planId, userId },
    select: { id: true },
  });
  if (!plan) return [];
  const rows = slots.filter(
    (slot) => validRange(slot.startMin, slot.endMin) && slot.task.trim(),
  );

  await prisma.$transaction([
    prisma.weekSlot.deleteMany({ where: { userId, day, planId } }),
    ...(rows.length
      ? [
          prisma.weekSlot.createMany({
            data: rows.map((slot) => ({
              userId,
              planId,
              day,
              startMin: slot.startMin,
              endMin: slot.endMin,
              task: slot.task.trim(),
              color: cleanColor(slot.color ?? "surface"),
            })),
          }),
        ]
      : []),
  ]);

  return prisma.weekSlot.findMany({
    where: { userId, day, planId },
    select: slotSelect,
    orderBy: { startMin: "asc" },
  });
}
