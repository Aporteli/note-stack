type SqliteColumn = { name: string };

type SqliteDb = {
  prepare: (sql: string) => { all: () => SqliteColumn[] };
  exec: (sql: string) => void;
};

export function addDocumentStackColumns(db: SqliteDb) {
  const names = new Set(db.prepare(`PRAGMA table_info("Document")`).all().map((column) => column.name));
  if (names.size === 0) return;
  if (!names.has("z")) db.exec(`ALTER TABLE "Document" ADD COLUMN "z" INTEGER NOT NULL DEFAULT 0`);
  if (!names.has("locked")) {
    db.exec(`ALTER TABLE "Document" ADD COLUMN "locked" BOOLEAN NOT NULL DEFAULT 0`);
  }
}
