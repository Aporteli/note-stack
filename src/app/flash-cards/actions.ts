"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ownerId } from "@/lib/owner";

const SIGNED_OUT = "Sign in to continue.";
const PATH = "/flash-cards";
const QUIZZES_PATH = "/quizzes";

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
  const user = { id: await ownerId() };
  if (!user.id) return [];

  return prisma.flashTopic.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      folderId: true,
      _count: { select: { cards: true } },
    },
  });
}

export async function createFlashTopic(name: string, folderId?: string | null) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false as const, error: "Name the topic first." };
  }

  const userId = await ownerId();
  if (!userId) return { ok: false as const, error: SIGNED_OUT };
  if (folderId) {
    const folder = await prisma.flashFolder.findFirst({
      where: { id: folderId, userId },
      select: { id: true },
    });
    if (!folder) return { ok: false as const, error: "That group is no longer here." };
  }
  const topic = await prisma.flashTopic.create({
    data: { name: trimmed, userId, folderId: folderId || null },
  });
  revalidatePath(PATH);
  return { ok: true as const, id: topic.id };
}

export type FlashFolderData = {
  id: string;
  name: string;
  parentId: string | null;
};

export async function getFlashFolders(): Promise<FlashFolderData[]> {
  const userId = await ownerId();
  if (!userId) return [];
  return prisma.flashFolder.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, parentId: true },
  });
}

export async function createFlashFolder(name: string, parentId: string | null) {
  const trimmed = name.trim().slice(0, 80);
  if (!trimmed) return { ok: false as const, error: "Name the group first." };
  const userId = await ownerId();
  if (!userId) return { ok: false as const, error: SIGNED_OUT };
  if (parentId) {
    const parent = await prisma.flashFolder.findFirst({
      where: { id: parentId, userId },
      select: { id: true },
    });
    if (!parent) return { ok: false as const, error: "That group is no longer here." };
  }
  const folder = await prisma.flashFolder.create({
    data: { name: trimmed, userId, parentId },
    select: { id: true },
  });
  revalidatePath(PATH);
  return { ok: true as const, id: folder.id };
}

export async function renameFlashFolder(id: string, name: string) {
  const trimmed = name.trim().slice(0, 80);
  if (!id || !trimmed) return;
  const userId = await ownerId();
  if (!userId) return;
  await prisma.flashFolder.updateMany({
    where: { id, userId },
    data: { name: trimmed },
  });
  revalidatePath(PATH);
}

export async function deleteFlashFolder(id: string) {
  const userId = await ownerId();
  if (!userId) return;
  const folder = await prisma.flashFolder.findFirst({
    where: { id, userId },
    select: { parentId: true },
  });
  if (!folder) return;
  await prisma.$transaction([
    prisma.flashTopic.updateMany({
      where: { userId, folderId: id },
      data: { folderId: folder.parentId },
    }),
    prisma.flashFolder.updateMany({
      where: { userId, parentId: id },
      data: { parentId: folder.parentId },
    }),
    prisma.flashFolder.deleteMany({ where: { id, userId } }),
  ]);
  revalidatePath(PATH);
}

