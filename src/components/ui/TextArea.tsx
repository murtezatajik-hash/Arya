"use client";

import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextArea({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: TextAreaProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const message = error ?? hint;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fieldId}
        className="block text-xs font-medium text-muted"
      >
        {label}
      </label>
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? `${fieldId}-message` : undefined}
        className={cn(
          "min-h-24 w-full resize-y rounded-xl border border-line bg-surface px-3.5 py-3 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-muted/50 focus:border-accent/60 focus:ring-2 focus:ring-accent/15",
          error && "border-accent-strong/60 focus:border-accent-strong",
          className,
        )}
        {...props}
      />
      {message ? (
        <p
          id={`${fieldId}-message`}
          className={cn(
            "text-[11px] leading-5",
            error ? "text-accent" : "text-muted/70",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
