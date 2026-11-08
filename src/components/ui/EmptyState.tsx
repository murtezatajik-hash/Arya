import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-line bg-surface/40 px-6 py-10 text-center">
      {icon ? (
        <span
          aria-hidden="true"
          className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent"
        >
          {icon}
        </span>
      ) : null}
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