export async function renameFlashTopic(id: string, name: string) {
  const trimmed = name.trim().slice(0, 120);
  if (!id || !trimmed) return;
  const userId = await ownerId();
  if (!userId) return;
  await prisma.flashTopic.updateMany({
    where: { id, userId },
    data: { name: trimmed },
  });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function moveFlashTopic(id: string, folderId: string | null) {
  const userId = await ownerId();
  if (!userId) return;
  if (folderId) {
    const folder = await prisma.flashFolder.findFirst({
      where: { id: folderId, userId },
      select: { id: true },
    });
    if (!folder) return;
  }
  await prisma.flashTopic.updateMany({
    where: { id, userId },
    data: { folderId },
  });
  revalidatePath(PATH);
}

export async function deleteFlashTopic(id: string) {
  const userId = await ownerId();
  if (!userId) return;
  await prisma.flashTopic.deleteMany({ where: { id, userId } });
  revalidatePath(PATH);
}

export async function getFlashTopic(id: string) {
  const user = { id: await ownerId() };
  if (!user.id) return null;

  return prisma.flashTopic.findFirst({
    where: { id, userId: user.id },
    select: { id: true, name: true },
  });
}

export async function getFlashCards(topicId: string) {
  const user = { id: await ownerId() };
  if (!user.id) return [];

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
  const user = { id: await ownerId() };
  if (!user.id) return null;

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
  if (!userId) return { ok: false as const, error: SIGNED_OUT };
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
  if (!userId) return { ok: false as const, error: SIGNED_OUT };
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

export type QuizOptionData = {
  id: string;
  text: string;
  correct: boolean;
};

export type QuizQuestionData = {
  id: string;
  prompt: string;
  options: QuizOptionData[];
};

export type QuizData = {
  id: string;
  title: string;
  questions: QuizQuestionData[];
};

const quizSelect = {
  id: true,
  title: true,
  questions: {
    orderBy: { order: "asc" as const },
    select: {
      id: true,
      prompt: true,
      options: {
        orderBy: { order: "asc" as const },
        select: { id: true, text: true, correct: true },
      },
    },
  },
};

export type QuizFolderData = {
  id: string;
  name: string;
  parentId: string | null;
};

export type QuizListItem = QuizData & {
  folderId: string | null;
  createdAt: string;
};

export async function getAllQuizzes(): Promise<QuizListItem[]> {
  const user = { id: await ownerId() };
  if (!user.id) return [];

  const quizzes = await prisma.quiz.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      ...quizSelect,
      folderId: true,
      createdAt: true,
    },
  });

  return quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    folderId: quiz.folderId,
    createdAt: quiz.createdAt.toISOString(),
    questions: quiz.questions,
  }));
}

export async function getQuizFolders(): Promise<QuizFolderData[]> {
  const userId = await ownerId();
  if (!userId) return [];
  return prisma.quizFolder.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, parentId: true },
  });
}

export async function createQuizFolder(name: string, parentId: string | null) {
  const trimmed = name.trim().slice(0, 80);
  if (!trimmed) return { ok: false as const, error: "Name the group first." };
  const userId = await ownerId();
  if (!userId) return { ok: false as const, error: SIGNED_OUT };
  if (parentId) {
    const parent = await prisma.quizFolder.findFirst({
      where: { id: parentId, userId },
      select: { id: true },
    });
    if (!parent) return { ok: false as const, error: "That group is no longer here." };
  }
  const folder = await prisma.quizFolder.create({
    data: { name: trimmed, userId, parentId },
    select: { id: true },
  });
  revalidatePath(QUIZZES_PATH);
  return { ok: true as const, id: folder.id };
}

export async function renameQuiz(id: string, title: string) {
  const trimmed = title.trim().slice(0, 120);
  if (!id || !trimmed) return;
  const userId = await ownerId();
  if (!userId) return;
  await prisma.quiz.updateMany({
    where: { id, userId },
    data: { title: trimmed },
  });
  revalidatePath(QUIZZES_PATH);
}

export async function renameQuizFolder(id: string, name: string) {
  const trimmed = name.trim().slice(0, 80);
  if (!id || !trimmed) return;
  const userId = await ownerId();
  if (!userId) return;
  await prisma.quizFolder.updateMany({
    where: { id, userId },
    data: { name: trimmed },
  });
  revalidatePath(QUIZZES_PATH);
}

