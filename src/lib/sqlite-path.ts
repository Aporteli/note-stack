import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/** Local database file for this Windows user. The name is never hardcoded. */
export function sqliteFilePath(): string {
  const appData =
    process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming");
  return path.join(appData, "NoteStack", "note-stack.db");
}

export function sqliteDatabaseUrl(): string {
  const filePath = sqliteFilePath();
  mkdirSync(path.dirname(filePath), { recursive: true });
  return `file:${filePath.replace(/\\/g, "/")}`;
}
