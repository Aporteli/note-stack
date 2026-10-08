import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { CreateTopicForm } from "@/components/flash/CreateTopicForm";
import { EmptyState } from "@/components/ui/Feedback";
import { IconStack } from "@/components/ui/Icons";
import { getFlashTopics } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flash cards · Note-Stack",
  description: "Group flash cards by topic, then flip them.",
};

export default async function FlashCardsPage() {
  const topics = await getFlashTopics();

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <Header wide />
      <div className="mx-auto min-h-0 w-full max-w-6xl flex-1 overflow-y-auto px-5 py-10 sm:px-6 sm:py-14">
        <header className="mb-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Topics
              </h1>
              <p className="mt-3 max-w-lg text-base leading-7 text-ink-soft">
                Create a topic, then add flash cards inside it.
              </p>
            </div>
            <div className="shrink-0">
              <CreateTopicForm />
            </div>
          </div>
        </header>

        {topics.length === 0 ? (
          <section className="rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-sm sm:p-10">
            <EmptyState
              title="Start your first topic"
              body="Make a topic for a subject, then open it to write cards."
            />
          </section>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, i) => (
              <li key={topic.id}>
                <Link
                  href={`/flash-cards/${topic.id}`}
                  className="ns-card group relative flex min-h-[112px] flex-col justify-between overflow-hidden p-4 pl-5"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1.5 transition-[width] duration-200 ease-ns group-hover:w-2.5"
                    style={{
                      background: [
                        "rgb(var(--orchid))",
                        "rgb(var(--lagoon))",
                        "rgb(var(--coral))",
                        "rgb(var(--mint))",
                        "rgb(var(--plum))",
                      ][i % 5],
                    }}
                    aria-hidden="true"
                  />
                  <h2 className="font-display text-lead font-semibold text-ink">
                    {topic.name}
                  </h2>
                  <p className="flex items-center gap-1.5 text-meta text-ink-faint">
                    <IconStack size={15} />
                    {topic._count.cards}{" "}
                    {topic._count.cards === 1 ? "card" : "cards"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
