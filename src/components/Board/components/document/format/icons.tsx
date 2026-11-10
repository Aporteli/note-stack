export function AlignIcon({ mode }: { mode: "left" | "center" | "right" | "justify" }) {
  const widths = mode === "justify" ? [12, 12, 12] : mode === "center" ? [8, 12, 8] : mode === "right" ? [8, 12, 6] : [12, 8, 10];
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      {widths.map((width, index) => (
        <rect
          key={index}
          x={mode === "right" ? 14 - width : mode === "center" ? (16 - width) / 2 : 2}
          y={3 + index * 4}
          width={width}
          height="1.6"
          rx="0.8"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

export function ListIcon({ ordered }: { ordered: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      {ordered ? (
        <text x="1" y="7" fontSize="6" fontFamily="sans-serif">
          1
        </text>
      ) : (
        <circle cx="3" cy="4" r="1.2" />
      )}
      {ordered ? (
        <text x="1" y="13" fontSize="6" fontFamily="sans-serif">
          2
        </text>
      ) : (
        <circle cx="3" cy="11" r="1.2" />
      )}
      <rect x="6" y="3.2" width="8" height="1.5" rx="0.7" />
      <rect x="6" y="10.2" width="8" height="1.5" rx="0.7" />
    </svg>
  );
}

export function IndentIcon({ out = false }: { out?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M2 3.5h12M8 6.5h6M8 9.5h6M2 12.5h12" />
      <path d={out ? "M5.5 8H2.5M4 6.5 2.5 8 4 9.5" : "M2.5 8h3M4 6.5 5.5 8 4 9.5"} />
    </svg>
  );
}

export function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M3 13.5 12.5 4" />
      <path d="M5 12.5h6" />
      <path d="M6.2 4.2h3.2L12 8.2 8.2 12H5L6.2 4.2z" />
    </svg>
  );
}
