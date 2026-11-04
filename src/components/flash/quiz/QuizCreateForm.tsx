import type { FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { Input } from "@/components/ui/Field";
import { IconPlus } from "@/components/ui/Icons";

type Topic = { id: string; name: string };

export function QuizCreateForm({
  topics,
  topicId,
  title,
  error,
  pending,
  onTopic,
  onTitle,
  onSubmit,
}: {
  topics: Topic[];
  topicId: string;
  title: string;
  error: string;
  pending: boolean;
  onTopic: (id: string) => void;
  onTitle: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  if (topics.length === 0) {
    return (
      <EmptyState
        title="Create a topic first"
        body="Quizzes live with a topic. Make one on the flash cards page, then come back to add a quiz."
        action={
          <Link href="/flash-cards" className="ns-btn ns-btn--primary">
            Flash cards
          </Link>
        }
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <select
        value={topicId}
        onChange={(event) => onTopic(event.target.value)}
        aria-label="Topic"
        className="ns-field sm:w-48"
      >
        {topics.map((topic) => (
          <option key={topic.id} value={topic.id}>
            {topic.name}
          </option>
        ))}
      </select>
      <div className="min-w-0 flex-1">
        <Input
          value={title}
          onChange={(event) => onTitle(event.target.value)}
          placeholder="Name a new quiz"
          aria-label="New quiz name"
          invalid={Boolean(error)}
        />
        {error ? <p className="mt-1.5 text-meta text-danger">{error}</p> : null}
      </div>
      <Button type="submit" variant="primary" loading={pending}>
        {!pending && <IconPlus size={18} />}
        Create quiz
      </Button>
    </form>
  );
}
