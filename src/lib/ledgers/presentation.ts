import type { TransactionKind } from "./constants";

export const TRANSACTION_KIND_BADGE: Record<TransactionKind, string> = {
  received: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
  paid: "border-rose-500/25 bg-rose-500/10 text-rose-200",
  lent: "border-amber-500/25 bg-amber-500/10 text-amber-200",
  borrowed: "border-sky-500/25 bg-sky-500/10 text-sky-200",
};
