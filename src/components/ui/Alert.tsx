import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AlertProps = {
  tone?: "error" | "success";
  children: ReactNode;
};

export function Alert({ tone = "error", children }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-3.5 py-3 text-sm leading-6",
        tone === "error"
          ? "border-accent-strong/30 bg-accent-strong/10 text-rose-100"
          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
      )}
    >
      {children}
    </div>
  );
}
