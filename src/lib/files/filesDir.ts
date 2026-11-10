import { mkdirSync } from "node:fs";
import path from "node:path";
import { sqliteFilePath } from "@/lib/sqlite-path";

export function filesDir() {
  const dir = path.join(path.dirname(sqliteFilePath()), "files");
  mkdirSync(dir, { recursive: true });
  return dir;
}
