import { isTempId } from "@/components/Board/lib/items";
import type { LinkData, LinkRecord } from "@/components/Board/types/link";

export function toLinkData(record: LinkRecord): LinkData {
  return { ...record, key: record.id, fresh: false };
}

export function mergeLinks(local: LinkData[], incoming: LinkRecord[]): LinkData[] {
  const byId = new Map(local.map((link) => [link.id, link]));
  const saved = incoming.map((record) => {
    const existing = byId.get(record.id);
    if (!existing) return toLinkData(record);
    return {
      ...existing,
      x: existing.x,
      y: existing.y,
      url: record.url || existing.url,
      title: record.title || existing.title,
      description: record.description || existing.description,
      image: record.image || existing.image,
      icon: record.icon || existing.icon,
      h: record.h || existing.h,
    };
  });
  const pending = local.filter((link) => isTempId(link.id));
  return [...saved, ...pending];
}
