import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-strong text-white shadow-[0_14px_36px_-16px_rgba(225,29,72,0.9)] hover:bg-accent-hover",
  secondary:
    "border border-line bg-surface-raised text-ink hover:border-accent/40 hover:text-accent",
  ghost: "text-muted hover:text-ink",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  className?: string,
) {
  return cn(base, variants[variant], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({
  variant = "primary",
  loading = false,
  loadingLabel,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClassName(variant, className)}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {loading ? (loadingLabel ?? children) : children}
    </button>
  );
}
