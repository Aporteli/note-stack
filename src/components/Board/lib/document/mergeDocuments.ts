import { isTempId } from "@/components/Board/lib/items";
import type { DocumentData } from "@/components/Board/types/board";

export function mergeDocuments(local: DocumentData[], incoming: DocumentData[]): DocumentData[] {
  const byId = new Map(local.map((doc) => [doc.id, doc]));
  const incomingIds = new Set(incoming.map((doc) => doc.id));
  const saved = incoming.map((doc) => {
    const existing = byId.get(doc.id);
    if (!existing) return doc;
    return {
      ...doc,
      z: existing.z ?? doc.z,
      locked: existing.locked ?? doc.locked,
    };
  });
  const pending = local.filter((doc) => isTempId(doc.id) && !incomingIds.has(doc.id));
  return [...saved, ...pending];
}
