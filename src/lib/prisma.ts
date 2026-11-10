import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { addCardImageColumn } from "@/lib/card-columns";
import { addHeadingColumns } from "@/lib/heading-columns";
import { addDocumentStackColumns } from "@/lib/document-columns";
import { addDrawingStackColumns } from "@/lib/drawing-columns";
import { addListSizeColumns } from "@/lib/list-columns";
import { addNoteSizeColumns } from "@/lib/note-columns";
import { ARROW_TABLE_SQL } from "@/lib/arrow-table";
import { FILE_TABLE_SQL } from "@/lib/file-table";
import { TABLE_SQL } from "@/lib/table-sql";
import { HEADING_TABLE_SQL } from "@/lib/heading-table";
import { LINK_TABLE_SQL } from "@/lib/link-table";
import { NOTE_TABLE_SQL } from "@/lib/note-table";
import { addFlashTopicFolderColumn, FLASH_FOLDER_SQL } from "@/lib/flash-folder-table";
import { DIAGRAM_TABLE_SQL } from "@/lib/diagram-table";
import { sqliteDatabaseUrl } from "@/lib/sqlite-path";

const SCHEMA_VERSION = 37;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion: number | undefined;
};

const factory = new PrismaBetterSqlite3({ url: sqliteDatabaseUrl() });
const openConnection = factory.connect.bind(factory);
factory.connect = async () => {
  const connection = await openConnection();
  /* Cascade deletes in the schema run only while foreign keys are enabled. */
  await connection.executeScript("PRAGMA foreign_keys = ON");
  await connection.executeScript(NOTE_TABLE_SQL);
  await connection.executeScript(LINK_TABLE_SQL);
  await connection.executeScript(ARROW_TABLE_SQL);
  await connection.executeScript(HEADING_TABLE_SQL);
  await connection.executeScript(FILE_TABLE_SQL);
  await connection.executeScript(TABLE_SQL);
  await connection.executeScript(FLASH_FOLDER_SQL);
  await connection.executeScript(DIAGRAM_TABLE_SQL);
  const sqlite = (connection as unknown as { client: Parameters<typeof addNoteSizeColumns>[0] }).client;
  addNoteSizeColumns(sqlite);
  addDocumentStackColumns(sqlite);
  addDrawingStackColumns(sqlite);
  addListSizeColumns(sqlite);
  addCardImageColumn(sqlite);
  addHeadingColumns(sqlite);
  addFlashTopicFolderColumn(sqlite);
  return connection;
};

function createClient() {
  return new PrismaClient({
    adapter: factory,
  });
}

export const prisma =
  globalForPrisma.prisma &&
  globalForPrisma.prismaSchemaVersion === SCHEMA_VERSION
    ? globalForPrisma.prisma
    : createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaVersion = SCHEMA_VERSION;
}
