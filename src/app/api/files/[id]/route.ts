import { rangedBody } from "@/lib/files/rangedBody";
import { readStoredFile } from "@/lib/files/readStoredFile";
import { safeFileId } from "@/lib/files/safeFileId";
import { ownerId } from "@/lib/owner";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await ownerId();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await context.params;
  if (!safeFileId(id)) return new Response("Not found", { status: 404 });

  const row = await prisma.boardFile.findFirst({
    where: { id, trashedAt: null, board: { userId } },
    select: { mime: true, name: true },
  });
  if (!row) return new Response("Not found", { status: 404 });

  const bytes = await readStoredFile(id);
  if (!bytes) return new Response("Not found", { status: 404 });
  const response = rangedBody(bytes, row.mime, request.headers.get("range"));
  const download = new URL(request.url).searchParams.get("download") === "1";
  if (download && response.status === 200) {
    response.headers.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(row.name)}`);
  }
  return response;
}
