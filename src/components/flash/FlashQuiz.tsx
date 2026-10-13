"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { QuizQuestionData } from "@/app/flash-cards/actions";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { IconCheck, IconClose, IconShuffle } from "@/components/ui/Icons";

type PlayQuestion = {
  id: string;
  prompt: string;
  correctId: string;
  options: { id: string; text: string }[];
};

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = next[i];
    next[i] = next[j];
    next[j] = swap;
  }
  return next;
}

function toPlay(questions: QuizQuestionData[]): PlayQuestion[] {
  return questions.flatMap((question) => {
    const correct = question.options.find((option) => option.correct);
    if (!correct || question.options.length < 2) return [];
    return [
      {
        id: question.id,
        prompt: question.prompt,
        correctId: correct.id,
        options: shuffle(question.options.map((option) => ({ id: option.id, text: option.text }))),
      },
    ];
  });
}

function questionSignature(questions: QuizQuestionData[]) {
  return questions
    .map((question) =>
      [
        question.id,
        question.prompt,
        ...question.options.map((option) => `${option.id}:${option.correct ? "1" : "0"}:${option.text}`),
      ].join("\u0000"),
    )
    .join("\u0001");
}

export function FlashQuiz({ questions }: { questions: QuizQuestionData[] }) {
  const signature = useMemo(() => questionSignature(questions), [questions]);
  const questionsRef = useRef(questions);
  questionsRef.current = questions;
  const [play, setPlay] = useState<PlayQuestion[] | null>(null);
  const [picks, setPicks] = useState<Record<string, string>>({});

  useEffect(() => {
    setPlay(toPlay(questionsRef.current));
    setPicks({});
  }, [signature]);

  function select(questionId: string, optionId: string) {
    setPicks((prev) => {
      if (prev[questionId]) return prev;
      return { ...prev, [questionId]: optionId };
    });
  }

  function tryAgain() {
    setPicks({});
  }

  function shuffleTexts() {
    setPlay((current) =>
      current
        ? shuffle(current).map((question) => ({
            ...question,
            options: shuffle(question.options),
          }))
        : current,
    );
  }

  if (play === null) return null;

  if (play.length === 0) {
    return (
      <div className="grid min-h-full place-items-center">
        <div className="w-full max-w-lg">
          <EmptyState
            title="This quiz has no questions yet"
            body="Add a question and at least two answers, and mark which one is correct."
          />
        </div>
      </div>
    );
  }

  const score = play.reduce(
    (total, question) => total + (picks[question.id] === question.correctId ? 1 : 0),
    0,
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-lead font-semibold text-ink" aria-live="polite">
          Score {score} / {play.length}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={shuffleTexts}>
            <IconShuffle size={16} />
            Shuffle
          </Button>
          <Button type="button" variant="secondary" onClick={tryAgain}>
            Try Again
          </Button>
        </div>
      </div>

      <ol className="flex flex-col gap-4">
        {play.map((question, index) => {
          const selected = picks[question.id];
          const answered = selected !== undefined;
          return (
            <li key={question.id}>
              <article className="rounded-card border border-line bg-paper p-4 shadow-lift-1 sm:p-5">
                <p className="text-meta font-medium uppercase tracking-wide text-ink-faint">
                  Question {index + 1}
                </p>
                <h2 className="quiz-copy mt-2 text-ink" id={`quiz-${question.id}`}>
                  {question.prompt}
                </h2>
                <div
                  className="mt-4 grid gap-2"
                  role="group"
                  aria-labelledby={`quiz-${question.id}`}
                >
                  {question.options.map((option) => {
                    const isSelected = selected === option.id;
                    const isCorrect = option.id === question.correctId;
                    const tone = !answered
                      ? "border-line bg-paper text-ink hover:border-line-strong hover:bg-surface"
                      : isCorrect
                        ? "border-mint bg-mint text-ink"
                        : isSelected
                          ? "border-danger bg-danger text-ink-invert"
                          : "border-line bg-paper text-ink-faint";
                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={answered}
                        aria-pressed={isSelected}
                        onClick={() => select(question.id, option.id)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orchid disabled:cursor-default disabled:opacity-100 ${tone}`}
                      >
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center">
                          {answered && isCorrect ? <IconCheck size={16} /> : null}
                          {answered && isSelected && !isCorrect ? (
                            <IconClose size={16} />
                          ) : null}
                        </span>
                        <span className="quiz-copy min-w-0 flex-1 font-medium">
                          {option.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
