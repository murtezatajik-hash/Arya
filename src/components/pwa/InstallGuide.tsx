"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

const DISMISS_KEY = "arya:pwa-install-guide-dismissed";
const DISMISS_EVENT = "arya:pwa-install-guide-dismissed";

type StandaloneNavigator = Navigator & {
  standalone?: boolean;
};

function subscribe(onChange: () => void) {
  const displayMode = window.matchMedia("(display-mode: standalone)");

  displayMode.addEventListener("change", onChange);
  window.addEventListener("storage", onChange);
  window.addEventListener(DISMISS_EVENT, onChange);

  return () => {
    displayMode.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
    window.removeEventListener(DISMISS_EVENT, onChange);
  };
}

function isVisible() {
  const navigatorWithStandalone = window.navigator as StandaloneNavigator;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true;

  if (isStandalone) {
    return false;
  }

  try {
    return window.localStorage.getItem(DISMISS_KEY) !== "1";
  } catch {
    return true;
  }
}

function isVisibleOnServer() {
  return false;
}

export function InstallGuide() {
  const t = useTranslations("pwa.installGuide");
  const visible = useSyncExternalStore(
    subscribe,
    isVisible,
    isVisibleOnServer,
  );

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // If storage is unavailable, the guide simply returns for this visit.
    }

    window.dispatchEvent(new Event(DISMISS_EVENT));
  }

  if (!visible) {
    return null;
  }

  return (
    <aside
      aria-label={t("title")}
      className="mt-5 flex items-start gap-3 rounded-2xl border border-accent/25 bg-accent/5 p-4 sm:p-5"
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-base font-bold text-accent"
      >
        آ
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{t("title")}</p>
        <p className="mt-1 text-xs leading-6 text-muted">{t("body")}</p>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="size-4"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </aside>
  );
}
