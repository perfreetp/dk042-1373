import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "amber" | "good" | "bad" | "muted";

const tones: Record<Tone, string> = {
  amber: "border-amber/40 text-amber bg-amber/10",
  good: "border-good/40 text-good bg-good/10",
  bad: "border-bad/40 text-bad bg-bad/10",
  muted: "border-line text-slatey bg-panel-2/60",
};

const dot: Record<Tone, string> = {
  amber: "bg-amber",
  good: "bg-good",
  bad: "bg-bad",
  muted: "bg-slatey",
};

export function StatusChip({
  tone = "muted",
  children,
  pulse,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "chip border bg-panel-2/40 font-display",
        tones[tone],
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span
            className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-70", dot[tone])}
          />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dot[tone])} />
      </span>
      {children}
    </span>
  );
}

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-slatey", className)}>
      <span className="h-3 w-1 rounded-full bg-amber" />
      {children}
    </div>
  );
}
