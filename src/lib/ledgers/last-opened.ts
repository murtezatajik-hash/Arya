export const LAST_OPENED_LEDGER_KEY = "arya:last-opened-ledger";

export function rememberLastOpenedLedger(id: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LAST_OPENED_LEDGER_KEY, id);
  } catch {
    // Storage can be unavailable in private browsing or locked profiles.
  }
}

export function readLastOpenedLedger(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(LAST_OPENED_LEDGER_KEY);
  } catch {
    return null;
  }
}
