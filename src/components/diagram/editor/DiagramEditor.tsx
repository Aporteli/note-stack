"use client";

import { useState } from "react";
import { DiagramHeader } from "@/components/diagram/editor/DiagramHeader";
import { DiagramStage } from "@/components/diagram/editor/DiagramStage";
import { useDiagramSave } from "@/components/diagram/editor/useDiagramSave";
import type { DiagramRecord } from "@/components/diagram/types";

export function DiagramEditor({ diagram }: { diagram: DiagramRecord }) {
  const [document, setDocument] = useState(diagram.document);
  const status = useDiagramSave(diagram.id, document);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper text-ink">
      <DiagramHeader id={diagram.id} title={diagram.title} status={status} />
      <DiagramStage title={diagram.title} document={document} onDocument={setDocument} />
    </main>
  );
}
