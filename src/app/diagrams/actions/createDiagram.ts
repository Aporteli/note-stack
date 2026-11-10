"use server";

import { prisma } from "@/lib/prisma";
import { ownerId } from "@/lib/owner";
import { clipTitle } from "@/components/diagram/lib/clipTitle";
import { emptyDocument } from "@/components/diagram/lib/emptyDocument";

export async function createDiagram(name: string): Promise<{ id: string; title: string } | null> {
  const userId = await ownerId();
  if (!userId) return null;
  const title = clipTitle(name) || "Untitled diagram";
  const created = await prisma.diagram.create({
    data: { userId, title, document: JSON.stringify(emptyDocument()) },
    select: { id: true, title: true },
  });
  return created;
}
