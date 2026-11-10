import { fileIdFromCardImage } from "@/lib/files/fileIdFromCardImage";

export function visibleBoardFiles<T extends { id: string }>(
  files: T[],
  cards: { image?: string | null }[],
) {
  const used = new Set(
    cards.map((card) => fileIdFromCardImage(card.image)).filter((id): id is string => id !== null),
  );
  return files.filter((file) => !used.has(file.id));
}
