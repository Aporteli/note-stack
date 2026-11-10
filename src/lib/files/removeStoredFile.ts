import { unlink } from "node:fs/promises";
import path from "node:path";
import { filesDir } from "@/lib/files/filesDir";
import { safeFileId } from "@/lib/files/safeFileId";

export async function removeStoredFile(id: string) {
  if (!safeFileId(id)) return;
  await unlink(path.join(filesDir(), id)).catch(() => undefined);
}
