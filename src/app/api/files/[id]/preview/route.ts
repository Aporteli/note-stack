import { docxToHtml } from "@/lib/files/docxToHtml";
import { isDocx } from "@/lib/files/isDocx";
import { readStoredFile } from "@/lib/files/readStoredFile";
import { safeFileId } from "@/lib/files/safeFileId";
import { sanitizePreviewHtml } from "@/lib/files/sanitizePreviewHtml";
import { ownerId } from "@/lib/owner";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await ownerId();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await context.params;
  if (!safeFileId(id)) return new Response("Not found", { status: 404 });

  const row = await prisma.boardFile.findFirst({
    where: { id, trashedAt: null, board: { userId } },
    select: { name: true, mime: true },
  });
  if (!row || !isDocx(row.name, row.mime)) return new Response("Not found", { status: 404 });

  const bytes = await readStoredFile(id);
  if (!bytes) return new Response("Not found", { status: 404 });

  try {
    const html = sanitizePreviewHtml(await docxToHtml(bytes));
    return Response.json({ html });
  } catch (err) {
    console.error("Failed to preview file", err);
    return new Response("Could not preview file", { status: 422 });
  }
}
