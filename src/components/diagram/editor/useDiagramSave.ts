"use client";

import { useEffect, useRef, useState } from "react";
import { saveDiagram } from "@/app/diagrams/actions/saveDiagram";
import type { DiagramDocument } from "@/components/diagram/types";

export type SaveStatus = "saved" | "saving" | "error";

export function useDiagramSave(id: string, document: DiagramDocument): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const skip = useRef(true);
  const latest = useRef(document);
  const dirty = useRef(false);
  latest.current = document;

  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    dirty.current = true;
    setStatus("saving");
    const timer = window.setTimeout(() => {
      const snapshot = latest.current;
      void saveDiagram(id, snapshot).then((ok) => {
        if (latest.current !== snapshot) return;
        dirty.current = !ok;
        setStatus(ok ? "saved" : "error");
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [id, document]);

  useEffect(() => {
    return () => {
      if (!dirty.current) return;
      void saveDiagram(id, latest.current);
    };
  }, [id]);

  return status;
}
