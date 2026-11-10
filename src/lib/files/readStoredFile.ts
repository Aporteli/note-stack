import { readFile } from "node:fs/promises";
import path from "node:path";
import { filesDir } from "@/lib/files/filesDir";
import { safeFileId } from "@/lib/files/safeFileId";

export async function readStoredFile(id: string) {
  if (!safeFileId(id)) return null;
  try {
    return await readFile(path.join(filesDir(), id));
  } catch {
    return null;
  }
}
