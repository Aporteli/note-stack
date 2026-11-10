/** Adds the note table on databases created before notes existed. */
export const NOTE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS "Note" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "boardId" TEXT NOT NULL,
  "text" TEXT NOT NULL DEFAULT '',
  "x" REAL NOT NULL,
  "y" REAL NOT NULL,
  "w" REAL NOT NULL DEFAULT 320,
  "h" REAL NOT NULL DEFAULT 320,
  "trashedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Note_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Note_boardId_idx" ON "Note"("boardId");
CREATE INDEX IF NOT EXISTS "Note_boardId_trashedAt_idx" ON "Note"("boardId", "trashedAt");
`;
