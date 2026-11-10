import { spawnSync } from "node:child_process";
import { createWriteStream, existsSync } from "node:fs";
import { cp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { get } from "node:https";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standaloneDir = path.join(root, ".next", "standalone");
const outDir = path.join(root, "dist-desktop");
const resourceDir = path.join(root, "src-tauri", "resources", "app");
const schemaPath = path.join(root, "scripts", "schema.sql");
const nodeTarget = path.join(
  root,
  "src-tauri",
  "binaries",
  "node-x86_64-pc-windows-msvc.exe",
);

const models = [
  "User",
  "WeekPlan",
  "WeekSlot",
  "FlashTopic",
  "Board",
  "List",
  "Card",
  "Drawing",
  "FlashCard",
  "QuizFolder",
  "Quiz",
  "QuizQuestion",
  "QuizOption",
  "Document",
  "Note",
];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function download(url, destination) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destination);
    const request = get(url, (response) => {
      if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        file.close();
        download(response.headers.location, destination).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed ${response.statusCode}: ${url}`));
        response.resume();
        return;
      }
      response.pipe(file);
      file.on("finish", () => file.close(() => resolve()));
    });
    request.on("error", reject);
    file.on("error", reject);
  });
}

async function findNativeBinary(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const found = await findNativeBinary(full);
      if (found) return found;
    } else if (entry.name.endsWith(".node")) {
      return full;
    }
  }
  return null;
}

async function overlayPackage(name) {
  const source = path.join(root, "node_modules", name);
  const destination = path.join(outDir, "node_modules", name);
  if (!existsSync(source)) {
    throw new Error(`Missing package: ${source}`);
  }
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true, force: true });
}

const diff = spawnSync(
  "npx",
  [
    "prisma",
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema",
    "prisma/schema.prisma",
    "--script",
  ],
  { cwd: root, encoding: "utf8", shell: true },
);

if (diff.status !== 0) {
  process.stderr.write(diff.stderr || diff.stdout || "prisma migrate diff failed\n");
  process.exit(diff.status ?? 1);
}

const schemaSql = diff.stdout;
for (const model of models) {
  if (!schemaSql.includes(`CREATE TABLE "${model}"`)) {
    console.error(`Generated schema is missing ${model}`);
    process.exit(1);
  }
}
if (!schemaSql.includes("ON DELETE CASCADE") || !schemaSql.includes("ON DELETE SET NULL")) {
  console.error("Generated schema is missing foreign key actions");
  process.exit(1);
}
await writeFile(schemaPath, schemaSql);

run("npx", ["next", "build"]);

if (!existsSync(path.join(standaloneDir, "server.js"))) {
  console.error("next build did not create .next/standalone/server.js");
  process.exit(1);
}

await rm(outDir, { recursive: true, force: true });
await cp(standaloneDir, outDir, { recursive: true });
await cp(path.join(root, "public"), path.join(outDir, "public"), { recursive: true });
await mkdir(path.join(outDir, ".next"), { recursive: true });
await cp(path.join(root, ".next", "static"), path.join(outDir, ".next", "static"), {
  recursive: true,
});

await overlayPackage("better-sqlite3");
await overlayPackage("@prisma/adapter-better-sqlite3");
await overlayPackage("@prisma/driver-adapter-utils");

const nativeBinary = await findNativeBinary(path.join(outDir, "node_modules", "better-sqlite3"));
if (!nativeBinary) {
  console.error("better-sqlite3 native module was not copied into the desktop bundle");
  process.exit(1);
}

await cp(schemaPath, path.join(outDir, "schema.sql"));
await cp(path.join(root, "scripts", "ensure-schema.cjs"), path.join(outDir, "ensure-schema.cjs"));

await rm(resourceDir, { recursive: true, force: true });
await mkdir(path.dirname(resourceDir), { recursive: true });
await cp(outDir, resourceDir, { recursive: true });

await mkdir(path.dirname(nodeTarget), { recursive: true });
const nodeInfo = existsSync(nodeTarget) ? await stat(nodeTarget) : null;
if (!nodeInfo || nodeInfo.size < 1_000_000) {
  const version = process.version;
  const url = `https://nodejs.org/dist/${version}/win-x64/node.exe`;
  try {
    await download(url, nodeTarget);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

const bundled = await stat(nodeTarget);
if (bundled.size < 1_000_000) {
  console.error(`Bundled Node.js runtime is incomplete: ${nodeTarget}`);
  process.exit(1);
}

console.log(`Desktop bundle ready: ${resourceDir}`);
console.log(`Node.js runtime: ${nodeTarget}`);
