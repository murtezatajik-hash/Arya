export default function CalendarSettingsLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="space-y-6"
    >
      <span className="sr-only">Loading calendar settings…</span>
      <div className="h-4 w-28 animate-pulse rounded bg-surface-raised" />
      <div className="space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-surface-raised" />
        <div className="h-9 w-56 animate-pulse rounded bg-surface-raised" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded bg-surface" />
      </div>
      <div className="h-48 animate-pulse rounded-2xl border border-line/70 bg-surface/60" />
      <div className="h-36 animate-pulse rounded-2xl border border-line/70 bg-surface/60" />
      <div className="h-32 animate-pulse rounded-2xl border border-line/70 bg-surface/60" />
    </div>
  );
}
