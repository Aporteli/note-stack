import type { FormEvent } from "react";
import type { BulkParse, BulkQuestion } from "@/components/flash/aiken";
import { QuizPasteQuestion } from "@/components/flash/quiz/QuizPasteQuestion";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";

const PLACEHOLDER = [
  "1.რას ნიშნავს OOP?",
  "A. მონაცემთა ბაზის მართვის სისტემას",
  "B. ობიექტზე ორიენტირებულ პროგრამირებას",
  "C. პროგრამირების ენას",
  "D. ოპერაციულ სისტემას",
  "ANSWER: B",
].join("\n");

type Props = {
  paste: string;
  error: string;
  note: string;
  preview: BulkParse | null;
  pending: boolean;
  onPaste: (value: string) => void;
  onPreview: (event: FormEvent) => void;
  onSave: () => void;
  onChangeQuestion: (index: number, question: BulkQuestion) => void;
  onRemoveQuestion: (index: number) => void;
};

export function QuizPasteForm({
  paste,
  error,
  note,
  preview,
  pending,
  onPaste,
  onPreview,
  onSave,
  onChangeQuestion,
  onRemoveQuestion,
}: Props) {
  return (
    <form
      onSubmit={onPreview}
      className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 shadow-lift-1 sm:p-5"
    >
      <Field
        label="Paste questions"
        hint="Number each question, add answers A–D, then ANSWER: B. You can paste as many as you want."
      >
        {({ id, describedBy }) => (
          <Textarea
            id={id}
            aria-describedby={describedBy}
            value={paste}
            onChange={(event) => onPaste(event.target.value)}
            placeholder={PLACEHOLDER}
            rows={12}
            className="min-h-64"
          />
        )}
      </Field>
      {error ? <p className="text-meta text-danger">{error}</p> : null}
      {note ? <p className="text-meta text-ink-soft">{note}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="secondary" disabled={!paste.trim() || pending}>
          Preview questions
        </Button>
        {preview && preview.questions.length > 0 ? (
          <Button type="button" variant="primary" loading={pending} onClick={onSave}>
            Save {preview.questions.length}{" "}
            {preview.questions.length === 1 ? "question" : "questions"}
          </Button>
        ) : null}
      </div>
      {preview && preview.errors.length > 0 ? (
        <ul className="flex flex-col gap-1" aria-label="Invalid questions">
          {preview.errors.map((message, index) => (
            <li key={`${index}-${message}`} className="text-meta text-danger">
              {message}
            </li>
          ))}
        </ul>
      ) : null}
      {preview && preview.questions.length > 0 ? (
        <ol className="flex flex-col gap-3">
          {preview.questions.map((question, index) => (
            <QuizPasteQuestion
              key={`${question.number}-${index}`}
              question={question}
              index={index}
              onChange={(next) => onChangeQuestion(index, next)}
              onRemove={() => onRemoveQuestion(index)}
            />
          ))}
        </ol>
      ) : null}
    </form>
  );
}
