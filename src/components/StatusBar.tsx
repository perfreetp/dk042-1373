import { Bus, ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useClock } from "@/hooks/useClock";
import { cn } from "@/lib/utils";

export function Clock({ className }: { className?: string }) {
  const { time, date } = useClock();
  return (
    <div className={cn("flex items-baseline gap-2 font-display", className)}>
      <span className="num text-2xl font-semibold tabular-nums text-slate-100">{time}</span>
      <span className="num text-[0.7rem] tracking-wider text-slatey">{date}</span>
    </div>
  );
}

interface StatusBarProps {
  title: string;
  subtitle?: ReactNode;
  onBack?: () => void;
  left?: ReactNode;
  right?: ReactNode;
  accent?: "amber" | "good" | "bad" | "default";
}

export function StatusBar({ title, subtitle, onBack, left, right, accent = "amber" }: StatusBarProps) {
  const accentColor =
    accent === "good" ? "text-good" : accent === "bad" ? "text-bad" : accent === "default" ? "text-amber" : "text-amber";
  return (
    <header className="flex items-center gap-4 px-6 py-4 hairline-top border-b border-hairline">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber/40 bg-amber/10 text-amber">
          <Bus className="h-5 w-5" />
        </div>
        <div className="hidden flex-col leading-tight sm:flex">
          <span className="font-display text-sm font-semibold tracking-wide text-slate-100">
            校车安全确认
          </span>
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-slatey">
            onboard safety console
          </span>
        </div>
      </div>

      <div className="mx-1 h-8 w-px bg-line" />

      {left ? <div className="flex shrink-0 items-center gap-2">{left}</div> : null}

      {onBack ? (
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onBack}
          className="flex items-center gap-1 rounded-lg border border-line bg-panel-2/60 px-3 py-2 text-sm text-slatey transition hover:text-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
          返回
        </motion.button>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full bg-current", accentColor)} />
          <h1 className="truncate font-display text-lg font-semibold tracking-wide text-slate-100">
            {title}
          </h1>
        </div>
        {subtitle ? <div className="mt-0.5 truncate text-xs text-slatey">{subtitle}</div> : null}
      </div>

      <div className="flex items-center gap-4">
        {right}
        <Clock />
      </div>
    </header>
  );
}
