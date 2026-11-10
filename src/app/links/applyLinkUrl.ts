"use server";

import { revalidatePath } from "next/cache";
import { readLinkPreview } from "@/components/Board/lib/link/readLinkPreview";
import { prisma } from "@/lib/prisma";
import type { LinkPreview } from "@/components/Board/types/link";

export async function applyLinkUrl(linkId: string, raw: string, boardId: string): Promise<LinkPreview | null> {
  if (linkId.startsWith("temp-")) return null;
  const preview = await readLinkPreview(raw);
  if (!preview) return null;
  await prisma.link.updateMany({
    where: { id: linkId, boardId, trashedAt: null },
    data: {
      url: preview.url,
      title: preview.title,
      description: preview.description,
      image: preview.image,
      icon: preview.icon,
      h: preview.image ? 360 : 140,
    },
  });
  revalidatePath(`/board/${boardId}`);
  return preview;
}
