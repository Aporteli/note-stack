"use server";

import {
  CHILD_MAX,
  CHILD_MIN,
  MAX_TOPICS,
  NESTED_MAX,
  NESTED_MIN,
  TITLE_MAX,
  buildOutline,
  clampCount,
  type OutlineNode,
} from "@/components/Board/components/document/outline/model";

export type GenerateOutlineResult =
  | { ok: true; nodes: OutlineNode[] }
  | { ok: false; error: string };

export async function generateOutline(input: unknown): Promise<GenerateOutlineResult> {
  if (!Array.isArray(input)) {
    return { ok: false, error: "მთავარი საკითხები არასწორია." };
  }
  if (input.length > MAX_TOPICS) {
    return { ok: false, error: `მაქსიმუმ ${MAX_TOPICS} მთავარი საკითხი.` };
  }

  const topics = input.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as { title?: unknown; childCount?: unknown; nestedCount?: unknown };
    const title = typeof row.title === "string" ? row.title.trim().slice(0, TITLE_MAX) : "";
    if (!title) return [];
    return [
      {
        title,
        childCount: clampCount(Number(row.childCount), CHILD_MIN, CHILD_MAX),
        nestedCount: clampCount(Number(row.nestedCount), NESTED_MIN, NESTED_MAX),
      },
    ];
  });

  if (topics.length === 0) {
    return { ok: false, error: "ჯერ ერთი მთავარი საკითხი მაინც ჩაწერე." };
  }

  return { ok: true, nodes: buildOutline(topics) };
}
