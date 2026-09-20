"use client";

import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { IconSearch } from "./Icons";

type FieldShellProps = {
  label?: string;
  hint?: string;
  error?: string;
  children: (props: { id: string; describedBy?: string }) => ReactNode;
};

/** Wraps any control with a label, hint and error in one consistent stack. */
export function Field({ label, hint, error, children }: FieldShellProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const message = error ?? hint;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-meta font-semibold text-ink-soft">
          {label}
        </label>
      )}
      {children({ id, describedBy: message ? helpId : undefined })}
      {message && (
        <p
          id={helpId}
          className={`text-meta ${error ? "text-danger" : "text-ink-faint"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function Input({ invalid, className = "", ...rest }: InputProps) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={`ns-field ${invalid ? "ns-field--invalid" : ""} ${className}`}
    />
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function Textarea({ invalid, className = "", ...rest }: TextareaProps) {
  return (
    <textarea
      {...rest}
      aria-invalid={invalid || undefined}
      className={`ns-field resize-y leading-6 ${
        invalid ? "ns-field--invalid" : ""
      } ${className}`}
    />
  );
}

/** Board-level search. Sits on the plum canvas, so it inverts. */
export function SearchField({
  onCanvas = false,
  className = "",
  ...rest
}: InputProps & { onCanvas?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      <IconSearch
        size={18}
        className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 ${
          onCanvas ? "text-ink-invert/70" : "text-ink-faint"
        }`}
      />
      <input
        type="search"
        {...rest}
        className={`ns-field pl-9 ${
          onCanvas
            ? "border-white/25 bg-white/15 text-ink-invert placeholder:text-ink-invert/60 focus:border-white/60 focus:shadow-none"
            : ""
        }`}
      />
    </div>
  );
}
