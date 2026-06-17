import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "amber" | "good" | "outline" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  amber:
    "bg-amber text-ink border-amber shadow-[0_10px_30px_-12px_rgba(255,179,0,0.7),inset_0_1px_0_rgba(255,255,255,0.45)]",
  good:
    "bg-good/15 text-good border-good/60 shadow-[0_10px_30px_-16px_rgba(46,194,126,0.7),inset_0_1px_0_rgba(46,194,126,0.25)]",
  outline: "bg-panel-2/70 text-slate-100 border-line",
  ghost: "bg-transparent text-slatey border-transparent hover:text-slate-100",
  danger:
    "bg-bad/15 text-bad border-bad/60 shadow-[0_10px_30px_-16px_rgba(255,90,95,0.7),inset_0_1px_0_rgba(255,90,95,0.2)]",
};

interface BigButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  icon?: ReactNode;
  children?: ReactNode;
  fullWidth?: boolean;
}

export function BigButton({
  variant = "amber",
  icon,
  children,
  fullWidth,
  className,
  disabled,
  ...props
}: BigButtonProps) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96, y: 1 }}
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-3 rounded-2xl border px-7 py-4 font-display text-lg font-semibold tracking-wide no-tap",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {icon ? <span className="flex shrink-0 items-center">{icon}</span> : null}
      {children}
    </motion.button>
  );
}
