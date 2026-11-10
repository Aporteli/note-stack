import type { Metadata } from "next";
import { QuizBoard } from "@/components/flash/QuizBoard";
import { getAllQuizzes, getQuizFolders } from "@/app/flash-cards/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quiz · Note-Stack",
  description: "Create a multiple-choice quiz and take it.",
};

export default async function QuizzesPage() {
  const [quizzes, folders] = await Promise.all([getAllQuizzes(), getQuizFolders()]);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper text-ink">
      <div className="min-h-0 w-full flex-1 overflow-y-auto px-3 sm:px-3">
        <QuizBoard quizzes={quizzes} folders={folders} />
      </div>
    </main>
  );
}
