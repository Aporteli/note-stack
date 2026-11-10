const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const dbPath = process.env.NOTESTACK_DB;
const schemaPath = process.env.NOTESTACK_SCHEMA;

if (!dbPath || !schemaPath) {
  console.error("NOTESTACK_DB and NOTESTACK_SCHEMA are required");
  process.exit(1);
}

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

const existing = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'User'")
  .get();

if (!existing) {
  db.exec(fs.readFileSync(schemaPath, "utf8"));
}

db.exec(`
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
`);

const noteColumns = new Set(
  db.prepare(`PRAGMA table_info("Note")`).all().map((column) => column.name),
);
if (noteColumns.size > 0 && !noteColumns.has("w")) {
  db.exec(`ALTER TABLE "Note" ADD COLUMN "w" REAL NOT NULL DEFAULT 320`);
}
if (noteColumns.size > 0 && !noteColumns.has("h")) {
  db.exec(`ALTER TABLE "Note" ADD COLUMN "h" REAL NOT NULL DEFAULT 320`);
}
if (noteColumns.size > 0 && !noteColumns.has("z")) {
  db.exec(`ALTER TABLE "Note" ADD COLUMN "z" INTEGER NOT NULL DEFAULT 0`);
}
if (noteColumns.size > 0 && !noteColumns.has("locked")) {
  db.exec(`ALTER TABLE "Note" ADD COLUMN "locked" BOOLEAN NOT NULL DEFAULT 0`);
}

const documentColumns = new Set(
  db.prepare(`PRAGMA table_info("Document")`).all().map((column) => column.name),
);
if (documentColumns.size > 0 && !documentColumns.has("z")) {
  db.exec(`ALTER TABLE "Document" ADD COLUMN "z" INTEGER NOT NULL DEFAULT 0`);
}
if (documentColumns.size > 0 && !documentColumns.has("locked")) {
  db.exec(`ALTER TABLE "Document" ADD COLUMN "locked" BOOLEAN NOT NULL DEFAULT 0`);
}

const listColumns = new Set(
  db.prepare(`PRAGMA table_info("List")`).all().map((column) => column.name),
);
if (listColumns.size > 0 && !listColumns.has("w")) {
  db.exec(`ALTER TABLE "List" ADD COLUMN "w" REAL NOT NULL DEFAULT 296`);
}
if (listColumns.size > 0 && !listColumns.has("h")) {
  db.exec(`ALTER TABLE "List" ADD COLUMN "h" REAL NOT NULL DEFAULT 320`);
}
if (listColumns.size > 0 && !listColumns.has("z")) {
  db.exec(`ALTER TABLE "List" ADD COLUMN "z" INTEGER NOT NULL DEFAULT 0`);
}
if (listColumns.size > 0 && !listColumns.has("locked")) {
  db.exec(`ALTER TABLE "List" ADD COLUMN "locked" BOOLEAN NOT NULL DEFAULT 0`);
}

const drawingColumns = new Set(
  db.prepare(`PRAGMA table_info("Drawing")`).all().map((column) => column.name),
);
if (drawingColumns.size > 0 && !drawingColumns.has("z")) {
  db.exec(`ALTER TABLE "Drawing" ADD COLUMN "z" INTEGER NOT NULL DEFAULT 0`);
}
if (drawingColumns.size > 0 && !drawingColumns.has("locked")) {
  db.exec(`ALTER TABLE "Drawing" ADD COLUMN "locked" BOOLEAN NOT NULL DEFAULT 0`);
}

