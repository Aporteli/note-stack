export const TABLE_SQL = `
CREATE TABLE IF NOT EXISTS "BoardTable" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "boardId" TEXT NOT NULL,
  "x" REAL NOT NULL,
  "y" REAL NOT NULL,
  "cols" INTEGER NOT NULL DEFAULT 4,
  "rows" INTEGER NOT NULL DEFAULT 7,
  "cells" TEXT NOT NULL DEFAULT '{}',
  "trashedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BoardTable_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "BoardTable_boardId_idx" ON "BoardTable"("boardId");
CREATE INDEX IF NOT EXISTS "BoardTable_boardId_trashedAt_idx" ON "BoardTable"("boardId", "trashedAt");
`;