export async function deleteQuizFolder(id: string) {
  const userId = await ownerId();
  if (!userId) return;
  const folder = await prisma.quizFolder.findFirst({
    where: { id, userId },
    select: { parentId: true },
  });
  if (!folder) return;
  await prisma.$transaction([
    prisma.quiz.updateMany({
      where: { userId, folderId: id },
      data: { folderId: folder.parentId },
    }),
    prisma.quizFolder.updateMany({
      where: { userId, parentId: id },
      data: { parentId: folder.parentId },
    }),
    prisma.quizFolder.deleteMany({ where: { id, userId } }),
  ]);
  revalidatePath(QUIZZES_PATH);
}

export async function moveQuizToFolder(id: string, folderId: string | null) {
  const userId = await ownerId();
  if (!userId) return;
  if (folderId) {
    const folder = await prisma.quizFolder.findFirst({
      where: { id: folderId, userId },
      select: { id: true },
    });
    if (!folder) return;
  }
  await prisma.quiz.updateMany({
    where: { id, userId },
    data: { folderId },
  });
  revalidatePath(QUIZZES_PATH);
}

export async function createQuiz(title: string, folderId: string | null = null) {
  const trimmed = title.trim();
  if (!trimmed) {
    return { ok: false as const, error: "Name the quiz first." };
  }

  const userId = await ownerId();
  if (!userId) return { ok: false as const, error: SIGNED_OUT };

  if (folderId) {
    const folder = await prisma.quizFolder.findFirst({
      where: { id: folderId, userId },
      select: { id: true },
    });
    if (!folder) {
      return { ok: false as const, error: "That group is no longer here." };
    }
  }

  const quiz = await prisma.quiz.create({
    data: { title: trimmed, userId, folderId },
  });
  revalidatePath(QUIZZES_PATH);
  return { ok: true as const, id: quiz.id };
}

export async function deleteQuiz(id: string) {
  const userId = await ownerId();
  if (!userId) return;
  await prisma.quiz.deleteMany({ where: { id, userId } });
  revalidatePath(QUIZZES_PATH);
}

export async function deleteQuizzes(ids: string[]) {
  const unique = [...new Set(ids.filter((id) => id.trim().length > 0))];
  if (unique.length === 0) return;

  const userId = await ownerId();
  if (!userId) return;
  await prisma.quiz.deleteMany({
    where: { id: { in: unique }, userId },
  });
  revalidatePath(QUIZZES_PATH);
}

function cleanOptions(options: { text: string; correct: boolean }[]) {
  const cleaned = options
    .map((option) => ({
      text: option.text.trim(),
      correct: option.correct === true,
    }))
    .filter((option) => option.text.length > 0);

  if (cleaned.length < 2) {
    return { ok: false as const, error: "Add at least two answers." };
  }
  if (cleaned.length > 6) {
    return { ok: false as const, error: "A question can have at most six answers." };
  }
  if (cleaned.filter((option) => option.correct).length !== 1) {
    return { ok: false as const, error: "Mark one correct answer." };
  }
  const seen = new Set<string>();
  for (const option of cleaned) {
    const key = option.text.toLowerCase();
    if (seen.has(key)) {
      return { ok: false as const, error: "Each answer has to be different." };
    }
    seen.add(key);
  }
  return { ok: true as const, options: cleaned };
}

export async function addQuizQuestion(
  quizId: string,
  prompt: string,
  options: { text: string; correct: boolean }[],
) {
  const promptText = prompt.trim();
  if (!promptText) {
    return { ok: false as const, error: "Write the question." };
  }
  const cleaned = cleanOptions(options);
  if (!cleaned.ok) return cleaned;

  const userId = await ownerId();
  if (!userId) return { ok: false as const, error: SIGNED_OUT };
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId },
    select: { _count: { select: { questions: true } } },
  });
  if (!quiz) {
    return { ok: false as const, error: "That quiz is no longer here." };
  }

  await prisma.quizQuestion.create({
    data: {
      prompt: promptText,
      quizId,
      order: quiz._count.questions,
      options: {
        create: cleaned.options.map((option, index) => ({
          text: option.text,
          correct: option.correct,
          order: index,
        })),
      },
    },
  });
  revalidatePath(QUIZZES_PATH);
  return { ok: true as const };
}

