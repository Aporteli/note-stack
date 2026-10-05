<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cloud Agent

PostgreSQL 16 is installed in this environment. On boot, `.env` is written with `DATABASE_URL` for the local `note_stack` database, `npx prisma migrate deploy` applies `prisma/migrations`, and `npm run dev` listens on port 3000.

Use http://localhost:3000. Next.js dev mode blocks its client resources for the `127.0.0.1` host, so that host serves HTML that does not hydrate.

`npx tsc --noEmit` and `npm run build` succeed. `npm run lint` currently exits non-zero because of existing ESLint findings in the app.
