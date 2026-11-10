"use server";

import { prisma } from "@/lib/prisma";
import { ownerId } from "@/lib/owner";
import { clipTitle } from "@/components/diagram/lib/clipTitle";

export async function renameDiagram(id: string, name: string): Promise<string | null> {
  const title = clipTitle(name);
  if (!id || !title) return null;
  const userId = await ownerId();
  if (!userId) return null;
  const updated = await prisma.diagram.updateMany({
    where: { id, userId },
    data: { title },
  });
  if (!updated.count) return null;
  return title;
}
