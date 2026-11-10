export function NoteIcon({ size = 15 }: { size?: number }) {
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
      <path d="M4.5 3.5h7.2L15.5 7.3V16.5h-11V3.5z" />
      <path d="M11.5 3.7V7.5h3.8" />
      <path d="M7 11h6M7 13.5h4" />
    </svg>
  );
}
