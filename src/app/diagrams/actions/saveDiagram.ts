"use server";

import { prisma } from "@/lib/prisma";
import { ownerId } from "@/lib/owner";
import { acceptDocument } from "@/components/diagram/lib/acceptDocument";
import type { DiagramDocument } from "@/components/diagram/types";

export async function saveDiagram(id: string, document: DiagramDocument): Promise<boolean> {
  if (!id) return false;
  const userId = await ownerId();
  if (!userId) return false;
  const accepted = acceptDocument(document);
  if (!accepted) return false;
  const updated = await prisma.diagram.updateMany({
    where: { id, userId },
    data: { document: JSON.stringify(accepted) },
  });
  return updated.count > 0;
}
