"use server";

import { prisma } from "@/lib/prisma";
import { ownerId } from "@/lib/owner";
import { parseDocument } from "@/components/diagram/lib/parseDocument";
import type { DiagramRecord } from "@/components/diagram/types";

export async function readDiagram(id: string): Promise<DiagramRecord | null> {
  if (!id) return null;
  const userId = await ownerId();
  if (!userId) return null;
  const row = await prisma.diagram.findFirst({
    where: { id, userId },
    select: { id: true, title: true, document: true, updatedAt: true },
  });
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    document: parseDocument(row.document),
    updatedAt: row.updatedAt.toISOString(),
  };
}
