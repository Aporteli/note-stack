import { FlashQuiz } from "@/components/flash/FlashQuiz";
import { IconBack } from "@/components/ui/Icons";
import type { QuizListItem } from "@/app/flash-cards/actions";

export function QuizTakeView({
  quiz,
  onBack,
}: {
  quiz: QuizListItem;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-1 inline-flex items-center gap-1 text-meta font-medium text-ink-soft hover:text-ink"
        >
          <IconBack size={14} />
          All quizzes
        </button>
        <h2 className="font-display text-xl font-semibold text-ink">{quiz.title}</h2>
      </div>
      <FlashQuiz questions={quiz.questions} />
    </div>
  );
}

export function QuizOpening({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-2 inline-flex items-center gap-1 text-meta font-medium text-ink-soft hover:text-ink"
      >
        <IconBack size={14} />
        All quizzes
      </button>
      <p className="text-sm text-ink-soft">Opening quiz…</p>
    </div>
  );
}
