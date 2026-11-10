export function LinkIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8.2 11.8a3.2 3.2 0 0 0 4.6.1l2.1-2.1a3.2 3.2 0 0 0-4.5-4.5L9.3 6.4" />
      <path d="M11.8 8.2a3.2 3.2 0 0 0-4.6-.1L5.1 10.2a3.2 3.2 0 0 0 4.5 4.5l1.1-1.1" />
    </svg>
  );
}
