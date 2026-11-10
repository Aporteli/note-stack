"use server";

import { prisma } from "@/lib/prisma";
import { ownerId } from "@/lib/owner";

export async function deleteDiagram(id: string): Promise<boolean> {
  if (!id) return false;
  const userId = await ownerId();
  if (!userId) return false;
  const deleted = await prisma.diagram.deleteMany({ where: { id, userId } });
  return deleted.count > 0;
}
