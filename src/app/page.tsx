
import { getBoards } from "./actions";

import CreateBoardForm from "@/components/CreateBoardForm";
import { BoardTile } from "@/components/BoardTile";
import { EmptyState } from "@/components/ui/Feedback";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const boards = await getBoards();

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-paper text-ink">
      {/* Main workspace */}
      <div className="min-h-0 w-full flex-1 overflow-y-auto px-3 py-10 sm:px-3 sm:py-6">
        <header className="mb-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
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
