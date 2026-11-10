export const FILE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS "BoardFile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "boardId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "mime" TEXT NOT NULL DEFAULT '',
  "size" INTEGER NOT NULL DEFAULT 0,
  "kind" TEXT NOT NULL DEFAULT 'file',
  "x" REAL NOT NULL,
  "y" REAL NOT NULL,
  "trashedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BoardFile_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "BoardFile_boardId_idx" ON "BoardFile"("boardId");
CREATE INDEX IF NOT EXISTS "BoardFile_boardId_trashedAt_idx" ON "BoardFile"("boardId", "trashedAt");
`;
