import { isTempId } from "@/components/Board/lib/items";
import type { ArrowData, ArrowRecord } from "@/components/Board/types/arrow";

export function mergeArrows(local: ArrowData[], incoming: ArrowRecord[]): ArrowData[] {
  const byId = new Map(local.map((arrow) => [arrow.id, arrow]));
  const saved = incoming.map((record) => byId.get(record.id) ?? record);
  const pending = local.filter((arrow) => isTempId(arrow.id));
  return [...saved, ...pending];
}
