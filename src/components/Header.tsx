export default function Header() {
  return (
    <header className="border-b border-ink/10 bg-paper/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-plum text-ink-invert shadow-sm">
            {/* This SVG from IconStack in your codebase */}
            <svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  <path
    d="M6.5 5.5H17.5C18.3284 5.5 19 6.17157 19 7V16.5C19 17.3284 18.3284 18 17.5 18H6.5C5.67157 18 5 17.3284 5 16.5V7C5 6.17157 5.67157 5.5 6.5 5.5Z"
    fill="currentColor"
  />

  <path
    d="M8 3.5H18C19.3807 3.5 20.5 4.61929 20.5 6V15"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  />

  <path
    d="M8 9H16"
    stroke="white"
    strokeWidth="1.7"
    strokeLinecap="round"
  />

  <path
    d="M8 13H13"
    stroke="white"
    strokeWidth="1.7"
    strokeLinecap="round"
  />
</svg>
       
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Note-Stack
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-soft">Your workspace</span>
          <button
            type="button"
            className="rounded-md bg-plum px-4 py-2 text-sm font-semibold text-ink-invert shadow hover:bg-plum/80 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}