const cardColumns = new Set(
  db.prepare(`PRAGMA table_info("Card")`).all().map((column) => column.name),
);
if (cardColumns.size > 0 && !cardColumns.has("image")) {
  db.exec(`ALTER TABLE "Card" ADD COLUMN "image" TEXT`);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS "Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "w" REAL NOT NULL DEFAULT 300,
    "h" REAL NOT NULL DEFAULT 48,
    "trashedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Link_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );
  CREATE INDEX IF NOT EXISTS "Link_boardId_idx" ON "Link"("boardId");
  CREATE INDEX IF NOT EXISTS "Link_boardId_trashedAt_idx" ON "Link"("boardId", "trashedAt");
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS "Arrow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "x1" REAL NOT NULL,
    "y1" REAL NOT NULL,
    "x2" REAL NOT NULL,
    "y2" REAL NOT NULL,
    "fromType" TEXT NOT NULL DEFAULT '',
    "fromId" TEXT NOT NULL DEFAULT '',
    "fromSide" TEXT NOT NULL DEFAULT '',
    "toType" TEXT NOT NULL DEFAULT '',
    "toId" TEXT NOT NULL DEFAULT '',
    "toSide" TEXT NOT NULL DEFAULT '',
    "trashedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Arrow_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );
  CREATE INDEX IF NOT EXISTS "Arrow_boardId_idx" ON "Arrow"("boardId");
  CREATE INDEX IF NOT EXISTS "Arrow_boardId_trashedAt_idx" ON "Arrow"("boardId", "trashedAt");
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS "Heading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "w" REAL NOT NULL DEFAULT 640,
    "h" REAL NOT NULL DEFAULT 96,
    "z" INTEGER NOT NULL DEFAULT 0,
    "locked" BOOLEAN NOT NULL DEFAULT 0,
    "fontSize" INTEGER NOT NULL DEFAULT 28,
    "color" TEXT NOT NULL DEFAULT '#1e293b',
    "bold" BOOLEAN NOT NULL DEFAULT 0,
    "align" TEXT NOT NULL DEFAULT 'center',
    "trashedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Heading_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );
  CREATE INDEX IF NOT EXISTS "Heading_boardId_idx" ON "Heading"("boardId");
  CREATE INDEX IF NOT EXISTS "Heading_boardId_trashedAt_idx" ON "Heading"("boardId", "trashedAt");
`);

const headingColumns = new Set(
  db.prepare(`PRAGMA table_info("Heading")`).all().map((column) => column.name),
);
if (headingColumns.size > 0 && !headingColumns.has("z")) {
  db.exec(`ALTER TABLE "Heading" ADD COLUMN "z" INTEGER NOT NULL DEFAULT 0`);
}
if (headingColumns.size > 0 && !headingColumns.has("locked")) {
  db.exec(`ALTER TABLE "Heading" ADD COLUMN "locked" BOOLEAN NOT NULL DEFAULT 0`);
}
if (headingColumns.size > 0 && !headingColumns.has("fontSize")) {
  db.exec(`ALTER TABLE "Heading" ADD COLUMN "fontSize" INTEGER NOT NULL DEFAULT 28`);
}
if (headingColumns.size > 0 && !headingColumns.has("color")) {
  db.exec(`ALTER TABLE "Heading" ADD COLUMN "color" TEXT NOT NULL DEFAULT '#1e293b'`);
}
if (headingColumns.size > 0 && !headingColumns.has("bold")) {
  db.exec(`ALTER TABLE "Heading" ADD COLUMN "bold" BOOLEAN NOT NULL DEFAULT 0`);
}
if (headingColumns.size > 0 && !headingColumns.has("align")) {
  db.exec(`ALTER TABLE "Heading" ADD COLUMN "align" TEXT NOT NULL DEFAULT 'center'`);
}

db.exec(`
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
`);

db.exec(`
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
`);

db.exec(`
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
`);

const topicColumns = new Set(
  db.prepare(`PRAGMA table_info("FlashTopic")`).all().map((column) => column.name),
);
if (topicColumns.size > 0 && !topicColumns.has("folderId")) {
  db.exec(`ALTER TABLE "FlashTopic" ADD COLUMN "folderId" TEXT`);
  db.exec(`CREATE INDEX IF NOT EXISTS "FlashTopic_folderId_idx" ON "FlashTopic"("folderId")`);
}

db.exec(`
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
`);

db.close();
