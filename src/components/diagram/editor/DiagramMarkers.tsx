export function DiagramMarkers() {
  return (
    <defs>
      <pattern id="diagram-dots" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill="var(--color-line-strong)" />
      </pattern>
      <marker id="diagram-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-ink)" />
      </marker>
      <marker id="diagram-arrow-hot" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-orchid-700)" />
      </marker>
    </defs>
  );
}
