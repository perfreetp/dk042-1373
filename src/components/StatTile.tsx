import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "amber" | "good" | "bad";

const valueTone: Record<Tone, string> = {
  default: "text-slate-100",
  amber: "text-amber",
  good: "text-good",
  bad: "text-bad",
};

export function StatTile({
  label,
  value,
  unit,
  tone = "default",
  icon,
  hint,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  tone?: Tone;
  icon?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel-2/40 p-3">
      <div className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-slatey">
        {icon ? <span className="text-slatey">{icon}</span> : null}
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={cn("num text-2xl font-semibold tabular-nums", valueTone[tone])}>{value}</span>
        {unit ? <span className="text-xs text-slatey">{unit}</span> : null}
      </div>
      {hint ? <div className="mt-0.5 text-[0.65rem] text-slatey-dim">{hint}</div> : null}
    </div>
  );
}
