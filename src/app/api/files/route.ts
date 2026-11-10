import { fileKind } from "@/lib/files/fileKind";
import { fileSize } from "@/lib/files/fileSize";
import { removeStoredFile } from "@/lib/files/removeStoredFile";
import { streamToStoredFile } from "@/lib/files/streamToStoredFile";
import { ownerId } from "@/lib/owner";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await ownerId();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const form = await request.formData();
  const uploaded = form.get("file");
  const boardId = String(form.get("boardId") ?? "");
  const x = Math.max(0, Number(form.get("x") ?? 48) || 0);
  const y = Math.max(0, Number(form.get("y") ?? 48) || 0);
  if (!(uploaded instanceof File) || !boardId) return new Response("Bad request", { status: 400 });

  const board = await prisma.board.findFirst({
    where: { id: boardId, userId },
    select: { id: true },
  });
  if (!board) return new Response("Not found", { status: 404 });

  const kind = fileKind(uploaded.name, uploaded.type);
  const created = await prisma.boardFile.create({
    data: {
      boardId,
      name: uploaded.name || "File",
      mime: uploaded.type || "application/octet-stream",
      size: BigInt(uploaded.size),
      kind,
      x,
      y,
    },
  });

  try {
    await streamToStoredFile(created.id, uploaded.stream());
  } catch (err) {
    await prisma.boardFile.delete({ where: { id: created.id } }).catch(() => undefined);
    await removeStoredFile(created.id);
    console.error("Failed to store file", err);
    return new Response("Could not store file", { status: 500 });
  }

  return Response.json({
    id: created.id,
    name: created.name,
    mime: created.mime,
    size: fileSize(created.size),
    kind: created.kind,
    x: created.x,
    y: created.y,
  });
}
