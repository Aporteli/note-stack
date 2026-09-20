
import { getBoards } from "./actions";

import CreateBoardForm from "@/components/CreateBoardForm";
import { BoardTile } from "@/components/BoardTile";
import { EmptyState } from "@/components/ui/Feedback";
import { IconStack } from "@/components/ui/Icons";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const boards = await getBoards();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header />

      {/* Main workspace */}
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
        <header className="mb-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="mb-2 text-sm font-medium text-plum">
                Workspace
              </p>

              <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Your boards
              </h1>

              <p className="mt-3 max-w-lg text-base leading-7 text-ink-soft">
                Keep projects, ideas, research, and everything you're working
                on organized in one place.
              </p>
            </div>

            <div className="shrink-0">
              <CreateBoardForm />
            </div>
          </div>
        </header>

        {boards.length === 0 ? (
          <section className="rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-sm sm:p-10">
            <EmptyState
              title="Start your first board"
              body="Create a board for a project, course, week of writing, or anything else you want to keep organized."
            />
          </section>
        ) : (
          <section aria-labelledby="boards-heading">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2
                  id="boards-heading"
                  className="text-sm font-semibold text-ink"
                >
                  All boards
                </h2>

                <p className="mt-1 text-sm text-ink-soft">
                  {boards.length}{" "}
                  {boards.length === 1 ? "board" : "boards"}, newest first
                </p>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {boards.map((board, i) => (
                <li key={board.id}>
                  <BoardTile board={board} index={i} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
