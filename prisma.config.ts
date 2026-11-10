import "dotenv/config";
import { defineConfig } from "prisma/config";
import { sqliteDatabaseUrl } from "./src/lib/sqlite-path";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: sqliteDatabaseUrl(),
  },
});
