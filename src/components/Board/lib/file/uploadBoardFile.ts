import type { FileRecord } from "@/components/Board/types/boardFile";

export async function uploadBoardFile(boardId: string, file: File, x: number, y: number) {
  const body = new FormData();
  body.set("boardId", boardId);
  body.set("x", String(x));
  body.set("y", String(y));
  body.set("file", file);
  const response = await fetch("/api/files", { method: "POST", body });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as FileRecord;
}
