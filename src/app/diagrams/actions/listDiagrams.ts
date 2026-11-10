"use server";

import { prisma } from "@/lib/prisma";
import { ownerId } from "@/lib/owner";
import type { DiagramSummary } from "@/components/diagram/types";

export async function listDiagrams(): Promise<DiagramSummary[]> {
  const userId = await ownerId();
  if (!userId) return [];
  const rows = await prisma.diagram.findMany({
    where: { userId },
    select: { id: true, title: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    updatedAt: row.updatedAt.toISOString(),
  }));
}
