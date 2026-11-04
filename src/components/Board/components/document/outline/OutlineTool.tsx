"use client";

import { useState, useTransition } from "react";
import { generateOutline } from "@/app/outline/actions";
import { Button } from "@/components/ui/Button";
import {
  CHILD_MAX,
  CHILD_MIN,
  MAX_TOPICS,
  NESTED_MAX,
  NESTED_MIN,
  TITLE_MAX,
  clampCount,
  formatOutline,
  renameNode,
  type OutlineNode,
  type TopicDraft,
} from "@/components/Board/components/document/outline/model";

function blankTopic(): TopicDraft {
  return {
    id: crypto.randomUUID(),
    title: "",
    childCount: 3,
    nestedCount: 2,
  };
}

export function OutlineTool() {
  const [topics, setTopics] = useState<TopicDraft[]>(() => [blankTopic(), blankTopic()]);
  const [nodes, setNodes] = useState<OutlineNode[] | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function updateTopic(id: string, patch: Partial<TopicDraft>) {
    setTopics((current) => current.map((topic) => (topic.id === id ? { ...topic, ...patch } : topic)));
  }

  function generate() {
    setError("");
    setCopied(false);
    startTransition(async () => {
      const result = await generateOutline(
        topics.map((topic) => ({
          title: topic.title,
          childCount: topic.childCount,
          nestedCount: topic.nestedCount,
        })),
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNodes(result.nodes);
    });
  }

  async function copyText() {
    if (!nodes) return;
    try {
      await navigator.clipboard.writeText(formatOutline(nodes));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("ტექსტის კოპირება ვერ მოხერხდა.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            იერარქიული სტრუქტურა
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
            ჩაწერე მთავარი საკითხები და მიუთითე, რამდენი ქვესაკითხი და მეორე დონის პუნქტი გინდა თითოეულზე.
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {topics.map((topic, index) => (
            <li key={topic.id} className="rounded-2xl border border-line bg-white p-3 shadow-sm">
              <div className="flex items-start gap-2">
                <span className="mt-2 w-6 shrink-0 text-sm font-semibold text-ink-soft">{index + 1}.</span>
                <input
                  value={topic.title}
                  maxLength={TITLE_MAX}
                  onChange={(event) => updateTopic(topic.id, { title: event.target.value })}
                  placeholder="მთავარი საკითხი"
                  aria-label={`მთავარი საკითხი ${index + 1}`}
                  className="ns-field min-w-0 flex-1"
                />
                <button
                  type="button"
                  onClick={() => setTopics((current) => current.filter((item) => item.id !== topic.id))}
                  disabled={topics.length === 1}
                  className="mt-1 shrink-0 rounded-md px-2 py-1 text-sm text-ink-soft hover:bg-surface disabled:opacity-40"
                >
                  წაშლა
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <CountControl
                  label="ქვესაკითხები"
                  value={topic.childCount}
                  min={CHILD_MIN}
                  max={CHILD_MAX}
                  onChange={(childCount) => updateTopic(topic.id, { childCount })}
                />
                <CountControl
                  label="მეორე დონე"
                  value={topic.nestedCount}
                  min={NESTED_MIN}
                  max={NESTED_MAX}
                  onChange={(nestedCount) => updateTopic(topic.id, { nestedCount })}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={topics.length >= MAX_TOPICS}
            onClick={() => setTopics((current) => [...current, blankTopic()])}
          >
            საკითხის დამატება
          </Button>
          <Button type="button" variant="primary" loading={pending} onClick={generate}>
            გენერაცია
          </Button>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </section>

      <section className="flex min-h-80 flex-col rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-ink">შედეგი</h2>
          <Button type="button" variant="secondary" size="sm" disabled={!nodes} onClick={() => void copyText()}>
            {copied ? "დაკოპირდა" : "ტექსტის კოპირება"}
          </Button>
        </div>
        {nodes ? (
          <OutlineBranch
            nodes={nodes}
            depth={0}
            onTitle={(number, title) => setNodes((current) => (current ? renameNode(current, number, title) : current))}
          />
        ) : (
          <p className="m-auto max-w-sm text-center text-sm leading-6 text-ink-soft">
            გენერაციის შემდეგ აქ გამოჩნდება შეწეული სია: მთავარი საკითხი, ქვესაკითხი და მეორე დონე.
          </p>
        )}
      </section>
    </div>
  );
}

function CountControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-ink-soft">
      <span className="w-28 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        aria-valuetext={String(value)}
        onChange={(event) => onChange(clampCount(Number(event.target.value), min, max))}
        className="h-1 min-w-0 flex-1 cursor-pointer accent-orchid"
      />
      <span className="w-5 tabular-nums font-semibold text-ink">{value}</span>
    </label>
  );
}

function OutlineBranch({
  nodes,
  depth,
  onTitle,
}: {
  nodes: OutlineNode[];
  depth: number;
  onTitle: (number: string, title: string) => void;
}) {
  return (
    <ul className={depth === 0 ? "flex flex-col gap-4" : "mt-2 flex flex-col gap-2 border-l border-line pl-4"}>
      {nodes.map((node) => (
        <li key={node.number}>
          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-sm font-semibold text-ink-soft">{node.number}.</span>
            <input
              value={node.title}
              maxLength={TITLE_MAX}
              onChange={(event) => onTitle(node.number, event.target.value)}
              placeholder={depth === 0 ? "მთავარი საკითხი" : depth === 1 ? "ქვესაკითხი" : "მეორე დონე"}
              aria-label={`${node.number}. ${depth === 0 ? "მთავარი საკითხი" : depth === 1 ? "ქვესაკითხი" : "მეორე დონე"}`}
              className="ns-field min-w-0 flex-1"
            />
          </div>
          {node.children.length > 0 ? (
            <OutlineBranch nodes={node.children} depth={depth + 1} onTitle={onTitle} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
