type SqliteColumn = { name: string };

type SqliteDb = {
  prepare: (sql: string) => { all: () => SqliteColumn[] };
  exec: (sql: string) => void;
};

export const FLASH_FOLDER_SQL = `
CREATE TABLE IF NOT EXISTS "FlashFolder" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "parentId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FlashFolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FlashFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FlashFolder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "FlashFolder_userId_parentId_idx" ON "FlashFolder"("userId", "parentId");
`;

export function addFlashTopicFolderColumn(db: SqliteDb) {
  const names = new Set(
    db.prepare(`PRAGMA table_info("FlashTopic")`).all().map((column) => column.name),
  );
  if (names.size === 0 || names.has("folderId")) return;
  db.exec(`ALTER TABLE "FlashTopic" ADD COLUMN "folderId" TEXT`);
  db.exec(`CREATE INDEX IF NOT EXISTS "FlashTopic_folderId_idx" ON "FlashTopic"("folderId")`);
}
