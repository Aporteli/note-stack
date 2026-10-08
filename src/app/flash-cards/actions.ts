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

export async function getFlashTopics() {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!user) return [];

  return prisma.flashTopic.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { cards: true } },
    },
  });
}

export async function createFlashTopic(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false as const, error: "Name the topic first." };
  }

  const userId = await ownerId();
  const topic = await prisma.flashTopic.create({
    data: { name: trimmed, userId },
  });
  revalidatePath(PATH);
  return { ok: true as const, id: topic.id };
}

export async function deleteFlashTopic(id: string) {
  const userId = await ownerId();
  await prisma.flashTopic.deleteMany({ where: { id, userId } });
  revalidatePath(PATH);
}

export async function getFlashTopic(id: string) {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!user) return null;

  return prisma.flashTopic.findFirst({
    where: { id, userId: user.id },
    select: { id: true, name: true },
  });
}

export async function getFlashCards(topicId: string) {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!user) return [];

  return prisma.flashCard.findMany({
    where: { userId: user.id, topicId },
    orderBy: { createdAt: "asc" },
    select: { id: true, front: true, back: true },
  });
}

export async function getRandomFlashCard(
  topicId: string,
  excludeIds: string[] = [],
  allowRepeat = true,
) {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!user) return null;

  const unique = [...new Set(excludeIds.filter(Boolean))];
  const base = { userId: user.id, topicId };
  const where = {
    ...base,
    ...(unique.length ? { id: { notIn: unique } } : {}),
  };

  let count = await prisma.flashCard.count({ where });
  let filter = where;
  if (count === 0 && allowRepeat && unique.length > 0) {
    filter = base;
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

export async function createFlashCard(
  topicId: string,
  front: string,
  back: string,
) {
  const cleaned = sides(front, back);
  if (!cleaned.ok) return cleaned;

  const userId = await ownerId();
  const topic = await prisma.flashTopic.findFirst({
    where: { id: topicId, userId },
    select: { id: true },
  });
  if (!topic) {
    return { ok: false as const, error: "That topic is no longer here." };
  }

  await prisma.flashCard.create({
    data: {
      front: cleaned.frontText,
      back: cleaned.backText,
      topicId,
      userId,
    },
  });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${topicId}`);
  return { ok: true as const };
}

export async function updateFlashCard(id: string, front: string, back: string) {
  const cleaned = sides(front, back);
  if (!cleaned.ok) return cleaned;

  const userId = await ownerId();
  const card = await prisma.flashCard.findFirst({
    where: { id, userId },
    select: { topicId: true },
  });
  if (!card) {
    return { ok: false as const, error: "That card is no longer here." };
  }
  await prisma.flashCard.update({
    where: { id },
    data: { front: cleaned.frontText, back: cleaned.backText },
  });
  revalidatePath(`${PATH}/${card.topicId}`);
  return { ok: true as const };
}

export async function deleteFlashCard(id: string) {
  const userId = await ownerId();
  const card = await prisma.flashCard.findFirst({
    where: { id, userId },
    select: { topicId: true },
  });
  await prisma.flashCard.deleteMany({ where: { id, userId } });
  if (card) {
    revalidatePath(PATH);
    revalidatePath(`${PATH}/${card.topicId}`);
  }
}
