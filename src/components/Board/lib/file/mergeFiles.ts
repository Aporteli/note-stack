import { isTempId } from "@/components/Board/lib/items";
import type { FileData, FileRecord } from "@/components/Board/types/boardFile";

const held = new Set<string>();

/** Keep a file on the board until a server payload includes it. */
export function holdFile(id: string) {
  held.add(id);
}

export function releaseFile(id: string) {
  held.delete(id);
}

export function toFileData(record: FileRecord): FileData {
  return { ...record, key: record.id };
}

export function mergeFiles(local: FileData[], incoming: FileRecord[]): FileData[] {
  const byId = new Map(local.map((file) => [file.id, file]));
  const saved = incoming.map((record) => {
    const existing = byId.get(record.id);
    if (!existing) return toFileData(record);
    return { ...existing, x: existing.x, y: existing.y };
  });
  const savedIds = new Set(saved.map((file) => file.id));
  for (const id of savedIds) held.delete(id);
  const pending = local.filter(
    (file) => !savedIds.has(file.id) && (isTempId(file.id) || held.has(file.id)),
  );
  return [...saved, ...pending];
}
