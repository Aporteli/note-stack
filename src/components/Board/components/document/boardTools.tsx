"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { MutableRefObject, ReactNode } from "react";

type BoardToolsValue = {
  host: HTMLDivElement | null;
  setHost: (el: HTMLDivElement | null) => void;
  editor: HTMLElement | null;
  bindEditor: (element: HTMLElement | null, sync: () => void) => void;
  syncEditor: () => void;
  /** Switches the open document to typing before a format command. */
  prepareRef: MutableRefObject<() => void>;
};

const BoardToolsContext = createContext<BoardToolsValue | null>(null);

export function BoardToolsProvider({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [editor, setEditor] = useState<HTMLElement | null>(null);
  const syncRef = useRef<() => void>(() => {});
  const prepareRef = useRef<() => void>(() => {});

  const bindEditor = useCallback((element: HTMLElement | null, sync: () => void) => {
    syncRef.current = sync;
    setEditor((current) => (current === element ? current : element));
  }, []);

  const syncEditor = useCallback(() => {
    syncRef.current();
  }, []);

  return (
    <BoardToolsContext.Provider
      value={{ host, setHost, editor, bindEditor, syncEditor, prepareRef }}
    >
      {children}
    </BoardToolsContext.Provider>
  );
}

export function useBoardTools() {
  const value = useContext(BoardToolsContext);
  if (!value) throw new Error("useBoardTools must be used within BoardToolsProvider");
  return value;
}
