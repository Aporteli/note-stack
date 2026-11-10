import { copyFile } from "node:fs/promises";
import path from "node:path";
import { filesDir } from "@/lib/files/filesDir";
import { safeFileId } from "@/lib/files/safeFileId";

export async function copyStoredFile(fromId: string, toId: string) {
  if (!safeFileId(fromId) || !safeFileId(toId)) return;
  await copyFile(path.join(filesDir(), fromId), path.join(filesDir(), toId));
}
