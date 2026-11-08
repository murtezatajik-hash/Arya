import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-line/80 bg-surface/75 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_32px_100px_-40px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-8">
      <span
        aria-hidden="true"
        className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
      />
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <p className="text-sm leading-6 text-muted">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}
