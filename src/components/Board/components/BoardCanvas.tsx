import type { ReactNode, Ref } from "react";

type Props = {
  width: number;
  height: number;
  /** Ref forwarded to the inner canvas element — used for drop coordinate math. */
  canvasRef?: Ref<HTMLDivElement>;
  onBackgroundPointerDown?: () => void;
  onFileDrop?: (files: File[], clientX: number, clientY: number) => void;
  children: ReactNode;
};

export function BoardCanvas({
  width,
  height,
  canvasRef,
  onBackgroundPointerDown,
  onFileDrop,
  children,
}: Props) {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div className="ns-scroll relative h-full w-full overflow-auto [overflow-anchor:none]">
        <div
          ref={canvasRef}
          className="relative"
          style={{ width, height }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              onBackgroundPointerDown?.();
            }
          }}
          onDragOver={(event) => {
            if (event.dataTransfer.types.includes("Files")) event.preventDefault();
          }}
          onDrop={(event) => {
            const list = event.dataTransfer.files;
            if (list.length === 0) return;
            event.preventDefault();
            onFileDrop?.(Array.from(list), event.clientX, event.clientY);
          }}
        >
          {/* Dot grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50
              [background-image:radial-gradient(circle_at_1px_1px,rgba(71,85,105,0.12)_1px,transparent_0)]
              [background-size:24px_24px]"
          />

          {/* Soft top fade */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-20
              bg-gradient-to-b from-[#f6f5f2] to-transparent"
          />

          {children}
        </div>
      </div>
    </div>
  );
}