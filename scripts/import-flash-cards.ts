import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../src/lib/prisma";

const DEFAULT_TOPIC_ID = "cmuzez1ie000006l2ixl1o9j1";
const JSON_FILE = "csharp-oop-flashcards.json";

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

function topicIdFromArgv(argv: string[]) {
  const index = argv.indexOf("--topic-id");
  if (index !== -1 && argv[index + 1]) return argv[index + 1];
  return DEFAULT_TOPIC_ID;
}

function isCardShape(
  value: unknown,
): value is { front: unknown; back: unknown } {
  if (value === null || typeof value !== "object") return false;
  return "front" in value && "back" in value;
}

async function main() {
  const topicId = topicIdFromArgv(process.argv.slice(2));
  const jsonPath = path.join(path.dirname(fileURLToPath(import.meta.url)), JSON_FILE);

  let raw: string;
  try {
    raw = await readFile(jsonPath, "utf8");
  } catch {
    throw new Error(`Could not read ${jsonPath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("The JSON file is malformed.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("The JSON file must be an array of { front, back } objects.");
  }

  let invalid = 0;
  const cards: { front: string; back: string }[] = [];
  for (const row of parsed) {
    if (
      !isCardShape(row) ||
      typeof row.front !== "string" ||
      typeof row.back !== "string" ||
      !row.front.trim() ||
      !row.back.trim()
    ) {
      invalid += 1;
      continue;
    }
    cards.push({ front: row.front, back: row.back });
  }

  const userId = await ownerId();
  const topic = await prisma.flashTopic.findFirst({
    where: { id: topicId, userId },
    select: { id: true, name: true },
  });
  if (!topic) {
    throw new Error(
      `Topic "${topicId}" was not found for this user.`,
    );
  }

  const existing = await prisma.flashCard.findMany({
    where: { userId, topicId: topic.id },
    select: { front: true, back: true },
  });
  const seen = new Set(existing.map((card) => `${card.front}\0${card.back}`));

  let duplicates = 0;
  const toInsert: { front: string; back: string }[] = [];
  for (const card of cards) {
    const key = `${card.front}\0${card.back}`;
    if (seen.has(key)) {
      duplicates += 1;
      continue;
    }
    seen.add(key);
    toInsert.push(card);
  }

  let imported = 0;
  if (toInsert.length > 0) {
    const result = await prisma.flashCard.createMany({
      data: toInsert.map((card) => ({
        front: card.front,
        back: card.back,
        topicId: topic.id,
        userId,
      })),
    });
    imported = result.count;
  }

  console.log(`User: ${userId}`);
  console.log(`Topic: ${topic.name} (${topic.id})`);
  console.log(`Read: ${parsed.length}`);
  console.log(`Invalid: ${invalid}`);
  console.log(`Duplicates skipped: ${duplicates}`);
  console.log(`Imported: ${imported}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
