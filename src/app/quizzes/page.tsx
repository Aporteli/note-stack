import type { Metadata } from "next";
import { QuizBoard } from "@/components/flash/QuizBoard";
import { getAllQuizzes, getFlashTopics, getQuizFolders } from "@/app/flash-cards/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quiz · Note-Stack",
  description: "Create a multiple-choice quiz and take it.",
};

export default async function QuizzesPage() {
  const [topics, quizzes, folders] = await Promise.all([
    getFlashTopics(),
    getAllQuizzes(),
    getQuizFolders(),
  ]);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper text-ink">
      <div className="min-h-0 w-full flex-1 overflow-y-auto px-6 py-10 sm:px-10 sm:py-14">
        <header className="mb-10 max-w-xl">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Quiz
          </h1>
          <p className="mt-3 max-w-lg text-base leading-7 text-ink-soft">
            Create a test, add questions, and pick one answer at a time.
          </p>
        </header>
        <QuizBoard
          topics={topics.map((topic) => ({ id: topic.id, name: topic.name }))}
          quizzes={quizzes}
          folders={folders}
        />
      </div>
    </main>
  );
}
