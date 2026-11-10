type SqliteColumn = { name: string };

type SqliteDb = {
  prepare: (sql: string) => { all: () => SqliteColumn[] };
  exec: (sql: string) => void;
};

export function addHeadingColumns(db: SqliteDb) {
  const names = new Set(db.prepare(`PRAGMA table_info("Heading")`).all().map((column) => column.name));
  if (names.size === 0) return;
  if (!names.has("z")) db.exec(`ALTER TABLE "Heading" ADD COLUMN "z" INTEGER NOT NULL DEFAULT 0`);
  if (!names.has("locked")) db.exec(`ALTER TABLE "Heading" ADD COLUMN "locked" BOOLEAN NOT NULL DEFAULT 0`);
  if (!names.has("fontSize")) db.exec(`ALTER TABLE "Heading" ADD COLUMN "fontSize" INTEGER NOT NULL DEFAULT 28`);
  if (!names.has("color")) db.exec(`ALTER TABLE "Heading" ADD COLUMN "color" TEXT NOT NULL DEFAULT '#1e293b'`);
  if (!names.has("bold")) db.exec(`ALTER TABLE "Heading" ADD COLUMN "bold" BOOLEAN NOT NULL DEFAULT 0`);
  if (!names.has("align")) db.exec(`ALTER TABLE "Heading" ADD COLUMN "align" TEXT NOT NULL DEFAULT 'center'`);
}
