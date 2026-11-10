type SqliteColumn = { name: string };

type SqliteDb = {
  prepare: (sql: string) => { all: () => SqliteColumn[] };
  exec: (sql: string) => void;
};

export function addNoteSizeColumns(db: SqliteDb) {
  const names = new Set(db.prepare(`PRAGMA table_info("Note")`).all().map((column) => column.name));
  if (names.size === 0) return;
  if (!names.has("w")) db.exec(`ALTER TABLE "Note" ADD COLUMN "w" REAL NOT NULL DEFAULT 320`);
  if (!names.has("h")) db.exec(`ALTER TABLE "Note" ADD COLUMN "h" REAL NOT NULL DEFAULT 320`);
  if (!names.has("z")) db.exec(`ALTER TABLE "Note" ADD COLUMN "z" INTEGER NOT NULL DEFAULT 0`);
  if (!names.has("locked")) db.exec(`ALTER TABLE "Note" ADD COLUMN "locked" BOOLEAN NOT NULL DEFAULT 0`);
}
