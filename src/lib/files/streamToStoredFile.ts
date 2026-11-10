import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeStream } from "node:stream/web";
import path from "node:path";
import { filesDir } from "@/lib/files/filesDir";
import { safeFileId } from "@/lib/files/safeFileId";

export async function streamToStoredFile(id: string, body: ReadableStream<Uint8Array>) {
  if (!safeFileId(id)) throw new Error("Bad file id");
  await pipeline(Readable.fromWeb(body as NodeStream<Uint8Array>), createWriteStream(path.join(filesDir(), id)));
}
