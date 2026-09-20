import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "onCanvas" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** Shown instead of children while a transition is pending. */
  loading?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  block?: boolean;
};

const sizeClass: Record<Size, string> = {
  sm: "ns-btn--sm",
  md: "",
  lg: "ns-btn--lg",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  leading,
  trailing,
  block = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`ns-btn ns-btn--${variant} ${sizeClass[size]} ${
        block ? "w-full" : ""
      } ${className}`}
    >
      {loading ? <Spinner /> : leading}
      {children}
      {!loading && trailing}
    </button>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Required — icon-only controls always carry a name. */
  label: string;
  onCanvas?: boolean;
};

export function IconButton({
  label,
  onCanvas = false,
  className = "",
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={`ns-iconbtn ${
        onCanvas
          ? "text-ink-invert/80 hover:bg-white/20 hover:text-ink-invert"
          : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