export async function addQuizQuestions(
  quizId: string,
  questions: { prompt: string; options: { text: string; correct: boolean }[] }[],
) {
  const userId = await ownerId();
  if (!userId) return { ok: false as const, error: SIGNED_OUT };
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId },
    select: { _count: { select: { questions: true } } },
  });
  if (!quiz) {
    return { ok: false as const, error: "That quiz is no longer here." };
  }

  const valid: { prompt: string; options: { text: string; correct: boolean }[] }[] = [];
  let skipped = 0;
  for (const question of questions) {
    const promptText = question.prompt.trim();
    const cleaned = cleanOptions(question.options ?? []);
    if (!promptText || !cleaned.ok) {
      skipped += 1;
      continue;
    }
    valid.push({ prompt: promptText, options: cleaned.options });
  }

  if (valid.length === 0) {
    return {
      ok: false as const,
      error: "No valid questions found. Use a question, answers A–D, then ANSWER: A.",
    };
  }

  const start = quiz._count.questions;
  await prisma.$transaction(
    async (tx) => {
      const created = await tx.quizQuestion.createManyAndReturn({
        data: valid.map((question, index) => ({
          prompt: question.prompt,
          quizId,
          order: start + index,
        })),
        select: { id: true, order: true },
      });
      const idByOrder = new Map(created.map((row) => [row.order, row.id]));
      await tx.quizOption.createMany({
        data: valid.flatMap((question, index) => {
          const questionId = idByOrder.get(start + index);
          if (!questionId) {
            throw new Error("Could not save quiz questions.");
          }
          return question.options.map((option, optionIndex) => ({
            text: option.text,
            correct: option.correct,
            questionId,
            order: optionIndex,
          }));
        }),
      });
    },
    { timeout: 20_000 },
  );
  revalidatePath(QUIZZES_PATH);
  return { ok: true as const, added: valid.length, skipped };
}

export async function updateQuizQuestion(
  id: string,
  prompt: string,
  options: { text: string; correct: boolean }[],
) {
  const promptText = prompt.trim();
  if (!promptText) {
    return { ok: false as const, error: "Write the question." };
  }
  const cleaned = cleanOptions(options);
  if (!cleaned.ok) return cleaned;

  const userId = await ownerId();
  if (!userId) return { ok: false as const, error: SIGNED_OUT };
  const question = await prisma.quizQuestion.findFirst({
    where: { id, quiz: { userId } },
    select: { id: true },
  });
  if (!question) {
    return { ok: false as const, error: "That question is no longer here." };
  }

  await prisma.$transaction([
    prisma.quizQuestion.update({
      where: { id: question.id },
      data: { prompt: promptText },
    }),
    prisma.quizOption.deleteMany({ where: { questionId: question.id } }),
    prisma.quizOption.createMany({
      data: cleaned.options.map((option, index) => ({
        text: option.text,
        correct: option.correct,
        questionId: question.id,
        order: index,
      })),
    }),
  ]);
  revalidatePath(QUIZZES_PATH);
  return { ok: true as const };
}

export async function deleteQuizQuestion(id: string) {
  const userId = await ownerId();
  if (!userId) return;
  await prisma.quizQuestion.deleteMany({
    where: { id, quiz: { userId } },
  });
  revalidatePath(QUIZZES_PATH);
}

export async function deleteQuizQuestions(ids: string[]) {
  const unique = [...new Set(ids.filter((id) => id.trim().length > 0))];
  if (unique.length === 0) return;

  const userId = await ownerId();
  if (!userId) return;
  await prisma.quizQuestion.deleteMany({
    where: { id: { in: unique }, quiz: { userId } },
  });
  revalidatePath(QUIZZES_PATH);
}

export async function deleteFlashCard(id: string) {
  const userId = await ownerId();
  if (!userId) return;
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
