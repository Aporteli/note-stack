import type { TableCells } from "@/components/Board/types/table";

export function parseCells(raw: string | null | undefined): TableCells {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const cells: TableCells = {};
    for (const [key, text] of Object.entries(value)) {
      if (typeof text === "string") cells[key] = text;
    }
    return cells;
  } catch {
    return {};
  }
}
