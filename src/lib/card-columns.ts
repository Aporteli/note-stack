type SqliteColumn = { name: string };

type SqliteDb = {
  prepare: (sql: string) => { all: () => SqliteColumn[] };
  exec: (sql: string) => void;
};

export function addCardImageColumn(db: SqliteDb) {
  const names = new Set(db.prepare(`PRAGMA table_info("Card")`).all().map((column) => column.name));
  if (names.size === 0 || names.has("image")) return;
  db.exec(`ALTER TABLE "Card" ADD COLUMN "image" TEXT`);
}
