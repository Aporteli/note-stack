"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createDiagram } from "@/app/diagrams/actions/createDiagram";
import { deleteDiagram } from "@/app/diagrams/actions/deleteDiagram";
import { renameDiagram } from "@/app/diagrams/actions/renameDiagram";
import { DiagramCreateForm } from "@/components/diagram/DiagramCreateForm";
import { DiagramRow } from "@/components/diagram/DiagramRow";
import type { DiagramSummary } from "@/components/diagram/types";
import { ConfirmDialog } from "@/components/Board/components/ConfirmDialog";
import { EmptyState } from "@/components/ui/Feedback";

export function DiagramLibrary({ initial }: { initial: DiagramSummary[] }) {
  const router = useRouter();
  const [diagrams, setDiagrams] = useState(initial);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<DiagramSummary | null>(null);

  function onCreate(event: FormEvent) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const created = await createDiagram(name);
      if (!created) {
        setError("Couldn't create the diagram.");
        return;
      }
      router.push(`/diagrams/${created.id}`);
    });
  }

  function commitRename(diagram: DiagramSummary) {
    const next = draft.trim();
    setEditingId(null);
    if (!next || next === diagram.title) return;
    startTransition(async () => {
      const title = await renameDiagram(diagram.id, next);
      if (!title) return;
      setDiagrams((rows) => rows.map((row) => (row.id === diagram.id ? { ...row, title } : row)));
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    startTransition(async () => {
      const removed = await deleteDiagram(target.id);
      if (removed) setDiagrams((rows) => rows.filter((row) => row.id !== target.id));
      setPendingDelete(null);
    });
  }

  return (
    <div className="min-h-0 w-full flex-1 overflow-y-auto py-6 px-3 sm:px-3">
      <DiagramCreateForm
        name={name}
        error={error}
        pending={pending}
        onName={(value) => {
          setName(value);
          if (error) setError("");
        }}
        onSubmit={onCreate}
      />
      {diagrams.length === 0 ? (
        <EmptyState
          title="No diagrams yet"
          body="Start a diagram, then add rectangles, labels, and connectors on the canvas."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {diagrams.map((diagram) => (
            <DiagramRow
              key={diagram.id}
              diagram={diagram}
              editing={editingId === diagram.id}
              draft={draft}
              onDraft={setDraft}
              onBeginRename={() => {
                setEditingId(diagram.id);
                setDraft(diagram.title);
              }}
              onCommit={() => commitRename(diagram)}
              onCancel={() => setEditingId(null)}
              onDelete={() => setPendingDelete(diagram)}
            />
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this diagram?"
        body={pendingDelete ? `${pendingDelete.title} will be removed.` : ""}
        confirmLabel="Delete"
        tone="danger"
        busy={pending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
