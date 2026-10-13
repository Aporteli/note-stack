"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const PATH = "/flash-cards";
const QUIZZES_PATH = "/quizzes";

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

export async function getQuizzes(topicId: string): Promise<QuizData[]> {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!user) return [];

  return prisma.quiz.findMany({
    where: { userId: user.id, topicId },
    orderBy: { createdAt: "desc" },
    select: quizSelect,
  });
}

export type QuizListItem = QuizData & {
  topicId: string;
  topicName: string;
};

export async function getAllQuizzes(): Promise<QuizListItem[]> {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!user) return [];

  const quizzes = await prisma.quiz.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      ...quizSelect,
      topicId: true,
      topic: { select: { name: true } },
    },
  });

  return quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    topicId: quiz.topicId,
    topicName: quiz.topic.name,
    questions: quiz.questions,
  }));
}

export async function createQuiz(topicId: string, title: string) {
  const trimmed = title.trim();
  if (!trimmed) {
    return { ok: false as const, error: "Name the quiz first." };
  }

  const userId = await ownerId();
  const topic = await prisma.flashTopic.findFirst({
    where: { id: topicId, userId },
    select: { id: true },
  });
  if (!topic) {
    return { ok: false as const, error: "That topic is no longer here." };
  }

  const quiz = await prisma.quiz.create({
    data: { title: trimmed, topicId, userId },
  });
  revalidatePath(`${PATH}/${topicId}`);
  revalidatePath(QUIZZES_PATH);
  return { ok: true as const, id: quiz.id };
}

export async function deleteQuiz(id: string) {
  const userId = await ownerId();
  const quiz = await prisma.quiz.findFirst({
    where: { id, userId },
    select: { topicId: true },
  });
  await prisma.quiz.deleteMany({ where: { id, userId } });
  if (quiz) revalidatePath(`${PATH}/${quiz.topicId}`);
  revalidatePath(QUIZZES_PATH);
}

export async function deleteQuizzes(ids: string[]) {
  const unique = [...new Set(ids.filter((id) => id.trim().length > 0))];
  if (unique.length === 0) return;

  const userId = await ownerId();
  const quizzes = await prisma.quiz.findMany({
    where: { id: { in: unique }, userId },
    select: { topicId: true },
  });
  await prisma.quiz.deleteMany({
    where: { id: { in: unique }, userId },
  });
  for (const topicId of new Set(quizzes.map((quiz) => quiz.topicId))) {
    revalidatePath(`${PATH}/${topicId}`);
  }
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
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId },
    select: { topicId: true, _count: { select: { questions: true } } },
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
  revalidatePath(`${PATH}/${quiz.topicId}`);
  revalidatePath(QUIZZES_PATH);
  return { ok: true as const };
}

export async function addQuizQuestions(
  quizId: string,
  questions: { prompt: string; options: { text: string; correct: boolean }[] }[],
) {
  const userId = await ownerId();
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId },
    select: { topicId: true, _count: { select: { questions: true } } },
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
  revalidatePath(`${PATH}/${quiz.topicId}`);
  revalidatePath(QUIZZES_PATH);
  return { ok: true as const, added: valid.length, skipped };
}

export async function deleteQuizQuestion(id: string) {
  const userId = await ownerId();
  const question = await prisma.quizQuestion.findFirst({
    where: { id, quiz: { userId } },
    select: { quiz: { select: { topicId: true } } },
  });
  await prisma.quizQuestion.deleteMany({
    where: { id, quiz: { userId } },
  });
  if (question) revalidatePath(`${PATH}/${question.quiz.topicId}`);
  revalidatePath(QUIZZES_PATH);
}

export async function deleteQuizQuestions(ids: string[]) {
  const unique = [...new Set(ids.filter((id) => id.trim().length > 0))];
  if (unique.length === 0) return;

  const userId = await ownerId();
  const questions = await prisma.quizQuestion.findMany({
    where: { id: { in: unique }, quiz: { userId } },
    select: { quiz: { select: { topicId: true } } },
  });
  await prisma.quizQuestion.deleteMany({
    where: { id: { in: unique }, quiz: { userId } },
  });
  for (const topicId of new Set(questions.map((question) => question.quiz.topicId))) {
    revalidatePath(`${PATH}/${topicId}`);
  }
  revalidatePath(QUIZZES_PATH);
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
