"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const PATH = "/flash-cards";

async function ownerId() {
  const existing = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (existing) return existing.id;

  const user = await prisma.user.create({
    data: { email: "demo@example.com", name: "Demo User" },
  });
  return user.id;
}

function sides(front: string, back: string) {
  const frontText = front.trim();
  const backText = back.trim();
  if (!frontText || !backText) {
    return {
      ok: false as const,
      error: "Write something on both the front and the back.",
    };
  }
  return { ok: true as const, frontText, backText };
}

export async function getFlashCards() {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!user) return [];

  return prisma.flashCard.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, front: true, back: true },
  });
}

export async function getRandomFlashCard(excludeId?: string) {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!user) return null;

  const where = {
    userId: user.id,
    ...(excludeId ? { id: { not: excludeId } } : {}),
  };

  let count = await prisma.flashCard.count({ where });
  let filter = where;
  if (count === 0 && excludeId) {
    filter = { userId: user.id };
    count = await prisma.flashCard.count({ where: filter });
  }
  if (count === 0) return null;

  const skip = Math.floor(Math.random() * count);
  const [card] = await prisma.flashCard.findMany({
    where: filter,
    skip,
    take: 1,
    orderBy: { id: "asc" },
    select: { id: true, front: true, back: true },
  });
  return card ?? null;
}

export async function createFlashCard(front: string, back: string) {
  const cleaned = sides(front, back);
  if (!cleaned.ok) return cleaned;

  const userId = await ownerId();
  await prisma.flashCard.create({
    data: {
      front: cleaned.frontText,
      back: cleaned.backText,
      userId,
    },
  });
  revalidatePath(PATH);
  return { ok: true as const };
}

export async function updateFlashCard(id: string, front: string, back: string) {
  const cleaned = sides(front, back);
  if (!cleaned.ok) return cleaned;

  const userId = await ownerId();
  const result = await prisma.flashCard.updateMany({
    where: { id, userId },
    data: { front: cleaned.frontText, back: cleaned.backText },
  });
  if (result.count === 0) {
    return { ok: false as const, error: "That card is no longer here." };
  }
  revalidatePath(PATH);
  return { ok: true as const };
}

export async function deleteFlashCard(id: string) {
  const userId = await ownerId();
  await prisma.flashCard.deleteMany({ where: { id, userId } });
  revalidatePath(PATH);
}
