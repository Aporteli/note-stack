export const DIAGRAM_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS "Diagram" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT 'Untitled diagram',
  "document" TEXT NOT NULL DEFAULT '{"shapes":[],"connectors":[]}',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Diagram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Diagram_userId_updatedAt_idx" ON "Diagram"("userId", "updatedAt");
`;
